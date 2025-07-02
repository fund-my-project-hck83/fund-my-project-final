"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Video } from "lucide-react";
import { ILivestream } from "@/interfaces/interfaces";
import ScheduleLivestream from "@/components/ScheduleLivestream";
import AgoraLivestream from "@/components/AgoraLivestream";
import { pusherClient } from "@/lib/pusher";

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

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString();
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
    
    channel.bind('livestream-started', (data: {
      isLive: boolean;
      actualStartTime: Date;
      startedEarly: boolean;
      channelName: string;
      title: string;
    }) => {
      console.log('Livestream started via Pusher:', data);
      setIsStreaming(true);
      
      // Update livestream data if we have it
      if (livestream) {
        setLivestream(prev => prev ? {
          ...prev,
          isLive: data.isLive,
          actualStartTime: data.actualStartTime,
          startedEarly: data.startedEarly
        } : null);
      }
    });

    channel.bind('livestream-stopped', () => {
      console.log('Livestream stopped via Pusher');
      setIsStreaming(false);
      
      // Update livestream data if we have it
      if (livestream) {
        setLivestream(prev => prev ? {
          ...prev,
          isLive: false
        } : null);
      }
    });

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

        // Auto-start stream when time is up
        if (timeLeft <= 0) {
          setIsStreaming(true);
        }
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
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startedEarly: true }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Stream started early:', result);
        // The Pusher event will handle updating the UI
      } else {
        console.error('Failed to start stream early');
      }
    } catch (error) {
      console.error('Error starting stream early:', error);
    }
  };



  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading livestream information...</p>
        </div>
      </div>
    );
  }

  // Render logic based on state
  if (isStreaming) {
    return (
      <AgoraLivestream
        isHost={isOwner}
        userId={userId}
        userName={userName}
        channelName={livestream?.channelName || ""}
      />
    );
  }

  if (livestream && !isStreamTime) {
    return (
      <div className="space-y-4">
        {/* Countdown Display */}
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Livestream Scheduled
          </h3>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {formatCountdown(timeUntilStream)}
          </div>
          <p className="text-blue-700">
            &quot;{livestream.title}&quot; by {userName}
          </p>

          {canStartStream && isOwner && (
            <div className="mt-4">
              <button
                onClick={handleStartStreamEarly}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Stream Now
              </button>
              <p className="text-xs text-blue-600 mt-2">
                💡 You can start early and viewers will join immediately
              </p>
            </div>
          )}
        </div>

        {/* Schedule Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Stream Details</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <strong>Title:</strong> {livestream.title}
            </p>
            <p>
              <strong>Channel:</strong> {livestream.channelName}
            </p>
            <p>
              <strong>Scheduled:</strong>{" "}
              {formatDateTime(livestream.scheduledAt)}
            </p>
            {livestream.description && (
              <p>
                <strong>Description:</strong> {livestream.description}
              </p>
            )}
            {canStartStream && (
              <p className="text-xs text-green-600 mt-2">
                ⏰ Early start available (within 2 hours of scheduled time)
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No livestream scheduled
  if (isOwner) {
    // Owner view - can schedule livestream
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Livestream Scheduled
          </h3>
          <p className="text-gray-600 mb-4">
            Schedule a livestream to engage with your supporters
          </p>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Livestream Scheduled Yet
          </h3>
          <p className="text-gray-600 mb-4">
            The project creator hasn&apos;t scheduled a livestream yet.
          </p>

          {isLoggedIn ? (
            <div className="text-sm text-gray-500">
              <p>
                You&apos;ll be able to join the stream when it&apos;s scheduled.
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              <p>Log in to join livestreams when they&apos;re scheduled.</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
