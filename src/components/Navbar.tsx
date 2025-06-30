"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCookie } from "@/app/login/action";

export default function Navbar() {
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const router = useRouter();

   useEffect(() => {
      // Check if user is logged in by checking for access_token cookie
      const checkAuth = async () => {
         try {
            // Check if access_token cookie exists
            const cookies = document.cookie.split(';');
            const accessTokenCookie = cookies.find(cookie => 
               cookie.trim().startsWith('access_token=')
            );

            if (accessTokenCookie) {
               setIsLoggedIn(true);
               
               // Try to get user data from the token
               try {
                  const response = await fetch('/api/verify-token', {
                     credentials: 'include'
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
                  setUser({ name: "User" });
               }
            } else {
               setIsLoggedIn(false);
               setUser(null);
            }
         } catch (error) {
            console.error('Auth check failed:', error);
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
         console.error('Logout failed:', error);
      }
   };

   if (isLoading) {
      return (
         <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between items-center h-16">
                  <div className="flex-shrink-0">
                     <Link href="/" className="flex items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                           FundMyProject
                        </h1>
                     </Link>
                  </div>
                  <div className="hidden md:flex items-center space-x-4">
                     <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  </div>
               </div>
            </div>
         </nav>
      );
   }

   return (
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
               {/* Logo */}
               <div className="flex-shrink-0">
                  <Link href="/" className="flex items-center">
                     <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        FundMyProject
                     </h1>
                  </Link>
               </div>

               {/* Desktop Navigation */}
               <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-8">
                     <Link
                        href="/projects"
                        className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                     >
                        Jelajahi Proyek
                     </Link>
                     <Link
                        href="/projects/trending"
                        className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                     >
                        Trending
                     </Link>
                     <Link
                        href="/projects/ending-soon"
                        className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                     >
                        Ending Soon
                     </Link>
                  </div>
               </div>

               {/* Desktop Auth Buttons */}
               <div className="hidden md:flex items-center space-x-4">
                  {!isLoggedIn ? (
                     <>
                        <Link
                           href="/login"
                           className="text-gray-700 hover:text-emerald-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                           Masuk
                        </Link>
                        <Link
                           href="/register"
                           className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                           Daftar
                        </Link>
                     </>
                  ) : (
                     <>
                        <Link
                           href="/create-project"
                           className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                           Buat Proyek
                        </Link>
                        <div className="relative group">
                           <button className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                 <span className="text-emerald-600 font-semibold">
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                 </span>
                              </div>
                              <span>{user?.name || "User"}</span>
                              <svg
                                 className="w-4 h-4"
                                 fill="none"
                                 stroke="currentColor"
                                 viewBox="0 0 24 24"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                 />
                              </svg>
                           </button>
                           <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                              <a
                                 href="#"
                                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                 Profil Saya
                              </a>
                              <a
                                 href="#"
                                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                 Proyek Saya
                              </a>
                              <a
                                 href="#"
                                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                 Pengaturan
                              </a>
                              <div className="border-t border-gray-100"></div>
                              <button
                                 onClick={handleSignOut}
                                 className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                 Keluar
                              </button>
                           </div>
                        </div>
                     </>
                  )}
               </div>

               {/* Mobile menu button */}
               <div className="md:hidden">
                  <button
                     onClick={toggleMenu}
                     className="text-gray-700 hover:text-emerald-600 p-2 rounded-md transition-colors"
                     aria-label="Toggle menu"
                  >
                     <svg
                        className="w-6 h-6"
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

            {/* Mobile menu */}
            {isMenuOpen && (
               <div className="md:hidden">
                  <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                     <Link
                        href="/projects"
                        className="text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsMenuOpen(false)}
                     >
                        Jelajahi Proyek
                     </Link>
                     <Link
                        href="/projects/trending"
                        className="text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsMenuOpen(false)}
                     >
                        Trending
                     </Link>
                     <Link
                        href="/projects/ending-soon"
                        className="text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsMenuOpen(false)}
                     >
                        Ending Soon
                     </Link>

                     <div className="border-t border-gray-200 pt-4">
                        {!isLoggedIn ? (
                           <div className="space-y-2">
                              <Link
                                 href="/login"
                                 className="w-full text-left text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md text-base font-medium"
                                 onClick={() => setIsMenuOpen(false)}
                              >
                                 Masuk
                              </Link>
                              <Link
                                 href="/register"
                                 className="w-full text-left text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md text-base font-medium"
                                 onClick={() => setIsMenuOpen(false)}
                              >
                                 Daftar
                              </Link>
                           </div>
                        ) : (
                           <div className="space-y-2">
                              <div className="flex items-center space-x-3 px-3 py-2">
                                 <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <span className="text-emerald-600 font-semibold">
                                       {user?.name?.[0]?.toUpperCase() || "U"}
                                    </span>
                                 </div>
                                 <span className="text-gray-700 font-medium">
                                    {user?.name || "User"}
                                 </span>
                              </div>
                              <Link
                                 href="/create-project"
                                 onClick={() => setIsMenuOpen(false)}
                                 className="w-full bg-emerald-600 text-white hover:bg-emerald-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                              >
                                 Buat Proyek
                              </Link>
                              <a
                                 href="#"
                                 className="text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md text-base font-medium"
                              >
                                 Profil Saya
                              </a>
                              <a
                                 href="#"
                                 className="text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md text-base font-medium"
                              >
                                 Proyek Saya
                              </a>
                              <a
                                 href="#"
                                 className="text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md text-base font-medium"
                              >
                                 Pengaturan
                              </a>
                              <button
                                 onClick={() => {
                                    handleSignOut();
                                    setIsMenuOpen(false);
                                 }}
                                 className="w-full text-left text-red-600 hover:text-red-700 block px-3 py-2 rounded-md text-base font-medium"
                              >
                                 Keluar
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}
         </div>
      </nav>
   );
}