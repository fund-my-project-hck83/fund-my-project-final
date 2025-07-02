"use client";

import { useState, useEffect, useRef } from "react";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Users,
  Play,
  Square,
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
  onViewerCountChange?: (count: number) => void;
}

export default function AgoraLivestream({
  isHost,
  userId,
  channelName,
  onViewerCountChange,
}: AgoraLivestreamProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  // Track states (HOST ONLY)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
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
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || "your-agora-app-id",
    channel: channelName,
    token: null, // For testing, we'll use null token (not recommended for production)
    uid: userId,
  };

  // Initialize Agora client
  const initializeAgoraClient = async () => {
    try {
      console.log("🔧 Initializing Agora client...");
      console.log("📋 Config:", {
        appId: agoraConfig.appId,
        channel: agoraConfig.channel,
        uid: agoraConfig.uid,
        isHost,
      });

      // Check if App ID is set
      if (agoraConfig.appId === "your-agora-app-id") {
        throw new Error(
          "Agora App ID not configured. Please set NEXT_PUBLIC_AGORA_APP_ID in .env.local"
        );
      }

      // Dynamic import to avoid SSR issues
      const AgoraRTC = await import("agora-rtc-sdk-ng");
      console.log("✅ Agora SDK loaded successfully");

      // Create client
      agoraClientRef.current = AgoraRTC.default.createClient({
        mode: "live",
        codec: "vp8",
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
      setError(
        `Failed to initialize streaming client: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return false;
    }
  };

  // Handle user published (when someone starts streaming)
  const handleUserPublished = async (
    user: AgoraUserType,
    mediaType: string
  ) => {
    console.log("🎥 User published:", user.uid, mediaType);

    try {
      // Subscribe to the remote user
      await agoraClientRef.current?.subscribe(user, mediaType);

      if (mediaType === "video") {
        // Display remote video
        if (remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
      }
      if (mediaType === "audio") {
        // Play remote audio
        user.audioTrack?.play();
      }

      // Update viewer count
      const newViewerCount = remoteUsersRef.current.length + 1;
      setViewerCount(newViewerCount);
      onViewerCountChange?.(newViewerCount);
    } catch (error) {
      console.error("❌ Failed to subscribe to user:", error);
    }
  };

  // Handle user unpublished (when someone stops streaming)
  const handleUserUnpublished = (user: AgoraUserType) => {
    console.log("🔇 User unpublished:", user.uid);

    // Remove from remote users
    remoteUsersRef.current = remoteUsersRef.current.filter(
      (u) => u.uid !== user.uid
    );

    // Update viewer count
    const newViewerCount = Math.max(0, remoteUsersRef.current.length);
    setViewerCount(newViewerCount);
    onViewerCountChange?.(newViewerCount);
  };

  // Handle user joined
  const handleUserJoined = (user: AgoraUserType) => {
    console.log("👋 User joined:", user.uid);
    remoteUsersRef.current.push(user);

    // Update viewer count
    const newViewerCount = remoteUsersRef.current.length;
    setViewerCount(newViewerCount);
    onViewerCountChange?.(newViewerCount);
  };

  // Handle user left
  const handleUserLeft = (user: AgoraUserType) => {
    console.log("👋 User left:", user.uid);

    // Remove from remote users
    remoteUsersRef.current = remoteUsersRef.current.filter(
      (u) => u.uid !== user.uid
    );

    // Update viewer count
    const newViewerCount = Math.max(0, remoteUsersRef.current.length);
    setViewerCount(newViewerCount);
    onViewerCountChange?.(newViewerCount);
  };

  // Join channel
  const joinChannel = async () => {
    try {
      console.log("🚀 Joining channel:", channelName);
      console.log("🔗 Joining with config:", {
        appId: agoraConfig.appId,
        channel: agoraConfig.channel,
        token: agoraConfig.token,
        uid: agoraConfig.uid,
      });

      // Join the channel
      const uid = await agoraClientRef.current?.join(
        agoraConfig.appId,
        agoraConfig.channel,
        agoraConfig.token,
        agoraConfig.uid
      );

      console.log("✅ Joined channel successfully with UID:", uid);
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error("❌ Failed to join channel:", error);
      setError(
        `Failed to join streaming channel: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return false;
    }
  };

  // Initialize local stream (HOST ONLY)
  const initializeLocalStream = async () => {
    if (!isHost) return;

    try {
      console.log("🎥 Initializing local stream...");

      // First, get basic camera access for preview
      const basicStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      console.log(
        "📹 Basic camera stream obtained:",
        basicStream.getVideoTracks().length,
        "video tracks"
      );

      // Display local video immediately for preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = basicStream;
        localStreamRef.current = basicStream;

        // Ensure video plays
        localVideoRef.current.onloadedmetadata = () => {
          console.log("✅ Local video metadata loaded");
          if (localVideoRef.current) {
            localVideoRef.current
              .play()
              .catch((e) => console.log("Video play error:", e));
          }
        };

        // Force play
        try {
          await localVideoRef.current.play();
          console.log("✅ Local video started playing");
        } catch (e) {
          console.log("Video play failed, will retry:", e);
        }
      }

      // Now try to initialize Agora tracks (but don't let it interfere with basic stream)
      try {
        const AgoraRTC = await import("agora-rtc-sdk-ng");

        // Create local audio and video tracks
        localAudioTrackRef.current =
          await AgoraRTC.default.createMicrophoneAudioTrack();
        localVideoTrackRef.current =
          await AgoraRTC.default.createCameraVideoTrack();

        console.log("✅ Agora tracks created successfully");
      } catch (agoraError) {
        console.log(
          "⚠️ Agora track creation failed (expected without App ID):",
          agoraError
        );
        // Don't throw error, just continue with basic stream
      }

      console.log("✅ Local stream initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize local stream:", error);
      setError("Failed to access camera/microphone. Please check permissions.");
      return false;
    }
  };

  // Publish local stream (HOST ONLY)
  const publishLocalStream = async () => {
    if (!isHost || !localAudioTrackRef.current || !localVideoTrackRef.current)
      return;

    try {
      console.log("📡 Publishing local stream...");

      // Publish audio and video tracks
      await agoraClientRef.current?.publish([
        localAudioTrackRef.current,
        localVideoTrackRef.current,
      ]);

      console.log("✅ Local stream published successfully");
      setIsStreaming(true);
      return true;
    } catch (error) {
      console.error("❌ Failed to publish local stream:", error);
      setError("Failed to publish stream");
      return false;
    }
  };

  // Join as host
  const joinAsHost = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log("🎬 Joining as host...");

      // Step 1: Initialize local stream FIRST (camera access)
      console.log("📹 Step 1: Getting camera access...");
      const streamInitialized = await initializeLocalStream();
      if (!streamInitialized) {
        setIsLoading(false);
        return; // Stop here if camera access fails
      }

      // Step 2: Try to initialize Agora client
      console.log("🔧 Step 2: Initializing Agora client...");
      const clientInitialized = await initializeAgoraClient();

      if (!clientInitialized) {
        // Agora failed, but we still have camera access
        console.log("⚠️ Agora failed, but camera is working");
        setIsLoading(false);
        setIsStreaming(true); // Show as "streaming" even without Agora
        setError(
          "Camera is working, but Agora streaming is not configured. Set NEXT_PUBLIC_AGORA_APP_ID to enable real streaming."
        );
        return;
      }

      // Step 3: Join channel
      console.log("🚀 Step 3: Joining channel...");
      const channelJoined = await joinChannel();
      if (!channelJoined) {
        setIsLoading(false);
        setIsStreaming(true); // Still show camera preview
        setError("Camera is working, but failed to join streaming channel.");
        return;
      }

      // Step 4: Publish local stream
      console.log("📡 Step 4: Publishing stream...");
      const streamPublished = await publishLocalStream();
      if (!streamPublished) {
        setIsLoading(false);
        setIsStreaming(true); // Still show camera preview
        setError("Camera is working, but failed to publish stream.");
        return;
      }

      setIsLoading(false);
      console.log("🎉 Host stream started successfully!");
    } catch (error) {
      console.error("❌ Failed to join as host:", error);
      setError("Failed to start streaming");
      setIsLoading(false);
    }
  };

  // Join as viewer
  const joinAsViewer = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log("👀 Joining as viewer...");

      // Initialize Agora client
      const clientInitialized = await initializeAgoraClient();
      if (!clientInitialized) return;

      // Join channel
      const channelJoined = await joinChannel();
      if (!channelJoined) return;

      setIsLoading(false);
      setIsStreaming(true);
      console.log("✅ Viewer joined successfully!");
    } catch (error) {
      console.error("❌ Failed to join as viewer:", error);
      setError("Failed to join stream");
      setIsLoading(false);
    }
  };

  // Control functions (HOST ONLY)
  const toggleAudio = async () => {
    if (!localAudioTrackRef.current || !isHost) return;

    try {
      if (isAudioEnabled) {
        await localAudioTrackRef.current.setEnabled(false);
        setIsAudioEnabled(false);
        console.log("🔇 Audio muted");
      } else {
        await localAudioTrackRef.current.setEnabled(true);
        setIsAudioEnabled(true);
        console.log("🔊 Audio unmuted");
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
        console.log("📹 Video stopped");
      } else {
        await localVideoTrackRef.current.setEnabled(true);
        setIsVideoEnabled(true);
        console.log("📹 Video started");
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

        // Resume camera
        if (localVideoTrackRef.current) {
          await localVideoTrackRef.current.setEnabled(true);
        }
        setIsScreenSharing(false);
        console.log("🖥️ Screen sharing stopped");
      } else {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        screenStreamRef.current = stream;

        // Replace video track with screen share
        if (localVideoTrackRef.current) {
          await localVideoTrackRef.current.setEnabled(false);
        }

        setIsScreenSharing(true);
        console.log("🖥️ Screen sharing started");
      }
    } catch (error) {
      console.error("❌ Failed to toggle screen sharing:", error);
    }
  };

  const startStream = async () => {
    if (isHost) {
      await joinAsHost();
    } else {
      await joinAsViewer();
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

      // Clear video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      // Get new stream
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      // Set new stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
        localStreamRef.current = newStream;

        // Force play
        try {
          await localVideoRef.current.play();
          console.log("✅ Camera refreshed successfully");
        } catch (e) {
          console.log("Camera refresh play failed:", e);
        }
      }
    } catch (error) {
      console.error("❌ Failed to refresh camera:", error);
    }
  };

  const stopStream = async () => {
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

      // Clear video elements
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      // Leave channel
      if (agoraClientRef.current) {
        await agoraClientRef.current.leave();
        agoraClientRef.current = null;
      }

      // Reset state
      setIsStreaming(false);
      setIsConnected(false);
      setViewerCount(0);
      onViewerCountChange?.(0);
      remoteUsersRef.current = [];

      console.log("✅ Stream stopped successfully");
    } catch (error) {
      console.error("❌ Error stopping stream:", error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    setIsLoading(false);

    return () => {
      isMountedRef.current = false;
      stopStream();
    };
  }, []);

  // Monitor local stream for debugging
  useEffect(() => {
    if (isHost && localStreamRef.current) {
      console.log("🔍 Local stream monitoring:", {
        videoTracks: localStreamRef.current.getVideoTracks().length,
        audioTracks: localStreamRef.current.getAudioTracks().length,
        videoTrackEnabled: localStreamRef.current.getVideoTracks()[0]?.enabled,
        audioTrackEnabled: localStreamRef.current.getAudioTracks()[0]?.enabled,
      });

      // Check if video track is actually producing data
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        console.log("📹 Video track settings:", videoTrack.getSettings());
        console.log("📹 Video track constraints:", videoTrack.getConstraints());
      }
    }
  }, [isHost, localStreamRef.current]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">
            {isHost ? "Initializing stream..." : "Connecting to stream..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    // Check if this is a camera-working-but-agora-failed error
    const isCameraWorkingError = error.includes("Camera is working");

    if (isCameraWorkingError && isStreaming) {
      // Show non-blocking warning instead of error screen
      return (
        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <p className="text-yellow-800 text-sm font-medium">
                Camera Preview Active
              </p>
            </div>
            <p className="text-yellow-700 text-sm mt-1">{error}</p>
          </div>

          {/* Continue with normal streaming UI */}
          <div className="space-y-4">
            {/* Stream Controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-yellow-600">PREVIEW</span>
                </div>

                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{viewerCount} viewers</span>
                </div>
              </div>

              {isHost && (
                <button
                  onClick={stopStream}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  End Stream
                </button>
              )}
            </div>

            {/* Video Container */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              {/* Local Video (Host Only) */}
              {isHost && (
                <div className="absolute top-4 left-4 z-10">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-32 h-24 bg-gray-800 rounded-lg object-cover border-2 border-white"
                    onLoadedMetadata={() =>
                      console.log("🎥 Local video metadata loaded in preview")
                    }
                    onCanPlay={() =>
                      console.log("🎥 Local video can play in preview")
                    }
                    onPlay={() =>
                      console.log("🎥 Local video started playing in preview")
                    }
                    onError={(e) =>
                      console.error("🎥 Local video error in preview:", e)
                    }
                  />
                </div>
              )}

              {/* Remote Video */}
              <div className="w-full h-64 bg-gray-900 flex items-center justify-center">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {!isHost && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Watching Stream</p>
                      <p className="text-sm opacity-75 mt-1">
                        Connected to host&apos;s stream
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Connection Status */}
              <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center gap-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Preview Mode</span>
                </div>
              </div>
            </div>

            {/* Controls (Host Only) */}
            {isHost && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={toggleAudio}
                  className={`flex items-center gap-1 px-3 py-2 rounded text-sm transition-colors ${
                    isAudioEnabled
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {isAudioEnabled ? (
                    <Mic className="w-4 h-4" />
                  ) : (
                    <MicOff className="w-4 h-4" />
                  )}
                  {isAudioEnabled ? "Mute" : "Unmute"}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`flex items-center gap-1 px-3 py-2 rounded text-sm transition-colors ${
                    isVideoEnabled
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {isVideoEnabled ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <VideoOff className="w-4 h-4" />
                  )}
                  {isVideoEnabled ? "Stop Video" : "Start Video"}
                </button>

                <button
                  onClick={toggleScreenSharing}
                  className={`flex items-center gap-1 px-3 py-2 rounded text-sm transition-colors ${
                    isScreenSharing
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  {isScreenSharing ? "Stop Sharing" : "Share Screen"}
                </button>

                <button
                  onClick={refreshCamera}
                  className="flex items-center gap-1 px-3 py-2 rounded text-sm bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Refresh Camera
                </button>
              </div>
            )}

            {/* Stream Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Camera Preview Mode
              </h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>
                  • <strong>Status:</strong> Camera is working, but Agora
                  streaming is not configured
                </p>
                <p>
                  • <strong>Preview:</strong> You can see your camera feed
                </p>
                <p>
                  • <strong>Controls:</strong> Audio/video controls work locally
                </p>
                <p>
                  • <strong>Streaming:</strong> Set NEXT_PUBLIC_AGORA_APP_ID to
                  enable real streaming
                </p>
                <p>
                  • <strong>Channel:</strong> {channelName}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show blocking error for other types of errors
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-2">Connection Error</p>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={() => setError("")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isStreaming && isHost) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <div className="mb-4">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Ready to Go Live
            </h3>
            <p className="text-gray-600 mt-1">
              Click the button below to start your livestream and connect with
              your audience
            </p>
          </div>

          <button
            onClick={startStream}
            className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Livestream
          </button>

          <p className="text-xs text-gray-500 mt-3">
            💡 Tip: Your stream will be visible to viewers once you start
            broadcasting
          </p>
        </div>
      </div>
    );
  }

  if (!isStreaming && !isHost) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <div className="mb-4">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Join Livestream
            </h3>
            <p className="text-gray-600 mt-1">
              Click to join the livestream and watch the broadcast
            </p>
          </div>

          <button
            onClick={startStream}
            className="flex items-center gap-2 mx-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Join Stream
          </button>

          <p className="text-xs text-gray-500 mt-3">
            🔄 Connecting to Agora.io servers...
          </p>
        </div>
      </div>
    );
  }

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

        {isHost && (
          <button
            onClick={stopStream}
            className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
          >
            <Square className="w-4 h-4" />
            End Stream
          </button>
        )}
      </div>

      {/* Video Container */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        {/* Local Video (Host Only) */}
        {isHost && (
          <div className="absolute top-4 left-4 z-10">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-32 h-24 bg-gray-800 rounded-lg object-cover border-2 border-white"
              onLoadedMetadata={() =>
                console.log("🎥 Local video metadata loaded in preview")
              }
              onCanPlay={() =>
                console.log("🎥 Local video can play in preview")
              }
              onPlay={() =>
                console.log("🎥 Local video started playing in preview")
              }
              onError={(e) =>
                console.error("🎥 Local video error in preview:", e)
              }
            />
            {/* Debug info */}
            <div className="absolute -bottom-6 left-0 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
              {localStreamRef.current ? "📹 Active" : "❌ No Stream"}
            </div>
          </div>
        )}

        {/* Remote Video */}
        <div className="w-full h-64 bg-gray-900 flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {!isHost && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Watching Stream</p>
                <p className="text-sm opacity-75 mt-1">
                  Connected to host&apos;s stream
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span>{isConnected ? "Connected" : "Connecting"}</span>
          </div>
        </div>
      </div>

      {/* Controls (Host Only) */}
      {isHost && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-1 px-3 py-2 rounded text-sm transition-colors ${
              isAudioEnabled
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
            {isAudioEnabled ? "Mute" : "Unmute"}
          </button>

          <button
            onClick={toggleVideo}
            className={`flex items-center gap-1 px-3 py-2 rounded text-sm transition-colors ${
              isVideoEnabled
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isVideoEnabled ? (
              <Video className="w-4 h-4" />
            ) : (
              <VideoOff className="w-4 h-4" />
            )}
            {isVideoEnabled ? "Stop Video" : "Start Video"}
          </button>

          <button
            onClick={toggleScreenSharing}
            className={`flex items-center gap-1 px-3 py-2 rounded text-sm transition-colors ${
              isScreenSharing
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <Monitor className="w-4 h-4" />
            {isScreenSharing ? "Stop Sharing" : "Share Screen"}
          </button>

          <button
            onClick={refreshCamera}
            className="flex items-center gap-1 px-3 py-2 rounded text-sm bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            <Video className="w-4 h-4" />
            Refresh Camera
          </button>
        </div>
      )}

      {/* Stream Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Agora.io Livestream
        </h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p>
            • <strong>Host:</strong> Can broadcast camera/microphone/screen
          </p>
          <p>
            • <strong>Viewers:</strong> Can watch the stream (read-only)
          </p>
          <p>
            • <strong>Platform:</strong> Agora.io for real-time streaming
          </p>
          <p>
            • <strong>Channel:</strong> {channelName}
          </p>
          <p>
            • <strong>Connection:</strong>{" "}
            {isConnected ? "Connected to Agora" : "Disconnected"}
          </p>
          <p>
            • <strong>Stream Status:</strong>{" "}
            {isStreaming ? "Active" : "Inactive"}
          </p>
        </div>
      </div>
    </div>
  );
}
