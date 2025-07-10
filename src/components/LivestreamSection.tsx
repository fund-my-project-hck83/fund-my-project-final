"use client";

import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Video, Edit, X } from "lucide-react";
import { ILivestream } from "@/interfaces/interfaces";
import ScheduleLivestream from "@/components/ScheduleLivestream";
import { pusherClient } from "@/lib/pusher";
import LoadingSpinner from "./LoadingSpinner";

// Dynamic import to prevent Agora SDK from being bundled initially
const AgoraLivestream = lazy(() => import("@/components/AgoraLivestream"));

interface LivestreamSectionProps {
  projectSlug: string;
  isOwner: boolean;
  userId: string;
  userName: string;
  isLoggedIn: boolean;
}

// Simplified livestream states
type LivestreamState = "no-stream" | "scheduled" | "live";

// Helper functions
function formatCountdown(milliseconds: number): string {
  if (milliseconds <= 0) return "Ready to start";

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

function getStreamState(livestream: ILivestream | null): LivestreamState {
  if (!livestream) return "no-stream";
  if (livestream.isLive) return "live";
  return "scheduled";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Fetch livestream data
  const fetchLivestreamData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/livestreams/project/${projectSlug}`);

      if (response.ok) {
        const data: ILivestream = await response.json();
        setLivestream(data);
      } else {
        // No livestream found or expired
        setLivestream(null);
      }
    } catch (error) {
      console.error("Failed to fetch livestream data:", error);
      setLivestream(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  // Update countdown every second for scheduled streams
  useEffect(() => {
    if (livestream && !livestream.isLive) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const scheduledTime = new Date(livestream.scheduledAt).getTime();
        const timeLeft = scheduledTime - now;
        setCountdown(timeLeft);

        // Don't auto-refresh when countdown reaches 0
        // Let the user manually start or let auto-delete handle expired streams
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [livestream]);

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
      (data: { isLive: boolean; channelName: string; title: string }) => {
        console.log("Livestream started via Pusher:", data);
        
        // Update livestream data
        if (livestream) {
          setLivestream((prev) =>
            prev ? { ...prev, isLive: data.isLive } : null
          );
        }
      }
    );

    channel.bind("livestream-stopped", (data: { isLive: boolean; livestreamDeleted?: boolean }) => {
      console.log("Livestream stopped via Pusher:", data);
      
      // If livestream was deleted, clear the livestream data
      if (data.livestreamDeleted) {
        setLivestream(null);
      } else {
        // Update livestream data
        if (livestream) {
          setLivestream((prev) =>
            prev ? { ...prev, isLive: false } : null
          );
        }
      }
    });

    // Real-time viewer count updates
    channel.bind("viewer-count-updated", (data: { viewerCount: number }) => {
      console.log("Viewer count updated via Pusher:", data);

      if (livestream) {
        setLivestream((prev) =>
          prev ? { ...prev, viewerCount: data.viewerCount } : null
        );
      }
    });

    return () => {
      pusherClient.unsubscribe(`project-${projectSlug}-livestream`);
    };
  }, [projectSlug, livestream]);

  // Handle actions
  const handleStartStream = async () => {
    if (!isOwner) return;

    try {
      const response = await fetch(
        `/api/livestreams/project/${projectSlug}/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        // State will be updated via Pusher
        setLivestream((prev) => (prev ? { ...prev, isLive: true } : prev));
      } else {
        const errorData = await response.json();
        console.error("Failed to start stream:", errorData.error);
        alert(errorData.error || "Failed to start stream");
      }
    } catch (error) {
      console.error("Error starting stream:", error);
      alert("Failed to start stream");
    }
  };

  const handleCancelStream = async () => {
    if (!isOwner || !livestream) return;

    if (confirm("Are you sure you want to cancel this livestream?")) {
      try {
        const response = await fetch(`/api/livestreams/project/${projectSlug}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setLivestream(null);
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to cancel stream");
        }
      } catch (error) {
        console.error("Error cancelling stream:", error);
        alert("Failed to cancel stream");
      }
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading livestream..." />;
  }

  const streamState = getStreamState(livestream);

  // Render based on simplified states
  switch (streamState) {
    case "live":
      return (
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
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
      );

    case "scheduled":
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-300 p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Livestream Scheduled
            </h3>
            <div className={`text-2xl font-medium mb-2 ${
              countdown <= 0 ? "text-green-600" : "text-blue-600"
            }`}>
              {formatCountdown(countdown)}
            </div>
            <p className="text-blue-700 font-normal">
              &quot;{livestream?.title}&quot; by {userName}
            </p>
            
            {livestream?.description && (
              <p className="text-sm text-blue-600 mt-2 font-normal">
                {livestream.description}
              </p>
            )}

            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">
                  {livestream?.viewerCount || 0} waiting to join
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="mt-4 space-y-3">
                {countdown <= 0 && (
                  <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">
                      ✅ Your stream is ready to start!
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleStartStream}
                    className={`px-6 py-2 rounded-full transition-colors font-normal ${
                      countdown <= 0 
                        ? "bg-green-600 text-white hover:bg-green-700 text-lg px-8 py-3" 
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {countdown <= 0 ? "🔴 Start Stream Now" : "Start Stream Now"}
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors font-normal flex items-center gap-1 justify-center"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleCancelStream}
                    className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors font-normal flex items-center gap-1 justify-center"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!isOwner && (
              <div className="mt-4">
                <p className="text-sm text-blue-600 font-normal">
                  {countdown <= 0 
                    ? (isLoggedIn 
                        ? "Waiting for the host to start the stream..."
                        : "Log in to join when the stream starts"
                      )
                    : (isLoggedIn 
                        ? "You'll be able to join when the stream starts"
                        : "Log in to join the livestream when it starts"
                      )
                  }
                </p>
              </div>
            )}
          </div>

          {/* Edit Modal */}
          {isOwner && (
            <ScheduleLivestream
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              projectSlug={projectSlug}
              onScheduleSuccess={() => {
                setShowEditModal(false);
                fetchLivestreamData();
              }}
              editMode={true}
              existingLivestream={livestream}
            />
          )}
        </div>
      );

    case "no-stream":
    default:
      if (isOwner) {
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

              <div className="flex justify-center">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors font-normal"
                >
                  Schedule Livestream
                </button>
              </div>
            </div>

            <ScheduleLivestream
              isOpen={showScheduleModal}
              onClose={() => setShowScheduleModal(false)}
              projectSlug={projectSlug}
              onScheduleSuccess={() => {
                setShowScheduleModal(false);
                fetchLivestreamData();
              }}
            />
          </div>
        );
      } else {
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
                    You&apos;ll be able to join when a stream is scheduled.
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
}
