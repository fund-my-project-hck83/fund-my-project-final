'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/server/models/ProjectModel';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function UrgentPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit] = useState(15);
  const [includeCompleted, setIncludeCompleted] = useState(false);

  useEffect(() => {
    const fetchUrgentProjects = async () => {
      try {
        setLoading(true);
        // API baru tanpa parameter days - langsung ambil semua proyek yang mau habis
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

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getDaysLeft = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 1) return 'bg-red-500';
    if (daysLeft <= 3) return 'bg-orange-500';
    if (daysLeft <= 7) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getUrgencyText = (daysLeft: number) => {
    if (daysLeft === 0) return 'Berakhir Hari Ini!';
    if (daysLeft === 1) return 'Berakhir Besok!';
    return `${daysLeft} Hari Lagi`;
  };

  const getProjectStatus = (project: Project) => {
    const now = new Date();
    const endDate = new Date(project.fundraisingEndDate);
    const isCompleted = project.isFundingComplete;
    const isPastEndDate = endDate < now;
    
    if (isCompleted) {
      return { 
        status: 'Selesai', 
        color: 'bg-green-500', 
        textColor: 'text-green-600',
        badge: 'Success' 
      };
    } else if (isPastEndDate) {
      return { 
        status: 'Berakhir', 
        color: 'bg-gray-500', 
        textColor: 'text-gray-600',
        badge: 'Ended' 
      };
    } else {
      const daysLeft = getDaysLeft(project.fundraisingEndDate);
      return { 
        status: getUrgencyText(daysLeft), 
        color: getUrgencyColor(daysLeft), 
        textColor: 'text-red-600',
        badge: 'Active',
        daysLeft 
      };
    }
  };

  return (
    <>
    <Navbar/>
      <div className="min-h-screen bg-gray-50">
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2"></div>
                    <div className="flex space-x-4">
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No urgent projects
            </h3>
            <p className="text-gray-600">
              No projects ending within the next 30 days.
            </p>
          </div>
        ) : (
          <>
            {/* Toggle Filter */}
            <div className="mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Urgent Projects (30 Days)
                  </h2>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Tampilkan:</span>
                    <button
                      onClick={() => setIncludeCompleted(!includeCompleted)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        includeCompleted
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {includeCompleted ? 'All Projects' : 'Active Only'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => {
                const progress = calculateProgress(project.currentFunding, project.fundingGoal);
                const projectStatus = getProjectStatus(project);
                
                return (
                  <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {/* Project Image */}
                    <div className="relative">
                      {project.projectImage ? (
                        <img
                          src={project.projectImage}
                          alt={project.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center">
                          <span className="text-white font-bold text-3xl">
                            {project.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className={`text-white px-3 py-1 rounded-full text-sm font-semibold ${
                          projectStatus.badge === 'Success' ? 'bg-green-600' :
                          projectStatus.badge === 'Ended' ? 'bg-gray-600' :
                          'bg-red-600'
                        }`}>
                          {projectStatus.badge === 'Success' ? '✅ Selesai' :
                           projectStatus.badge === 'Ended' ? '⏰ Berakhir' :
                           projectStatus.daysLeft !== undefined ? `${projectStatus.daysLeft} Hari` : '🔥 Urgent'}
                        </span>
                      </div>
                    </div>

                    {/* Project Content */}
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {project.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {project.description}
                      </p>

                      {/* Location */}
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="mr-1">📍</span>
                        {project.location}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-emerald-600">
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              projectStatus.badge === 'Success' ? 'bg-green-600' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Funding Info */}
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">Terkumpul</div>
                        <div className="font-bold text-emerald-600 mb-2">
                          {formatCurrency(project.currentFunding)}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Target</div>
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(project.fundingGoal)}
                        </div>
                      </div>

                      {/* End Date */}
                      <div className="text-sm text-gray-500 mb-4">
                        Ends: {formatDate(project.fundraisingEndDate)}
                      </div>

                      {/* Action Button */}
                      <div>
                        <Link href={`/projects/${project.slug}`}>
                        <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                          Donate Now
                        </button>
                        </Link>
                      </div>
                    </div>
                  </div>

                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
    </>
  );
}
