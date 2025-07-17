"use client";

import { useState, useEffect } from "react";
import { IProject } from "@/interfaces/interfaces";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";

export default function TrendingProjectsPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(8);
  const [method, setMethod] = useState<"percentage" | "amount">("percentage");

  useEffect(() => {
    const fetchTrendingProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/projects/trending?limit=${limit}&method=${method}`
        );
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching trending projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProjects();
  }, [limit, method]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
                Trending Projects
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto font-normal">
                {method === "percentage" &&
                  "Projects yang hampir mencapai target"}
                {method === "amount" &&
                  "Projects yang mengumpulkan donasi terbesar"}
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-black">Sort:</label>
                <select
                  value={method}
                  onChange={(e) =>
                    setMethod(e.target.value as "percentage" | "amount")
                  }
                  className="border border-black rounded-full px-4 py-2 pr-8 focus:outline-none focus:border-gray-800 text-sm font-normal bg-white appearance-none bg-no-repeat bg-right"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 12px center",
                    backgroundSize: "16px 16px",
                  }}
                >
                  <option value="percentage">Mendekati Target</option>
                  <option value="amount">Funding Terbanyak</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-black">Lihat:</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="border border-black rounded-full px-4 py-2 pr-8 focus:outline-none focus:border-gray-800 text-sm font-normal bg-white appearance-none bg-no-repeat bg-right"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 12px center",
                    backgroundSize: "16px 16px",
                  }}
                >
                  <option value={4}>4 Projects</option>
                  <option value={8}>8 Projects</option>
                  <option value={12}>12 Projects</option>
                  <option value={16}>16 Projects</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded mb-4"></div>
                      <div className="h-2 bg-gray-300 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-300 rounded w-20"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-2xl font-medium text-black mb-4">
                  No trending projects
                </h3>
                <p className="text-gray-600 font-normal">
                  No projects are currently trending.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project, index) => (
                  <div
                    key={project._id.toString()}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors flex flex-col h-full"
                  >
                    {/* Project Image */}
                    <div className="relative h-48 bg-gray-100">
                      {project.projectImage ? (
                        <Image
                          src={project.projectImage}
                          alt={project.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-4xl">📷</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-normal">
                          #{index + 1} Trending
                        </span>
                      </div>
                      {project.isLive && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-normal flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                            LIVE
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex-grow">
                        <h3 className="font-medium text-lg text-black mb-3 line-clamp-1">
                          {project.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-normal">
                          {project.description}
                        </p>

                        {/* Location */}
                        <div className="flex items-center text-xs text-gray-500 mb-4 font-normal">
                          <span className="mr-1">📍</span>
                          {project.location}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 font-normal">
                              Progress
                            </span>
                            <span className="font-medium text-black">
                              {calculateProgress(
                                project.currentFunding,
                                project.fundingGoal
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-black h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${calculateProgress(
                                  project.currentFunding,
                                  project.fundingGoal
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Funding Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 font-normal">
                              Terkumpul:
                            </span>
                            <span className="text-sm font-medium text-black">
                              {formatCurrency(project.currentFunding)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 font-normal">
                              Target:
                            </span>
                            <span className="text-sm font-medium text-black">
                              {formatCurrency(project.fundingGoal)}
                            </span>
                          </div>
                        </div>

                        {/* End Date */}
                        <div className="text-xs text-gray-500 font-normal">
                          Ends: {formatDate(project.fundraisingEndDate)}
                        </div>
                      </div>

                      {/* Action Button - Always at bottom */}
                      <div className="mt-4">
                        <Link href={`/projects/${project.slug}`}>
                          <button className="w-full bg-black text-white py-2 rounded-full font-normal hover:bg-gray-800 transition-colors">
                            Donate Now
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
