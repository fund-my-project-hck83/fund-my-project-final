"use client";

import { useState, useEffect } from "react";
import { Project } from "@/server/models/ProjectModel";
import HeroSection from "@/components/HeroSection";
import TrendingProjects from "@/components/TrendingProjects";

export default function Home() {
   const [projects, setProjects] = useState<Project[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchAllData();
   }, []);

   const fetchAllData = async () => {
      try {
         // Fetch trending projects berdasarkan dana terbanyak
         const projectsRes = await fetch("/api/projects/trending?limit=8&method=amount");
         const projectsData = await projectsRes.json();

         setProjects(projectsData);
      } catch (error) {
         console.error("Error fetching data:", error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <>
         <div className="min-h-screen bg-white">

            {/* Hero Section */}
            <HeroSection />

            {/* Trending Projects Section */}
            {loading ? (
               <section className="py-16 px-4 sm:px-6 lg:px-8">
                  <div className="max-w-7xl mx-auto text-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                     <p className="mt-4 text-gray-600">
                        Loading trending projects...
                     </p>
                  </div>
               </section>
            ) : (
               <div id="projects">
                  <TrendingProjects projects={projects} />
               </div>
            )}

            {/* Footer */}
            <footer className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
               <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                     <div className="md:col-span-2">
                        <h4 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4">
                           FundMyProject
                        </h4>
                        <p className="text-gray-600 mb-6 max-w-md">
                           Platform crowdfunding terpercaya yang menghubungkan
                           para inovator dengan donatur untuk mewujudkan impian
                           bersama.
                        </p>
                        <div className="flex space-x-4">
                           <a
                              href="#"
                              className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors"
                           >
                              <span className="text-sm font-bold">f</span>
                           </a>
                           <a
                              href="#"
                              className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                           >
                              <span className="text-sm font-bold">t</span>
                           </a>
                           <a
                              href="#"
                              className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors"
                           >
                              <span className="text-sm font-bold">ig</span>
                           </a>
                        </div>
                     </div>
                     <div>
                        <h5 className="font-bold text-gray-900 mb-4">
                           Platform
                        </h5>
                        <ul className="space-y-3 text-gray-600">
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-emerald-600 transition-colors"
                              >
                                 Cara Kerja
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-emerald-600 transition-colors"
                              >
                                 Biaya Platform
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-emerald-600 transition-colors"
                              >
                                 Tips Sukses
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-emerald-600 transition-colors"
                              >
                                 Blog
                              </a>
                           </li>
                        </ul>
                     </div>
                     <div>
                        <h5 className="font-bold text-gray-900 mb-4">
                           Dukungan
                        </h5>
                        <ul className="space-y-3 text-gray-600">
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-emerald-600 transition-colors"
                              >
                                 Pusat Bantuan
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-emerald-600 transition-colors"
                              >
                                 Hubungi Kami
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-emerald-600 transition-colors"
                              >
                                 Keamanan
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-emerald-600 transition-colors"
                              >
                                 Laporan
                              </a>
                           </li>
                        </ul>
                     </div>
                  </div>

                  <div className="border-t border-gray-200 pt-8">
                     <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm">
                           &copy; 2025 FundMyProject. Semua hak cipta
                           dilindungi.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                           <a
                              href="#"
                              className="text-gray-500 hover:text-emerald-600 text-sm transition-colors"
                           >
                              Syarat & Ketentuan
                           </a>
                           <a
                              href="#"
                              className="text-gray-500 hover:text-emerald-600 text-sm transition-colors"
                           >
                              Kebijakan Privasi
                           </a>
                           <a
                              href="#"
                              className="text-gray-500 hover:text-emerald-600 text-sm transition-colors"
                           >
                              Cookie
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            </footer>
         </div>
      </>
   );
}
