'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/server/models/ProjectModel';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function TrendingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(12);
  const [method, setMethod] = useState<'advanced' | 'percentage' | 'amount'>('advanced');

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
      <Navbar />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🔥 Proyek Trending
              </h1>
              <p className="mt-2 text-gray-600">
                {method === 'advanced' && 'Proyek dengan algoritma smart berdasarkan performa funding'}
                {method === 'percentage' && 'Proyek yang mendekati target funding goal'}
                {method === 'amount' && 'Proyek dengan dana terkumpul terbanyak'}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Metode Trending:
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as 'advanced' | 'percentage' | 'amount')}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  <option value="advanced">Smart Algorithm</option>
                  <option value="percentage">Mendekati Target</option>
                  <option value="amount">Dana Terbanyak</option>
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
                  <option value={8}>8 Proyek</option>
                  <option value={12}>12 Proyek</option>
                  <option value={16}>16 Proyek</option>
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
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => {
              const progress = calculateProgress(project.currentFunding, project.fundingGoal);
              
              return (
                <Link key={project._id} href={`/projects/${project.slug}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="relative">
                      <img
                        src={project.projectImage}
                        alt={project.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {project.isFundingComplete ? 'Selesai' : 'Aktif'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {project.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Terkumpul</span>
                          <span className="font-semibold text-emerald-600">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Funding Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Terkumpul:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(project.currentFunding)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Target:</span>
                          <span className="text-gray-600">
                            {formatCurrency(project.fundingGoal)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Location and Deadline */}
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span className="flex items-center">
                          📍 {project.location}
                        </span>
                        <span>
                          Berakhir: {formatDate(project.fundraisingEndDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">🔥</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Belum Ada Proyek Trending
            </h3>
            <p className="text-gray-500 mb-6">
              Belum ada proyek yang sedang trending saat ini. Coba lagi nanti!
            </p>
            <Link href="/projects" className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors inline-block">
              Lihat Semua Proyek
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
