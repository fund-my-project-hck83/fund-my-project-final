import { ILivestream, IProject } from "@/interfaces/interfaces";
import { getDb } from "@/server/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = getDb();
    const { slug } = await params;

    // Find the project by slug
    const project = await db.collection<IProject>("projects").findOne({
      slug: slug,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Find the livestream for this project
    const livestream = await db.collection<ILivestream>("livestreams").findOne({
      projectId: project._id,
    });

    if (!livestream) {
      return NextResponse.json(
        { error: "Livestream not found" },
        { status: 404 }
      );
    }

    // Check if already live
    if (livestream.isLive) {
      return NextResponse.json(
        { error: "Livestream is already live" },
        { status: 400 }
      );
    }

    // Check if scheduled time has passed (prevent starting expired streams)
    const now = new Date();
    const scheduledTime = new Date(livestream.scheduledAt);
    if (scheduledTime < now) {
      return NextResponse.json(
        { error: "Scheduled time has passed. Please reschedule your livestream." },
        { status: 400 }
      );
    }

    // Check if project is already live (safety check)
    if (project.isLive) {
      return NextResponse.json(
        { error: "Project already has an active livestream" },
        { status: 400 }
      );
    }

    // Start the livestream
    await db.collection<ILivestream>("livestreams").updateOne(
      { _id: livestream._id },
      {
        $set: {
          isLive: true,
          updatedAt: new Date(),
        },
      }
    );

    // Update project status
    await db.collection<IProject>("projects").updateOne(
      { _id: project._id },
      {
        $set: {
          isLive: true,
          updatedAt: new Date(),
        },
      }
    );

    // Trigger Pusher event
    try {
      await pusherServer.trigger(
        `project-${slug}-livestream`,
        'livestream-started',
        {
          isLive: true,
          channelName: livestream.channelName,
          title: livestream.title,
        }
      );
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
    }

    return NextResponse.json({
      success: true,
      message: "Livestream started successfully",
      channelName: livestream.channelName,
    });
  } catch (error) {
    console.error("Error starting livestream:", error);
    return NextResponse.json(
      { error: "Failed to start livestream" },
      { status: 500 }
    );
  }
} 