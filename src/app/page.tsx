"use client";

import { useState, useEffect } from "react";
import { Project } from "@/server/models/ProjectModel";
import HeroSection from "@/components/HeroSection";
import TrendingProjects from "@/components/TrendingProjects";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch trending projects berdasarkan dana terbanyak
      const projectsRes = await fetch(
        "/api/projects/trending?limit=8&method=amount"
      );
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
        <Navbar />

        {/* Hero Section */}
        <HeroSection />

        {/* Trending Projects Section */}
        {loading ? (
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <LoadingSpinner
                inline
                size="md"
                message="Loading trending projects..."
              />
            </div>
          </section>
        ) : (
          <div id="projects">
            <TrendingProjects projects={projects} />
          </div>
        )}
      </div>
    </>
  );
}
