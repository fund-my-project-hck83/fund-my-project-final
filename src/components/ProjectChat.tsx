"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageCircle, Crown, Trash2, Lock } from "lucide-react";
import Image from "next/image";
import { IChatResponse } from "@/interfaces/interfaces";
import { pusherClient } from "@/lib/pusher";
import LoadingSpinner from "./LoadingSpinner";

interface ProjectChatProps {
  projectSlug: string;
  isOwner: boolean;
}

export default function ProjectChat({
  projectSlug,
  isOwner,
}: ProjectChatProps) {
  const [messages, setMessages] = useState<IChatResponse[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<{
    username: string | null;
    userId: string | null;
  } | null>(null);

  // Get user from headers
  const getCurrentUser = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
    } catch {
      return null;
    }
  };

  // Initialize user authentication
  useEffect(() => {
    const initUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setIsLoading(false);
    };
    initUser();
  }, []);

  // Improved scroll to bottom function
  const scrollToBottom = useCallback((force = false) => {
    if (!messagesEndRef.current) return;

    // Only scroll if it's forced (user sending message) or if it's a new message from others
    if (force) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  }, []);

  // Fetch messages only if user is authenticated
  const fetchMessages = useCallback(async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/projects/${projectSlug}/chat`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        // Don't auto-scroll on initial load
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [projectSlug, currentUser]);

  // Set up Pusher subscription only if user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    fetchMessages();

    const channel = pusherClient.subscribe(`project-${projectSlug}-chat`);

    channel.bind("new-message", (newMessage: IChatResponse) => {
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some((msg) => msg._id === newMessage._id);
        if (messageExists) {
          return prev;
        }
        return [...prev, newMessage];
      });
      // Don't auto-scroll for new messages from others
    });

    return () => {
      pusherClient.unsubscribe(`project-${projectSlug}-chat`);
    };
  }, [projectSlug, fetchMessages, currentUser]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || !currentUser) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/projects/${projectSlug}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          userName: currentUser.username,
          userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            currentUser.username || "User"
          )}&background=random`,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        // Auto-scroll when user sends a message
        scrollToBottom(true);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Delete message (owner only)
  const deleteMessage = async (messageId: string) => {
    if (!isOwner || !currentUser) return;

    try {
      const response = await fetch(
        `/api/projects/${projectSlug}/chat/${messageId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner inline size="md" message="Loading chat..." />;
  }
  // Show view-only message
  if (!currentUser) {
    return (
      <div className="bg-white border border-black rounded-lg">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-black">
                Project Discussion
              </h2>
              <p className="text-sm text-gray-600 font-normal">
                {messages.length} messages • View Only
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 text-gray-600 rounded-full text-sm font-normal">
            <Lock className="w-4 h-4" />
            View Only
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-normal">
                No messages yet. Be the first to start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                  <Image
                    src={
                      message.userAvatar ||
                      "https://ui-avatars.com/api/?name=User&background=random"
                    }
                    alt={message.userName}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-black text-sm">
                      {message.userName}
                    </span>
                    <span className="text-xs text-gray-500 font-normal">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm font-normal leading-relaxed">
                    {message.message}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* View-Only Message Input */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-normal"
            >
              <Lock className="w-4 h-4" />
              Login to Participate
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black rounded-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-black">
              Project Discussion
            </h2>
            <p className="text-sm text-gray-600 font-normal">
              {messages.length} messages •{" "}
              {isOwner ? "Owner Mode" : "Public Mode"}
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-full text-sm font-normal">
            <Crown className="w-4 h-4" />
            Owner
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-normal">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                <Image
                  src={
                    message.userAvatar ||
                    "https://ui-avatars.com/api/?name=User&background=random"
                  }
                  alt={message.userName}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-black text-sm">
                    {message.userName}
                  </span>
                  <span className="text-xs text-gray-500 font-normal">
                    {formatTime(message.timestamp)}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 text-sm font-normal leading-relaxed">
                  {message.message}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 mt-1">
            <Image
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser.username || "User"
              )}&background=random`}
              alt={currentUser.username || "User"}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-14 border border-black rounded-full resize-none focus:outline-none focus:border-gray-800 transition-colors font-normal min-h-[44px] flex items-center"
              rows={1}
              disabled={isSending}
              style={{ paddingTop: "11px", paddingBottom: "11px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="absolute right-1 top-1 bottom-1 w-10 h-10 bg-black text-white rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-normal mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
