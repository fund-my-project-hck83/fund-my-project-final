"use client";

import { Project } from "@/server/models/ProjectModel";
import Link from "next/link";

interface TrendingProjectsProps {
  projects: Project[];
}

export default function TrendingProjects({ projects }: TrendingProjectsProps) {
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

  const trendingProjects = projects;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-medium text-black mb-6">
            Trending Projects
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-normal">
            Showing available projects (8 projects+)
          </p>
        </div>

        {trendingProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProjects.map((project) => {
                const fundingPercentage = calculateFundingPercentage(
                  project.currentFunding,
                  project.fundingGoal
                );

                return (
                  <div
                    key={project._id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
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
                      {project.isLive && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-normal">
                            Active
                          </span>
                        </div>
                      )}

                      {/* Funding Status Badge */}
                      <div className="absolute top-3 right-3">
                        {project.isFundingComplete ? (
                          <span className="bg-white text-black border border-black px-3 py-1 rounded-full text-xs font-normal">
                            Collected
                          </span>
                        ) : (
                          <span className="bg-white text-black border border-gray-300 px-3 py-1 rounded-full text-xs font-normal">
                            {fundingPercentage}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Project Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-black mb-3 line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm font-normal">
                        {project.description}
                      </p>

                      {/* Progress Section */}
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-1 mb-3">
                          <div
                            className="bg-black h-full rounded-full"
                            style={{
                              width: `${Math.min(fundingPercentage, 100)}%`,
                            }}
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
                      <div className="text-xs text-gray-500 font-normal mb-4">
                        {project.location}
                      </div>

                      {/* CTA Button */}
                      <Link href={`/projects/${project.slug}`}>
                        <button className="w-full bg-white border border-black text-black py-2 rounded-full text-sm font-normal hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-16">
              <Link href="/projects">
                <button className="bg-black text-white px-8 py-3 rounded-full font-normal text-base hover:bg-gray-800 transition-colors">
                  View All Projects
                </button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💡</span>
            </div>
            <h3 className="text-2xl font-medium text-black mb-4">
              No trending projects yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto font-normal">
              Be the first to start your inspiring project and get support from
              the community
            </p>
            <Link href="/create-project">
              <button className="bg-black text-white px-8 py-3 rounded-full font-normal hover:bg-gray-800 transition-colors">
                Start Your Project
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
