"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Video,
  Users,
  Play,
  Square,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// Simple type aliases to avoid conflicts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AgoraClientType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AgoraTrackType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AgoraUserType = any;

interface AgoraLivestreamProps {
  isHost: boolean;
  userId: string;
  userName: string;
  channelName: string;
  projectSlug: string;
  onViewerCountChange?: (count: number) => void;
}

// Simplified stream states
type StreamState = 
  | "idle"           // Initial state
  | "connecting"     // Connecting to Agora
  | "preview"        // Host previewing camera (host only)
  | "live"           // Stream is live
  | "error";         // Error state

export default function AgoraLivestream({
  isHost,
  userId,
  channelName,
  projectSlug,
  onViewerCountChange,
}: AgoraLivestreamProps) {
  // Simplified state management
  const [streamState, setStreamState] = useState<StreamState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);

  // Host controls (client-side only)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  // Agora refs
  const agoraClientRef = useRef<AgoraClientType | null>(null);
  const localAudioTrackRef = useRef<AgoraTrackType | null>(null);
  const localVideoTrackRef = useRef<AgoraTrackType | null>(null);
  const remoteUsersRef = useRef<AgoraUserType[]>([]);

  // Agora configuration
  const agoraConfig = {
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID,
    channel: channelName,
    token: null,
    uid: userId,
  };

  // Update viewer count in database
  const updateViewerCount = async (newCount: number) => {
    try {
      const response = await fetch(`/api/livestreams/project/${projectSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewerCount: newCount }),
      });

      if (response.ok) {
        console.log("✅ Viewer count updated:", newCount);
      } else {
        console.error("❌ Failed to update viewer count");
      }
    } catch (error) {
      console.error("❌ Error updating viewer count:", error);
    }
  };

  // Initialize Agora client
  const initializeAgoraClient = async () => {
    try {
      console.log("🔧 Initializing Agora client...");

      // Check if App ID is set
      if (!agoraConfig.appId || agoraConfig.appId === "your-agora-app-id") {
        throw new Error("Agora App ID not configured");
      }

      // Dynamic import to avoid SSR issues
      const AgoraRTC = await import("agora-rtc-sdk-ng");
      console.log("✅ Agora SDK loaded successfully");

      // Create client
      agoraClientRef.current = AgoraRTC.default.createClient({
        mode: "live",
        codec: "h264",
      });

      // Set client role
      await agoraClientRef.current.setClientRole(isHost ? "host" : "audience");

      // Set up event listeners
      agoraClientRef.current.on("user-published", handleUserPublished);
      agoraClientRef.current.on("user-unpublished", handleUserUnpublished);
      agoraClientRef.current.on("user-joined", handleUserJoined);
      agoraClientRef.current.on("user-left", handleUserLeft);

      console.log("✅ Agora client initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Agora client:", error);
      throw error;
    }
  };

  // Handle user published (when someone starts streaming)
  const handleUserPublished = async (user: AgoraUserType, mediaType: string) => {
    console.log("🎥 User published:", user.uid, mediaType);

    try {
      await agoraClientRef.current?.subscribe(user, mediaType);

      if (mediaType === "video" && videoRef.current) {
        user.videoTrack?.play(videoRef.current);
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }

      // Update viewer count
      const newViewerCount = remoteUsersRef.current.length + 1;
      setViewerCount(newViewerCount);
      onViewerCountChange?.(newViewerCount);
      await updateViewerCount(newViewerCount);
    } catch (error) {
      console.error("❌ Failed to subscribe to user:", error);
    }
  };

  // Handle user unpublished
  const handleUserUnpublished = (user: AgoraUserType) => {
    console.log("🔇 User unpublished:", user.uid);
    remoteUsersRef.current = remoteUsersRef.current.filter((u) => u.uid !== user.uid);
    
    const newViewerCount = Math.max(0, remoteUsersRef.current.length);
    setViewerCount(newViewerCount);
    onViewerCountChange?.(newViewerCount);
    updateViewerCount(newViewerCount);
  };

  // Handle user joined
  const handleUserJoined = (user: AgoraUserType) => {
    console.log("👋 User joined:", user.uid);
    remoteUsersRef.current.push(user);
    
    const newViewerCount = remoteUsersRef.current.length;
    setViewerCount(newViewerCount);
    onViewerCountChange?.(newViewerCount);
    updateViewerCount(newViewerCount);
  };

  // Handle user left
  const handleUserLeft = (user: AgoraUserType) => {
    console.log("👋 User left:", user.uid);
    remoteUsersRef.current = remoteUsersRef.current.filter((u) => u.uid !== user.uid);
    
    const newViewerCount = Math.max(0, remoteUsersRef.current.length);
    setViewerCount(newViewerCount);
    onViewerCountChange?.(newViewerCount);
    updateViewerCount(newViewerCount);
  };

  // Join channel
  const joinChannel = async () => {
    try {
      console.log("🚀 Joining channel:", channelName);
      
      const uid = await agoraClientRef.current?.join(
        agoraConfig.appId,
        agoraConfig.channel,
        agoraConfig.token,
        agoraConfig.uid
      );

      console.log("✅ Joined channel successfully with UID:", uid);
      return true;
    } catch (error) {
      console.error("❌ Failed to join channel:", error);
      throw error;
    }
  };

  // Initialize local stream (HOST ONLY)
  const initializeLocalStream = async () => {
    if (!isHost) return;

    try {
      console.log("🎥 Initializing local stream...");

      // Get camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      console.log("📹 Camera stream obtained successfully");

      // Display local video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        localStreamRef.current = stream;
        await videoRef.current.play();
      }

      // Create Agora tracks
      const AgoraRTC = await import("agora-rtc-sdk-ng");
      localAudioTrackRef.current = await AgoraRTC.default.createMicrophoneAudioTrack();
      localVideoTrackRef.current = await AgoraRTC.default.createCameraVideoTrack();

      console.log("✅ Local stream initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize local stream:", error);
      throw error;
    }
  };

  // Publish local stream (HOST ONLY)
  const publishLocalStream = async () => {
    if (!isHost || !localAudioTrackRef.current || !localVideoTrackRef.current) return;

    try {
      await agoraClientRef.current?.publish([
        localAudioTrackRef.current,
        localVideoTrackRef.current,
      ]);

      // Ensure host sees their own camera feed
      if (isHost && localVideoTrackRef.current && videoRef.current) {
        localVideoTrackRef.current.play(videoRef.current);
      }
      return true;
    } catch (error) {
      console.error("❌ Failed to publish local stream:", error);
      throw error;
    }
  };

  // Guarantee host preview: play local video track if live
  useEffect(() => {
    if (
      isHost &&
      streamState === "live" &&
      localVideoTrackRef.current &&
      videoRef.current
    ) {
      localVideoTrackRef.current.play(videoRef.current);
    }
  }, [isHost, streamState]);

  // Start stream (unified for host and viewer)
  const startStream = async () => {
    try {
      setStreamState("connecting");
      setError(null);

      // Initialize Agora client
      await initializeAgoraClient();

      if (isHost) {
        // Host flow: Initialize stream → Join channel → Publish
        await initializeLocalStream();
        await joinChannel();
        await publishLocalStream();
        setStreamState("live");
      } else {
        // Viewer flow: Join channel → Wait for host
        await joinChannel();
        setStreamState("live");
      }

      console.log("🎉 Stream started successfully!");
    } catch (error) {
      console.error("❌ Failed to start stream:", error);
      setError(error instanceof Error ? error.message : "Failed to start stream");
      setStreamState("error");
    }
  };

  // Stop stream
  const stopStream = useCallback(async () => {
    try {
      console.log("🛑 Stopping stream...");

      // Stop local tracks
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }

      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Leave channel
      if (agoraClientRef.current) {
        await agoraClientRef.current.leave();
        agoraClientRef.current = null;
      }

      // Reset state
      setStreamState("idle");
      setViewerCount(0);
      onViewerCountChange?.(0);
      remoteUsersRef.current = [];

      console.log("✅ Stream stopped successfully");
    } catch (error) {
      console.error("❌ Error stopping stream:", error);
    }
  }, [onViewerCountChange]);

  // Host controls
  const toggleAudio = async () => {
    if (!localAudioTrackRef.current || !isHost) return;

    try {
      if (isAudioEnabled) {
        await localAudioTrackRef.current.setEnabled(false);
        setIsAudioEnabled(false);
      } else {
        await localAudioTrackRef.current.setEnabled(true);
        setIsAudioEnabled(true);
      }
    } catch (error) {
      console.error("❌ Failed to toggle audio:", error);
    }
  };

  const toggleVideo = async () => {
    if (!localVideoTrackRef.current || !isHost) return;

    try {
      if (isVideoEnabled) {
        await localVideoTrackRef.current.setEnabled(false);
        setIsVideoEnabled(false);
      } else {
        await localVideoTrackRef.current.setEnabled(true);
        setIsVideoEnabled(true);
      }
    } catch (error) {
      console.error("❌ Failed to toggle video:", error);
    }
  };

  const toggleScreenSharing = async () => {
    if (!isHost) return;

    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => track.stop());
          screenStreamRef.current = null;
        }
        if (localVideoTrackRef.current) {
          await localVideoTrackRef.current.setEnabled(true);
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenStreamRef.current = stream;
        if (localVideoTrackRef.current) {
          await localVideoTrackRef.current.setEnabled(false);
        }
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error("❌ Failed to toggle screen sharing:", error);
    }
  };

  const refreshCamera = async () => {
    if (!isHost) return;

    try {
      console.log("🔄 Refreshing camera...");

      // Stop existing stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      // Get new stream
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });

      // Update video element
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        localStreamRef.current = newStream;
        await videoRef.current.play();
      }

      console.log("✅ Camera refreshed successfully");
    } catch (error) {
      console.error("❌ Failed to refresh camera:", error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopStream();
    };
  }, [stopStream]);

  // Render based on stream state
  if (streamState === "connecting") {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">
            {isHost ? "Starting stream..." : "Connecting to stream..."}
          </p>
        </div>
      </div>
    );
  }

  if (streamState === "error") {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-2">Connection Error</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setStreamState("idle");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (streamState === "idle") {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <div className="mb-4">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {isHost ? "Ready to Go Live" : "Join Livestream"}
            </h3>
            <p className="text-gray-600 mt-1">
              {isHost 
                ? "Click the button below to start your livestream"
                : "Click to join the livestream and watch the broadcast"
              }
            </p>
          </div>

          <button
            onClick={startStream}
            className={`flex items-center gap-2 mx-auto px-6 py-3 rounded-lg text-white transition-colors ${
              isHost 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <Play className="w-4 h-4" />
            {isHost ? "Start Livestream" : "Join Stream"}
          </button>

          <p className="text-xs text-gray-500 mt-3">
            {isHost 
              ? "💡 Your stream will be visible to viewers once you start broadcasting"
              : "🔄 Connecting to Agora.io servers..."
            }
          </p>
        </div>
      </div>
    );
  }

  // Live stream UI
  if (streamState === "live") {
    return (
      <div className="space-y-4">
        {/* Stream Controls */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-red-600">LIVE</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{viewerCount} viewers</span>
            </div>
          </div>
          {isHost ? (
            <button
              onClick={stopStream}
              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              End Stream
            </button>
          ) : (
            <button
              onClick={async () => {
                await stopStream();
                setStreamState("idle");
              }}
              className="flex items-center gap-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              Leave Stream
            </button>
          )}
        </div>

        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isHost} // Mute for host to avoid feedback
            className="w-full h-96 object-cover"
          />

          {/* Connection Status */}
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
          </div>

          {/* Viewer placeholder */}
          {!isHost && !videoRef.current?.srcObject && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Waiting for host...</p>
                <p className="text-sm opacity-75 mt-1">
                  The stream will appear here when the host starts broadcasting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Host Controls */}
        {isHost && (
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={toggleAudio}
              className={`px-4 py-2 rounded-full font-medium shadow focus:outline-none focus:ring-2 transition-all duration-150 ${
                isAudioEnabled
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-gray-400"
              }`}
            >
              {isAudioEnabled ? "Mute" : "Unmute"}
            </button>
            <button
              onClick={toggleVideo}
              className={`px-4 py-2 rounded-full font-medium shadow focus:outline-none focus:ring-2 transition-all duration-150 ${
                isVideoEnabled
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-gray-400"
              }`}
            >
              {isVideoEnabled ? "Stop Video" : "Start Video"}
            </button>
            <button
              onClick={toggleScreenSharing}
              className={`px-4 py-2 rounded-full font-medium shadow focus:outline-none focus:ring-2 transition-all duration-150 ${
                isScreenSharing
                  ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-400"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"
              }`}
            >
              {isScreenSharing ? "Stop Sharing" : "Share Screen"}
            </button>
            <button
              onClick={refreshCamera}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-150"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }
}
