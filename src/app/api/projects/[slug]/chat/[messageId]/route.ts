import { getDb } from "@/server/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { pusherServer } from "@/lib/pusher";

// Utility function to validate project exists
const validateProject = async (slug: string) => {
  const db = getDb();
  const project = await db.collection("projects").findOne({ slug });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

// GET - Get specific message
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string; messageId: string }> }
) {
  try {
    const { slug, messageId } = await context.params;

    // Validate project exists
    const project = await validateProject(slug);

    const db = getDb();

    // Get specific message
    const message = await db.collection("chats").findOne({
      _id: new ObjectId(messageId),
      projectId: project._id,
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: message._id.toString(),
      projectId: message.projectId.toString(),
      userId: message.userId.toString(),
      message: message.message,
      timestamp: message.timestamp,
      userName: message.userName,
      userAvatar: message.userAvatar,
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

// Utility function to get user from API
const getUserFromApi = async (request: NextRequest) => {
  try {
    const userResponse = await fetch(`${request.nextUrl.origin}/api/user`, {
      headers: request.headers
    });
    const userData = await userResponse.json();
    return {
      userName: userData.user?.username || null,
      userId: userData.user?.userId || null,
    };
  } catch (error) {
    console.error("Error getting user from API:", error);
    return { userName: null, userId: null };
  }
};

// DELETE - Delete specific message (owner only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string; messageId: string }> }
) {
  try {
    const { slug, messageId } = await context.params;
    
    // Get user from API for verification
    const { userName: headerUserName, userId: headerUserId } = await getUserFromApi(request);
    
    // Verify user is authenticated
    if (!headerUserName) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Validate project exists
    const project = await validateProject(slug);
    
    // Check if user is project owner
    if (project.ownerId.toString() !== headerUserId) {
      return NextResponse.json(
        { error: "Only project owner can delete messages" },
        { status: 403 }
      );
    }
    
    const db = getDb();
    
    // Delete the message
    const result = await db.collection("chats").deleteOne({
      _id: new ObjectId(messageId),
      projectId: project._id,
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    
    // Pusher event for real-time updates
    try {
      await pusherServer.trigger(
        `project-${slug}-chat`,
        "message-deleted",
        { messageId }
      );
    } catch (pusherError) {
      console.error("Pusher error:", pusherError);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
