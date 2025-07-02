'use client';

import { useState, useEffect } from 'react';
import { IProject } from '@/interfaces/interfaces';
// import Navbar from '@/components/Navbar';

export default function TrendingProjectsPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(8);
  const [method, setMethod] = useState<'percentage' | 'amount'>('percentage');

  useEffect(() => {
    const fetchTrendingProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/trending?limit=${limit}&method=${method}`);
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching trending projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProjects();
  }, [limit, method]);

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🔥 Trending Projects
              </h1>
              <p className="mt-2 text-gray-600">
                {method === 'percentage' && 'Projects with highest progress percentage (approaching target)'}
                {method === 'amount' && 'Projects with highest funding collected (absolute amount)'}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Metode Trending:
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as 'percentage' | 'amount')}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  <option value="percentage">                        Approaching Target</option>
                  <option value="amount">                        Highest Funding</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Tampilkan:
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  <option value={4}>4 Projects</option>
                  <option value={8}>8 Projects</option>
                  <option value={12}>12 Projects</option>
                  <option value={16}>16 Projects</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
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
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No trending projects
            </h3>
            <p className="text-gray-600">
              No projects are currently trending.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project, index) => (
                <div key={project._id.toString()} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Project Image */}
                  <div className="relative">
                    {project.projectImage ? (
                      <img
                        src={project.projectImage}
                        alt={project.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-r from-emerald-400 to-blue-400 flex items-center justify-center">
                        <span className="text-white font-bold text-3xl">
                          {project.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        #{index + 1} Trending
                      </span>
                    </div>
                    {project.isLive && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                          🔴 LIVE
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="mr-1">📍</span>
                      {project.location}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-emerald-600">
                          {calculateProgress(project.currentFunding, project.fundingGoal).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${calculateProgress(project.currentFunding, project.fundingGoal)}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Funding Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Terkumpul:</span>
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatCurrency(project.currentFunding)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Target:</span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(project.fundingGoal)}
                        </span>
                      </div>
                    </div>

                    {/* End Date */}
                    <div className="text-xs text-gray-500 mb-4">
                      Ends: {formatDate(project.fundraisingEndDate)}
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                      Donate Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
