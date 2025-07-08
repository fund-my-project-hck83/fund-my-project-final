"use client";

import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Video } from "lucide-react";
import { ILivestream } from "@/interfaces/interfaces";
import ScheduleLivestream from "@/components/ScheduleLivestream";
import { pusherClient } from "@/lib/pusher";

// Dynamic import to prevent Agora SDK from being bundled initially
const AgoraLivestream = lazy(() => import("@/components/AgoraLivestream"));

interface LivestreamSectionProps {
  projectSlug: string;
  isOwner: boolean;
  userId: string;
  userName: string;
  isLoggedIn: boolean;
}

// Helper functions
function formatCountdown(milliseconds: number): string {
  if (milliseconds <= 0) return "Starting now...";

  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function LivestreamSection({
  projectSlug,
  isOwner,
  userId,
  userName,
  isLoggedIn,
}: LivestreamSectionProps) {
  const [livestream, setLivestream] = useState<ILivestream | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [timeUntilStream, setTimeUntilStream] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch livestream data
  const fetchLivestreamData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/livestreams/project/${projectSlug}`);

      if (response.ok) {
        const data: ILivestream = await response.json();
        setLivestream(data);

        // If stream is already live, set streaming state
        if (data.isLive) {
          setIsStreaming(true);
        }
      } else {
        // No livestream found, which is fine
        setLivestream(null);
      }
    } catch (error) {
      console.error("Failed to fetch livestream data:", error);
      setLivestream(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  // Fetch livestream data on mount
  useEffect(() => {
    fetchLivestreamData();
  }, [fetchLivestreamData]);

  // Set up Pusher subscription for real-time livestream updates
  useEffect(() => {
    if (!projectSlug) return;

    const channel = pusherClient.subscribe(`project-${projectSlug}-livestream`);

    channel.bind(
      "livestream-started",
      (data: {
        isLive: boolean;
        actualStartTime: Date;
        startedEarly: boolean;
        channelName: string;
        title: string;
        // Removed hostConnected, streamQuality - not needed
      }) => {
        console.log("Livestream started via Pusher:", data);
        setIsStreaming(true);

        // Update livestream data if we have it
        if (livestream) {
          setLivestream((prev) =>
            prev
              ? {
                  ...prev,
                  isLive: data.isLive,
                  actualStartTime: data.actualStartTime,
                  startedEarly: data.startedEarly,
                }
              : null
          );
        }
      }
    );

    channel.bind("livestream-stopped", () => {
      console.log("Livestream stopped via Pusher");
      setIsStreaming(false);

      // Update livestream data if we have it
      if (livestream) {
        setLivestream((prev) =>
          prev
            ? {
                ...prev,
                isLive: false,
              }
            : null
        );
      }
    });

    // Simplified real-time viewer count updates
    channel.bind(
      "viewer-count-updated",
      (data: {
        viewerCount: number;
        // Removed hostConnected, streamQuality, isScreenSharing - not needed
      }) => {
        console.log("Viewer count updated via Pusher:", data);

        // Update livestream data with real-time info
        if (livestream) {
          setLivestream((prev) =>
            prev
              ? {
                  ...prev,
                  viewerCount: data.viewerCount,
                }
              : null
          );
        }
      }
    );

    return () => {
      pusherClient.unsubscribe(`project-${projectSlug}-livestream`);
    };
  }, [projectSlug, livestream]);

  // Countdown timer
  useEffect(() => {
    if (livestream && !isStreaming) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const streamTime = new Date(livestream.scheduledAt).getTime();
        const timeLeft = streamTime - now;

        setTimeUntilStream(timeLeft);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [livestream, isStreaming]);

  const canStartStream = timeUntilStream <= 2 * 60 * 60 * 1000; // 2 hours in ms
  const isStreamTime = timeUntilStream <= 0;

  // Handle early start
  const handleStartStreamEarly = async () => {
    if (!isOwner || !canStartStream) return;

    try {
      const response = await fetch(`/api/livestreams/project/${projectSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startedEarly: true }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Stream started early:", result);
        // The Pusher event will handle updating the UI
      } else {
        console.error("Failed to start stream early");
      }
    } catch (error) {
      console.error("Error starting stream early:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-normal">
            Loading livestream information...
          </p>
        </div>
      </div>
    );
  }

  // Render logic based on state
  if (isStreaming) {
    return (
      <div className="space-y-4">
        {/* Unified Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 rounded-t-lg bg-green-50 border-b border-green-200 mb-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              LIVE
            </span>
            <span className="text-gray-700 text-sm flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v4m0 0l-3 3m3-3l3 3m-3-3H9"
                />
              </svg>
              {livestream?.viewerCount || 0} watching
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-xs text-green-700 font-medium">
              Connected
            </span>
          </div>
        </div>

        {/* Video Area - Simplified */}
        <div className="relative w-full max-w-3xl mx-auto aspect-video bg-black rounded-xl shadow-lg overflow-hidden">
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            }
          >
            <AgoraLivestream
              isHost={isOwner}
              userId={userId}
              userName={userName}
              channelName={livestream?.channelName || ""}
              projectSlug={projectSlug}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  if (livestream && !isStreamTime) {
    return (
      <div className="space-y-4">
        {/* Countdown Display */}
        <div className="bg-blue-50 border border-blue-300 p-6 rounded-lg text-center">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Livestream Scheduled
          </h3>
          <div className="text-2xl font-medium text-blue-600 mb-2">
            {formatCountdown(timeUntilStream)}
          </div>
          <p className="text-blue-700 font-normal">
            &quot;{livestream.title}&quot; by {userName}
          </p>

          {/* Real-time viewer count */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">
                {livestream.viewerCount || 0} waiting to join
              </span>
            </div>
          </div>

          {canStartStream && isOwner && (
            <div className="mt-4">
              <button
                onClick={handleStartStreamEarly}
                className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors font-normal"
              >
                Start Stream Now
              </button>
              <p className="text-xs text-blue-600 mt-2 font-normal">
                💡 You can start early and viewers will join immediately
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No livestream scheduled
  if (isOwner) {
    // Owner view - can schedule livestream
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg text-center">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">
            No Livestream Scheduled
          </h3>
          <p className="text-gray-600 mb-4 font-normal">
            Schedule a livestream to engage with your supporters
          </p>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors font-normal"
          >
            Schedule Livestream
          </button>
        </div>

        <ScheduleLivestream
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          projectSlug={projectSlug}
          onScheduleSuccess={() => {
            setShowScheduleModal(false);
            fetchLivestreamData(); // Refresh data
          }}
        />
      </div>
    );
  } else {
    // Viewer view - shows information about no scheduled stream
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg text-center">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">
            No Livestream Scheduled Yet
          </h3>
          <p className="text-gray-600 mb-4 font-normal">
            The project creator hasn&apos;t scheduled a livestream yet.
          </p>

          {isLoggedIn ? (
            <div className="text-sm text-gray-500">
              <p className="font-normal">
                You&apos;ll be able to join the stream when it&apos;s scheduled.
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              <p className="font-normal">
                Log in to join livestreams when they&apos;re scheduled.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
