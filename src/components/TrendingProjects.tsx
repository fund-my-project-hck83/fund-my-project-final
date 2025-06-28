'use client';

import { Project } from '@/server/models/ProjectModel';
import Link from 'next/link';

interface TrendingProjectsProps {
  projects: Project[];
}

export default function TrendingProjects({ projects }: TrendingProjectsProps) {
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

  const trendingProjects = projects.slice(0, 6);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Proyek Trending
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bergabunglah dengan ribuan donatur yang mendukung proyek-proyek inspiratif ini
          </p>
        </div>

        {trendingProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingProjects.map((project) => {
                const fundingPercentage = calculateFundingPercentage(
                  project.currentFunding, 
                  project.fundingGoal
                );

                return (
                  <div 
                    key={project._id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group"
                  >
                    {/* Project Image */}
                    <div className="relative h-56 bg-gradient-to-r from-emerald-400 to-blue-500 overflow-hidden">
                      {project.projectImage ? (
                        <img
                          src={project.projectImage}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                          �
                        </div>
                      )}
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      
                      {/* Live Badge */}
                      {project.isLive && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 animate-pulse shadow-lg">
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                            LIVE
                          </span>
                        </div>
                      )}
                      
                      {/* Funding Status Badge */}
                      <div className="absolute top-4 right-4">
                        {project.isFundingComplete ? (
                          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                            ✓ Tercapai
                          </span>
                        ) : (
                          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                            {fundingPercentage}% terkumpul
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Project Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                        {project.description}
                      </p>
                      
                      {/* Progress Section */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span className="font-medium">Terkumpul</span>
                          <span className="font-bold text-emerald-600">{fundingPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(project.currentFunding)}
                          </div>
                          <div className="text-sm text-gray-500">
                            dari {formatCurrency(project.fundingGoal)}
                          </div>
                        </div>
                      </div>

                      {/* Location and CTA */}
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <span>📍</span>
                          <span>{project.location}</span>
                        </div>
                        <Link href={`/projects/${project.slug}`}>
                          <button className="bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                            Donasi Sekarang
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-16">
              <Link href="/projects">
                <button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-12 py-4 rounded-full font-semibold text-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl">
                  Lihat Semua Proyek
                  <span className="ml-2">→</span>
                </button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💡</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Belum ada proyek trending
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Jadilah yang pertama untuk memulai proyek inspiratif Anda dan dapatkan dukungan dari komunitas
            </p>
            <Link href="/submit-project">
              <button className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors">
                Mulai Proyek Anda
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
