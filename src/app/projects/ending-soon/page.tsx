'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/server/models/ProjectModel';

export default function EndingSoonPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchEndingSoonProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/ending-soon?days=${days}&limit=${limit}`);
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching ending soon projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEndingSoonProjects();
  }, [days, limit]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ⏰ Proyek Segera Berakhir
              </h1>
              <p className="mt-2 text-gray-600">
                Proyek-proyek yang akan berakhir dalam beberapa hari ke depan
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Dalam:
                </label>
                <select
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value={1}>1 Hari</option>
                  <option value={3}>3 Hari</option>
                  <option value={7}>7 Hari</option>
                  <option value={14}>14 Hari</option>
                  <option value={30}>30 Hari</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Tampilkan:
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value={5}>5 Proyek</option>
                  <option value={10}>10 Proyek</option>
                  <option value={15}>15 Proyek</option>
                  <option value={20}>20 Proyek</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

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
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tidak ada proyek yang akan berakhir
            </h3>
            <p className="text-gray-600">
              Tidak ada proyek yang akan berakhir dalam {days} hari ke depan.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Total Proyek
                    </h2>
                    <p className="text-3xl font-bold text-red-600">
                      {projects.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      Berakhir dalam {days} hari
                    </p>
                  </div>
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Total Target
                    </h2>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(projects.reduce((sum, p) => sum + p.fundingGoal, 0))}
                    </p>
                  </div>
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Total Terkumpul
                    </h2>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(projects.reduce((sum, p) => sum + p.currentFunding, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {projects.map((project) => {
                const daysLeft = getDaysLeft(project.fundraisingEndDate);
                const progress = calculateProgress(project.currentFunding, project.fundingGoal);
                
                return (
                  <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex items-start space-x-6">
                        {/* Project Image */}
                        <div className="flex-shrink-0">
                          {project.projectImage ? (
                            <img
                              src={project.projectImage}
                              alt={project.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-green-400 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {project.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {project.name}
                              </h3>
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {project.description}
                              </p>
                              
                              {/* Location */}
                              <div className="flex items-center text-sm text-gray-500 mb-3">
                                <span className="mr-1">📍</span>
                                {project.location}
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-semibold text-emerald-600">
                                    {progress.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Funding Info */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Terkumpul:</span>
                                  <p className="font-semibold text-emerald-600">
                                    {formatCurrency(project.currentFunding)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Target:</span>
                                  <p className="font-semibold">
                                    {formatCurrency(project.fundingGoal)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Urgency Badge */}
                            <div className="flex-shrink-0 ml-4">
                              <div className={`${getUrgencyColor(daysLeft)} text-white px-4 py-2 rounded-full text-center`}>
                                <div className="text-lg font-bold">
                                  {daysLeft}
                                </div>
                                <div className="text-xs">
                                  {daysLeft === 1 ? 'Hari' : 'Hari'}
                                </div>
                              </div>
                              <p className="text-center text-xs mt-2 font-medium">
                                {getUrgencyText(daysLeft)}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-3 mt-4">
                            <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                              🚀 Donasi Sekarang
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                              Lihat Detail
                            </button>
                          </div>
                        </div>
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
  );
}
