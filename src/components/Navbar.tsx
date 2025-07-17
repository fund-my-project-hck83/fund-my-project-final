"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCookie } from "@/app/login/action";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(
    null
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by checking for access_token cookie
    const checkAuth = async () => {
      try {
        // Check if access_token cookie exists
        const cookies = document.cookie.split(";");
        const accessTokenCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("access_token=")
        );

        if (accessTokenCookie) {
          setIsLoggedIn(true);

          // Try to get user data from the token
          try {
            const response = await fetch("/api/verify-token", {
              credentials: "include",
            });

            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
            } else {
              // Token exists but is invalid, user is still logged in but no user data
              setUser({ name: "User" });
            }
          } catch (error) {
            // If verify fails, still show as logged in but with default user
            console.log(error);

            setUser({ name: "User" });
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await deleteCookie("access_token");
      setIsLoggedIn(false);
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <nav className="bg-white border border-black rounded-full mx-4 my-4 sticky top-4 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {" "}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <h1 className="text-xl font-medium text-black">
                  FundMyProject
                </h1>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 h-6 w-16 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border border-black rounded-full mx-4 my-4 sticky top-4 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {" "}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-medium text-black">FundMyProject</h1>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/projects"
              className="text-gray-700 hover:text-black px-4 py-2 text-sm font-normal transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/projects/trending"
              className="text-gray-700 hover:text-black px-4 py-2 text-sm font-normal transition-colors"
            >
              Trending
            </Link>
          </div>
          {/* Search Box */}
          <div className="hidden md:flex flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-black bg-gray-50"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const query = (e.target as HTMLInputElement).value.trim();
                    if (query) {
                      window.location.href = `/projects?search=${encodeURIComponent(
                        query
                      )}`;
                    }
                  }
                }}
              />
            </div>
          </div>
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-black px-4 py-2 text-sm font-normal transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-white border border-black text-black hover:bg-gray-50 px-4 py-2 rounded-full text-sm font-normal transition-colors"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/create-project"
                  className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-full text-sm font-normal transition-colors"
                >
                  Create Project
                </Link>
                <div className="flex items-center space-x-2 text-gray-700 px-3 py-2 text-sm font-normal">
                  <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-medium">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span>{user?.name || "User"}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-red-600 hover:text-red-700 px-4 py-2 text-sm font-normal transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-black p-2 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - NOW OUTSIDE the rounded container */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white border border-black rounded-lg shadow-lg z-40">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/projects"
              className="text-gray-700 hover:text-black block px-3 py-2 text-sm font-normal"
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </Link>
            <Link
              href="/projects/trending"
              className="text-gray-700 hover:text-black block px-3 py-2 text-sm font-normal"
              onClick={() => setIsMenuOpen(false)}
            >
              Trending
            </Link>

            {/* Mobile Search */}
            <div className="px-3 py-2">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-black bg-gray-50"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const query = (e.target as HTMLInputElement).value.trim();
                    if (query) {
                      window.location.href = `/projects?search=${encodeURIComponent(
                        query
                      )}`;
                      setIsMenuOpen(false);
                    }
                  }
                }}
              />
            </div>

            <div className="border-t border-gray-200 pt-3 mt-3">
              {!isLoggedIn ? (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="w-full text-left text-gray-700 hover:text-black block px-3 py-2 text-sm font-normal"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="w-full bg-white border border-black text-black hover:bg-gray-50 block px-3 py-2 rounded-full text-sm font-normal transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-medium">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-gray-700 font-normal text-sm">
                      {user?.name || "User"}
                    </span>
                  </div>
                  <Link
                    href="/create-project"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full bg-black text-white hover:bg-gray-800 block px-3 py-2 rounded-full text-sm font-normal transition-colors text-center"
                  >
                    Create Project
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-red-600 hover:text-red-700 block px-3 py-2 text-sm font-normal"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
