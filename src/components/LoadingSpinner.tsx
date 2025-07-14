"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  inline?: boolean; // New prop to control layout
}

export default function LoadingSpinner({
  size = "lg",
  message,
  inline = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  // For inline usage - smaller container
  if (inline) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div
            className={`animate-spin rounded-full border border-transparent border-t-black ${sizeClasses[size]} mx-auto mb-4`}
          ></div>
          {message && (
            <p className="text-gray-600 text-sm font-normal">{message}</p>
          )}
        </div>
      </div>
    );
  }

  // For full-screen usage - existing behavior
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border border-transparent border-t-black ${sizeClasses[size]} mx-auto mb-4`}
        ></div>
        {message && (
          <p className="text-gray-600 text-sm font-normal">{message}</p>
        )}
      </div>
    </div>
  );
}
