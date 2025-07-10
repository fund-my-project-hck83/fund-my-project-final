import { ILivestream } from "@/interfaces/interfaces";
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
    const project = await db.collection("projects").findOne({
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

    // Parse request body
    const body = await request.json();
    const { viewerCount } = body;

    if (typeof viewerCount !== 'number') {
      return NextResponse.json(
        { error: "viewerCount must be a number" },
        { status: 400 }
      );
    }

    // Validate viewer count range
    if (viewerCount < 0 || viewerCount > 10000) {
      return NextResponse.json(
        { error: "viewerCount must be between 0 and 10000" },
        { status: 400 }
      );
    }

    // Update viewer count
    const newViewerCount = Math.max(0, viewerCount);
    await db.collection<ILivestream>("livestreams").updateOne(
      { _id: livestream._id },
      {
        $set: {
          viewerCount: newViewerCount,
          updatedAt: new Date(),
        },
      }
    );

    // Trigger Pusher event
    try {
      await pusherServer.trigger(
        `project-${slug}-livestream`,
        'viewer-count-updated',
        {
          viewerCount: newViewerCount,
        }
      );
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
    }

    return NextResponse.json({
      success: true,
      message: "Viewer count updated",
      viewerCount: newViewerCount,
    });
  } catch (error) {
    console.error("Error updating viewer count:", error);
    return NextResponse.json(
      { error: "Failed to update viewer count" },
      { status: 500 }
    );
  }
} 