import { ILivestream, IProject } from "@/interfaces/interfaces";
import { getDb } from "@/server/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

interface ILivestreamBody {
  title: string;
  channelName: string;
  description: string;
  scheduledAt: Date;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = getDb();
    const { slug } = await params;
    await db.createCollection("livestreams").catch(() => {});

    const body: ILivestreamBody = await request.json();
    const { title, channelName, description, scheduledAt } = body;

    if (!title || !scheduledAt || !description) {
      return NextResponse.json({
        message: "title, scheduledAt, description is required!",
        status: 400,
      });
    }

    const project = await db
      .collection<IProject>("projects")
      .findOne({ slug: slug });

    if (!project?._id) {
      return NextResponse.json({
        message: "Project not found",
        status: 404,
      });
    }

    const newLivestream: Omit<ILivestream, '_id'> = {
      title,
      channelName: channelName ? channelName : `stream - ${project._id}`,
      description: description ? description : "-",
      scheduledAt,
      isLive: false,
      viewerCount: 0,
      projectId: project._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existedLs = await db.collection<ILivestream>("livestreams").findOne({
      projectId: project?._id,
    });
    if (existedLs) {
      throw new Error("You already scheduled a stream in this project");
    }

    const result = await db.collection("livestreams").insertOne(newLivestream);

    return NextResponse.json({
      success: true,
      livestream: {
        id: result.insertedId,
        channelName: channelName,
      },
    });
  } catch (error: unknown) {
    console.error("Error scheduling stream:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to schedule livestream",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = getDb();
    const { slug } = await params;
    const project = await db.collection<IProject>("projects").findOne({
      slug: slug,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const stream = await db
      .collection<ILivestream>("livestreams")
      .findOne({ projectId: project._id });

    if (stream) {
      return NextResponse.json(stream);
    }

    return NextResponse.json(
      { error: "No livestream found for this project" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Stream isn't found:", error);
    return NextResponse.json(
      { error: "Failed to fetch livestream" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Parse request body
    let body = {};
    try {
      const bodyText = await request.text();
      if (bodyText) {
        body = JSON.parse(bodyText);
      }
    } catch {
      console.log("No request body or invalid JSON, using default start behavior");
    }

    // Check if this is a viewer count update or stream start
    if (body && typeof body === 'object' && 'viewerCount' in body) {
      // Viewer count update - simplified
      const { viewerCount } = body as {
        viewerCount?: number;
      };

      const updateData: Partial<ILivestream> = {
        updatedAt: new Date(),
      };

      if (viewerCount !== undefined) {
        updateData.viewerCount = Math.max(0, viewerCount);
      }

      await db.collection<ILivestream>("livestreams").updateOne(
        { _id: livestream._id },
        { $set: updateData }
      );

      // Simplified Pusher event
      try {
        await pusherServer.trigger(
          `project-${slug}-livestream`,
          'viewer-count-updated',
          {
            viewerCount: updateData.viewerCount || livestream.viewerCount,
          }
        );
      } catch (pusherError) {
        console.error('Pusher error:', pusherError);
      }

      return NextResponse.json({
        success: true,
        message: "Viewer count updated",
        viewerCount: updateData.viewerCount || livestream.viewerCount,
      });
    } else {
      // Stream start - simplified
      const now = new Date();
      const scheduledTime = new Date(livestream.scheduledAt);
      const isEarlyStart = now < scheduledTime;

      // Update livestream with essential fields only
      await db.collection<ILivestream>("livestreams").updateOne(
        { _id: livestream._id },
        {
          $set: {
            isLive: true,
            actualStartTime: new Date(),
            startedEarly: isEarlyStart,
            updatedAt: new Date(),
          },
        }
      );

      // Keep existing project update unchanged
      await db.collection<IProject>("projects").updateOne(
        { _id: project._id },
        {
          $set: {
            isLive: true,
            updatedAt: new Date(),
          },
        }
      );

      // Simplified Pusher event
      try {
        await pusherServer.trigger(
          `project-${slug}-livestream`,
          'livestream-started',
          {
            isLive: true,
            actualStartTime: new Date(),
            startedEarly: isEarlyStart,
            channelName: livestream.channelName,
            title: livestream.title,
          }
        );
        console.log('Pusher event triggered for livestream start:', slug);
      } catch (pusherError) {
        console.error('Pusher error:', pusherError);
      }

      return NextResponse.json({
        success: true,
        message: `Channel: ${livestream.channelName} started successfully`,
        startedEarly: isEarlyStart,
      });
    }
  } catch (error) {
    console.error("Error updating livestream:", error);
    return NextResponse.json(
      { error: "Failed to update livestream" },
      { status: 500 }
    );
  }
}
