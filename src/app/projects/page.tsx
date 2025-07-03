"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import { Project } from "@/server/models/ProjectModel";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AllProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const fetchProjects = useCallback(
    async (
      pageNum: number = 1,
      search: string = "",
      reset: boolean = false
    ) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const url = search
          ? `/api/projects?search=${encodeURIComponent(
              search
            )}&page=${pageNum}&limit=12`
          : `/api/projects?page=${pageNum}&limit=12`;

        const response = await fetch(url);
        const data = await response.json();

        if (reset || pageNum === 1) {
          setProjects(data);
        } else {
          setProjects((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === 12);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const fetchMoreProjects = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProjects(nextPage, searchTerm, false);
    }
  };

  useEffect(() => {
    fetchProjects(1, searchTerm, true);
    setPage(1);
  }, [fetchProjects, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateFundingPercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const isActiveFundraising = (project: Project) => {
    const now = new Date();
    const startDate = new Date(project.fundraisingStartDate);
    const endDate = new Date(project.fundraisingEndDate);
    return now >= startDate && now <= endDate && !project.isFundingComplete;
  };

  const getProjectStatus = (project: Project) => {
    const now = new Date();
    const startDate = new Date(project.fundraisingStartDate);
    const endDate = new Date(project.fundraisingEndDate);

    if (project.isFundingComplete) {
      return { status: "completed", text: "Completed", style: "bg-white text-black border border-black" };
    }

    if (now < startDate) {
      return { status: "soon", text: "Coming Soon", style: "bg-white text-black border border-gray-300" };
    }

    if (now >= startDate && now <= endDate) {
      return { status: "active", text: "Active", style: "bg-black text-white" };
    }

    return { status: "ended", text: "Ended", style: "bg-white text-black border border-gray-300" };
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-medium text-black mb-6">
                {searchTerm ? "Search Results" : "All Projects"}
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto font-normal">
                {searchTerm ? (
                  <>
                    Showing search results for &quot;
                    <span className="font-medium">{searchTerm}</span>&quot;
                  </>
                ) : (
                  "Projects yang membutuhkan dukungan kamu"
                )}
              </p>
              {!loading && projects.length > 0 && (
                <p className="text-sm text-gray-500 mt-4 font-normal">
                  ({projects.length} projects{hasMore ? "+" : ""})
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                <span className="ml-3 text-gray-600 font-normal">Loading projects...</span>
              </div>
            ) : (
              <>
                <InfiniteScroll
                  dataLength={projects.length}
                  next={fetchMoreProjects}
                  hasMore={hasMore}
                  loader={
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                      <span className="ml-3 text-gray-600 font-normal">
                        Loading more projects...
                      </span>
                    </div>
                  }
                  endMessage={
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🎉</span>
                      </div>
                      <p className="text-gray-500 font-normal">
                        You have seen all available projects
                      </p>
                    </div>
                  }
                  refreshFunction={() => fetchProjects(1, searchTerm, true)}
                  pullDownToRefresh={false}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map((project) => {
                      const fundingPercentage = calculateFundingPercentage(
                        project.currentFunding,
                        project.fundingGoal
                      );
                      const status = getProjectStatus(project);

                      return (
                        <div
                          key={project._id}
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors flex flex-col h-full"
                        >
                          {/* Project Image */}
                          <div className="relative h-48 bg-gray-100">
                            {project.projectImage ? (
                              <img
                                src={project.projectImage}
                                alt={project.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                                📷
                              </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-3 left-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-normal ${status.style}`}>
                                {status.text}
                              </span>
                            </div>

                            {/* Funding Percentage Badge */}
                            <div className="absolute top-3 right-3">
                              <span className="bg-white text-black border border-gray-300 px-3 py-1 rounded-full text-xs font-normal">
                                {fundingPercentage}%
                              </span>
                            </div>
                          </div>

                          {/* Project Content */}
                          <div className="p-6 flex flex-col flex-grow">
                            {/* Content that can vary in height */}
                            <div className="flex-grow">
                              <h3 className="text-lg font-medium text-black mb-3 line-clamp-1">
                                {project.name}
                              </h3>
                              <p className="text-gray-600 mb-4 line-clamp-2 text-sm font-normal">
                                {project.description}
                              </p>

                              {/* Progress Section */}
                              <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-1 mb-3">
                                  <div
                                    className="bg-black h-full rounded-full"
                                    style={{ width: `${fundingPercentage}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="text-sm font-medium text-black">
                                    {formatCurrency(project.currentFunding)}
                                  </div>
                                  <div className="text-xs text-gray-500 font-normal">
                                    {fundingPercentage}%
                                  </div>
                                </div>
                              </div>

                              {/* Location */}
                              <div className="text-xs text-gray-500 font-normal">
                                {project.location}
                              </div>
                            </div>

                            {/* CTA Button - Always at bottom */}
                            <div className="mt-4">
                              <Link href={`/projects/${project.slug}`}>
                                <button
                                  className={`w-full py-2 rounded-full text-sm font-normal transition-colors ${
                                    isActiveFundraising(project)
                                      ? "bg-black text-white hover:bg-gray-800"
                                      : "bg-white border border-black text-black hover:bg-gray-50"
                                  }`}
                                >
                                  {(() => {
                                    if (status.status === "active") return "Donate Now";
                                    if (status.status === "soon") return "Coming Soon";
                                    if (status.status === "completed") return "View Details";
                                    return "View Details";
                                  })()}
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </InfiniteScroll>

                {/* No results */}
                {projects.length === 0 && !loading && (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">
                        {searchTerm ? "🔍" : "💡"}
                      </span>
                    </div>
                    <h3 className="text-2xl font-medium text-black mb-4">
                      {searchTerm
                        ? "No projects found"
                        : "No projects available yet"}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto font-normal">
                      {searchTerm
                        ? "Try different keywords for your search"
                        : "Be the first to start your inspiring project"}
                    </p>
                    {!searchTerm && (
                      <Link href="/create-project">
                        <button className="bg-black text-white px-8 py-3 rounded-full font-normal hover:bg-gray-800 transition-colors">
                          Start Your Project
                        </button>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Back to top button */}
        {projects.length > 8 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 bg-black text-white p-3 rounded-full border border-black hover:bg-gray-800 transition-colors"
            aria-label="Back to top"
          >
            ↑
          </button>
        )}
      </div>
    </>
  );
}
