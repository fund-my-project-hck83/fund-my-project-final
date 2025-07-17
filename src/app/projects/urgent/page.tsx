'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/server/models/ProjectModel';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function UrgentPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit] = useState(15);
  const [includeCompleted] = useState(false); // Keep functionality but remove UI

  useEffect(() => {
    const fetchUrgentProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/urgent?limit=${limit}&includeCompleted=${includeCompleted}`);
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching urgent projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentProjects();
  }, [limit, includeCompleted]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateFundingPercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const getDaysLeft = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getProjectStatus = (project: Project) => {
    const now = new Date();
    const endDate = new Date(project.fundraisingEndDate);
    const daysLeft = getDaysLeft(project.fundraisingEndDate);
    
    if (project.isFundingComplete) {
      return { status: "completed", text: "Completed", style: "bg-white text-black border border-black" };
    }

    if (endDate < now) {
      return { status: "ended", text: "Ended", style: "bg-white text-black border border-gray-300" };
    }

    if (daysLeft <= 1) {
      return { status: "critical", text: "Ends Today!", style: "bg-red-600 text-white" };
    }

    if (daysLeft <= 3) {
      return { status: "urgent", text: `${daysLeft} Days Left`, style: "bg-orange-500 text-white" };
    }

    return { status: "active", text: `${daysLeft} Days Left`, style: "bg-black text-white" };
  };

  const isActiveFundraising = (project: Project) => {
    const now = new Date();
    const startDate = new Date(project.fundraisingStartDate);
    const endDate = new Date(project.fundraisingEndDate);
    return now >= startDate && now <= endDate && !project.isFundingComplete;
  };

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-medium text-black mb-6">
                Urgent Projects
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto font-normal">
                Projects yang berakhir dalam 30 hari
              </p>
              {!loading && projects.length > 0 && (
                <p className="text-sm text-gray-500 mt-4 font-normal">
                  ({projects.length} urgent projects)
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
                <span className="ml-3 text-gray-600 font-normal">Loading urgent projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🚨</span>
                </div>
                <h3 className="text-2xl font-medium text-black mb-4">
                  No urgent projects
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto font-normal">
                  No projects are ending soon at the moment
                </p>
                <Link href="/projects">
                  <button className="bg-black text-white px-8 py-3 rounded-full font-normal hover:bg-gray-800 transition-colors">
                    View All Projects
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => {
                  const fundingPercentage = calculateFundingPercentage(
                    project.currentFunding,
                    project.fundingGoal
                  );
                  const status = getProjectStatus(project);
                  const daysLeft = getDaysLeft(project.fundraisingEndDate);

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

                        {/* Urgency Badge */}
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

                          {/* Location */}
                          <div className="flex items-center text-xs text-gray-500 mb-4 font-normal">
                            <span className="mr-1">📍</span>
                            {project.location}
                          </div>

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

                          {/* Days Left Warning */}
                          {daysLeft <= 7 && (
                            <div className={`text-xs font-normal mb-3 px-2 py-1 rounded-full text-center ${
                              daysLeft <= 1 ? 'bg-red-100 text-red-800' :
                              daysLeft <= 3 ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {daysLeft === 0 ? '⚠️ Ends Today!' :
                               daysLeft === 1 ? '⚠️ Ends Tomorrow!' :
                               `⏰ Only ${daysLeft} days left!`}
                            </div>
                          )}

                          {/* Target Amount */}
                          <div className="text-xs text-gray-500 font-normal">
                            Target: {formatCurrency(project.fundingGoal)}
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
                                if (status.status === "completed") return "View Details";
                                if (status.status === "ended") return "View Details";
                                if (daysLeft <= 1) return "Donate Now!";
                                return "Donate Now";
                              })()}
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
