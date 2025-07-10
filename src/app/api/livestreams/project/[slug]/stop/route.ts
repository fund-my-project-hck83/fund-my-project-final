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

    // Check if not live
    if (!livestream.isLive) {
      return NextResponse.json(
        { error: "Livestream is not live" },
        { status: 400 }
      );
    }

    // Check if project is not live (safety check)
    if (!project.isLive) {
      return NextResponse.json(
        { error: "Project does not have an active livestream" },
        { status: 400 }
      );
    }

    // Stop the livestream
    await db.collection<ILivestream>("livestreams").updateOne(
      { _id: livestream._id },
      {
        $set: {
          isLive: false,
          updatedAt: new Date(),
        },
      }
    );

    // Update project status
    await db.collection<IProject>("projects").updateOne(
      { _id: project._id },
      {
        $set: {
          isLive: false,
          updatedAt: new Date(),
        },
      }
    );

    // Trigger Pusher event
    try {
      await pusherServer.trigger(
        `project-${slug}-livestream`,
        'livestream-stopped',
        { isLive: false }
      );
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
    }

    return NextResponse.json({
      success: true,
      message: "Livestream stopped successfully",
    });
  } catch (error) {
    console.error("Error stopping livestream:", error);
    return NextResponse.json(
      { error: "Failed to stop livestream" },
      { status: 500 }
    );
  }
} 