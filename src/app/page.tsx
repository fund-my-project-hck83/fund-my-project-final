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
            <footer className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
               <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                     <div className="md:col-span-2">
                        <h4 className="text-2xl font-medium text-black mb-4">
                           FundMyProject
                        </h4>
                        <p className="text-gray-600 mb-6 max-w-md font-normal">
                           Trusted crowdfunding platform that connects innovators with donors to make dreams come true together.
                        </p>
                        <div className="flex space-x-4">
                           <a
                              href="#"
                              className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors border border-gray-300"
                           >
                              <span className="text-sm font-normal">f</span>
                           </a>
                           <a
                              href="#"
                              className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors border border-gray-300"
                           >
                              <span className="text-sm font-normal">t</span>
                           </a>
                           <a
                              href="#"
                              className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors border border-gray-300"
                           >
                              <span className="text-sm font-normal">ig</span>
                           </a>
                        </div>
                     </div>
                     <div>
                        <h5 className="font-medium text-gray-900 mb-4">
                           Platform
                        </h5>
                        <ul className="space-y-3 text-gray-600">
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-black transition-colors font-normal"
                              >
                                 How It Works
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-black transition-colors font-normal"
                              >
                                 Platform Fees
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-black transition-colors font-normal"
                              >
                                 Success Tips
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-black transition-colors font-normal"
                              >
                                 Blog
                              </a>
                           </li>
                        </ul>
                     </div>
                     <div>
                        <h5 className="font-medium text-gray-900 mb-4">
                           Support
                        </h5>
                        <ul className="space-y-3 text-gray-600">
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-black transition-colors font-normal"
                              >
                                 Help Center
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-black transition-colors font-normal"
                              >
                                 Contact Us
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-black transition-colors font-normal"
                              >
                                 Security
                              </a>
                           </li>
                           <li>
                              <a
                                 href="#"
                                 className="hover:text-black transition-colors font-normal"
                              >
                                 Reports
                              </a>
                           </li>
                        </ul>
                     </div>
                  </div>

                  <div className="border-t border-gray-200 pt-8">
                     <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm font-normal">
                           &copy; 2025 FundMyProject. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                           <a
                              href="#"
                              className="text-gray-500 hover:text-black text-sm transition-colors font-normal"
                           >
                              Terms & Conditions
                           </a>
                           <a
                              href="#"
                              className="text-gray-500 hover:text-black text-sm transition-colors font-normal"
                           >
                              Privacy Policy
                           </a>
                           <a
                              href="#"
                              className="text-gray-500 hover:text-black text-sm transition-colors font-normal"
                           >
                              Cookies
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
