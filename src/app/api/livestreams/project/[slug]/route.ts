import { ILivestream, IProject } from "@/interfaces/interfaces";
import { getDb } from "@/server/config/mongodb";
import { NextRequest, NextResponse } from "next/server";

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

    // Check for existing livestreams: block if any exists for this project
    const existedLs = await db.collection<ILivestream>("livestreams").findOne({
      projectId: project?._id,
    });
    if (existedLs) {
      throw new Error("You already have a scheduled or active stream in this project");
    }

    // Validate scheduledAt is in the future (UTC) for scheduled streams
    if (!newLivestream.isLive && new Date(scheduledAt) <= new Date()) {
      return NextResponse.json({
        message: "Scheduled date must be in the future",
        status: 400,
      });
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
      // Auto-delete expired streams instead of just hiding them
      const now = new Date();
      const scheduledTime = new Date(stream.scheduledAt);
      
      // If stream is not live and scheduled time has passed, delete it from database
      if (!stream.isLive && scheduledTime < now) {
        await db.collection<ILivestream>("livestreams").deleteOne({ _id: stream._id });
        return NextResponse.json(
          { error: "No livestream found for this project" },
          { status: 404 }
        );
      }
      
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

    // Don't allow editing live streams
    if (livestream.isLive) {
      return NextResponse.json(
        { error: "Cannot edit a live stream" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description, scheduledAt } = body;

    // Only allow updating basic livestream info
    const updateData: Partial<ILivestream> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (scheduledAt !== undefined) {
      const newScheduledAt = new Date(scheduledAt);
      // Validate scheduled date is in the future
      if (newScheduledAt <= new Date()) {
        return NextResponse.json(
          { error: "Scheduled date must be in the future" },
          { status: 400 }
        );
      }
      updateData.scheduledAt = newScheduledAt;
    }

    await db.collection<ILivestream>("livestreams").updateOne(
      { _id: livestream._id },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: "Livestream updated successfully",
    });
  } catch (error) {
    console.error("Error updating livestream:", error);
    return NextResponse.json(
      { error: "Failed to update livestream" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Don't allow deleting live streams
    if (livestream.isLive) {
      return NextResponse.json(
        { error: "Cannot cancel a live stream. Use stop endpoint instead." },
        { status: 400 }
      );
    }

    // Delete the livestream
    await db.collection<ILivestream>("livestreams").deleteOne({
      _id: livestream._id,
    });

    return NextResponse.json({
      success: true,
      message: "Livestream cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling livestream:", error);
    return NextResponse.json(
      { error: "Failed to cancel livestream" },
      { status: 500 }
    );
  }
}
