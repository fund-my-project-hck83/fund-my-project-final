"use client";

import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { setCookie } from "@/app/login/action";

export default function AuthButton() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Create Google OAuth URL
      const googleAuthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/googleLogin`
        )}&` +
        `response_type=code&` +
        `scope=email profile&` +
        `access_type=offline&` +
        `prompt=select_account`;

      console.log("Opening Google OAuth popup...");

      // Open Google OAuth in a popup
      const popup = window.open(
        googleAuthUrl,
        "google-auth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        Swal.fire({
          icon: "error",
          title: "Popup Blocked",
          text: "Please allow popups for this site and try again.",
        });
        return;
      }

      let loginProcessed = false;

      // Listen for messages from the popup
      const messageListener = async (event: MessageEvent) => {
        console.log("Received message:", event.data);

        if (event.origin !== `${process.env.NEXT_PUBLIC_BASE_URL}`) return;

        if (loginProcessed) return; // Prevent double processing

        switch (event.data.type) {
          case "GOOGLE_LOGIN_SUCCESS":
            if (event.data.token) {
              loginProcessed = true;
              window.removeEventListener("message", messageListener);

              try {
                await setCookie("access_token", event.data.token);
                Swal.fire({
                  icon: "success",
                  title: "Login Successful",
                  text: "Welcome!",
                });
                router.push("/");
              } catch (error) {
                console.error("Failed to set cookie:", error);
                Swal.fire({
                  icon: "error",
                  title: "Login Failed",
                  text: "Failed to save login information.",
                });
              }
            }
            break;

          case "GOOGLE_LOGIN_ERROR":
            loginProcessed = true;
            window.removeEventListener("message", messageListener);
            Swal.fire({
              icon: "error",
              title: "Login Failed",
              text:
                event.data.error || "Google login failed. Please try again.",
            });
            break;

          case "GOOGLE_LOGIN_CANCELLED":
            loginProcessed = true;
            window.removeEventListener("message", messageListener);
            console.log("User cancelled Google login");
            // Don't show error for user cancellation
            break;
        }
      };

      window.addEventListener("message", messageListener);

      // Check for popup closure as fallback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", messageListener);

          if (!loginProcessed) {
            // Check localStorage as fallback
            const tempToken = localStorage.getItem("temp_google_token");
            if (tempToken) {
              loginProcessed = true;
              localStorage.removeItem("temp_google_token");
              setCookie("access_token", tempToken)
                .then(() => {
                  Swal.fire({
                    icon: "success",
                    title: "Login Successful",
                    text: "Welcome!",
                  });
                  router.push("/");
                })
                .catch(() => {
                  Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: "Failed to save login information.",
                  });
                });
            } else {
              console.log("Popup closed without successful login");
              // Don't show error - user might have cancelled
            }
          }
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!loginProcessed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", messageListener);
          if (popup && !popup.closed) {
            popup.close();
          }
          console.log("Google login timeout");
        }
      }, 300000); // 5 minutes
    } catch (error) {
      console.error("Google login error:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Google login failed. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleLogin}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}
