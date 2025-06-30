"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const { data: session } = useSession();

   const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
   };

   const handleSignOut = async () => {
      await signOut({ callbackUrl: "/" });
   };

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
                  {!session ? (
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
                        <button className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                           Buat Proyek
                        </button>
                        <div className="relative group">
                           <button className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                 <span className="text-emerald-600 font-semibold">
                                    {session.user?.name?.[0]?.toUpperCase() ||
                                       "U"}
                                 </span>
                              </div>
                              <span>{session.user?.name || "User"}</span>
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
                        {!session ? (
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
                                       {session.user?.name?.[0]?.toUpperCase() ||
                                          "U"}
                                    </span>
                                 </div>
                                 <span className="text-gray-700 font-medium">
                                    {session.user?.name || "User"}
                                 </span>
                              </div>
                              <button
                                 onClick={() => setIsMenuOpen(false)}
                                 className="w-full bg-emerald-600 text-white hover:bg-emerald-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                              >
                                 Buat Proyek
                              </button>
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
