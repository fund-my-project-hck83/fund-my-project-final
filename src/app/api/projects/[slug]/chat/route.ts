import { getDb } from "@/server/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { pusherServer } from "@/lib/pusher";

// Utility function to get user from header
const getUserFromHeader = async (request: NextRequest) => {
  try {
    const userName = request.headers.get("x-user-username");
    const userId = request.headers.get("x-user-id");

    return {
      userName: userName || null,
      userId: userId || null,
    };
  } catch (error) {
    console.error("Error getting user from header:", error);
    return { userName: null, userId: null };
  }
};

// Utility function to validate project exists
const validateProject = async (slug: string) => {
  const db = getDb();
  const project = await db.collection("projects").findOne({ slug });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

// GET - Fetch chat messages
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    // Validate project exists
    const project = await validateProject(slug);

    // Get query parameters for pagination/filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const before = searchParams.get("before"); // timestamp for pagination

    const db = getDb();

    // Build query
    const query: { projectId: string | ObjectId; timestamp?: { $lt: Date } } = {
      projectId: project._id,
    };

    // Add timestamp filter for pagination
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    // Get chat messages with pagination
    const messages = await db
      .collection("chats")
      .find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Reverse to get chronological order for display
    const sortedMessages = messages.reverse();

    // Transform messages to match IChatResponse interface
    const transformedMessages = sortedMessages.map((msg) => ({
      _id: msg._id.toString(),
      projectId: msg.projectId.toString(),
      userId: msg.userId.toString(),
      message: msg.message,
      timestamp: msg.timestamp,
      userName: msg.userName,
      userAvatar: msg.userAvatar,
    }));

    // Get total count for pagination info
    const totalCount = await db
      .collection("chats")
      .countDocuments({ projectId: project._id });

    return NextResponse.json({
      messages: transformedMessages,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);

    if (error instanceof Error && error.message === "Project not found") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Send new message
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const { message, userName, userAvatar } = body;

    // Validate required fields
    if (!message || !userName) {
      return NextResponse.json(
        {
          error: "Message and userName are required",
        },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.trim().length > 1000) {
      return NextResponse.json(
        {
          error: "Message too long. Maximum 1000 characters.",
        },
        { status: 400 }
      );
    }

    // Get user from header for verification
    const { userName: headerUserName, userId: headerUserId } =
      await getUserFromHeader(request);

    // Verify user is authenticated
    if (!headerUserName) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Verify userName matches header (security check)
    if (headerUserName !== userName) {
      return NextResponse.json(
        {
          error: "User verification failed",
        },
        { status: 403 }
      );
    }

    // Validate project exists
    const project = await validateProject(slug);

    const db = getDb();

    // Rate limiting: Check if user sent message recently
    const recentMessage = await db.collection("chats").findOne({
      projectId: project._id,
      userName: userName,
      timestamp: { $gte: new Date(Date.now() - 10000) },
    });

    if (recentMessage) {
      return NextResponse.json(
        {
          error: "Please wait a few seconds before sending another message",
        },
        { status: 429 }
      );
    }

    // Create chat message
    const chatMessage = {
      projectId: project._id,
      userId: headerUserId ? new ObjectId(headerUserId) : new ObjectId(),
      message: message.trim(),
      timestamp: new Date(),
      userName,
      userAvatar:
        userAvatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          userName
        )}&background=random`,
    };

    // Insert the chat message
    const result = await db.collection("chats").insertOne(chatMessage);

    if (!result.acknowledged) {
      return NextResponse.json(
        {
          error: "Failed to save message",
        },
        { status: 500 }
      );
    }

    // Transform the message for response and Pusher
    const transformedMessage = {
      _id: result.insertedId.toString(),
      projectId: project._id.toString(),
      userId: chatMessage.userId.toString(),
      message: chatMessage.message,
      timestamp: chatMessage.timestamp,
      userName: chatMessage.userName,
      userAvatar: chatMessage.userAvatar,
    };

    // Trigger Pusher event for real-time updates
    try {
      await pusherServer.trigger(
        `project-${slug}-chat`,
        "new-message",
        transformedMessage
      );
    } catch (pusherError) {
      console.error("Pusher error:", pusherError);
    }

    return NextResponse.json({
      success: true,
      messageId: result.insertedId.toString(),
      message: transformedMessage,
    });
  } catch (error) {
    console.error("Error posting chat message:", error);

    if (error instanceof Error && error.message === "Project not found") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to post message",
      },
      { status: 500 }
    );
  }
}
