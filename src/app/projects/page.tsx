'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/server/models/ProjectModel';
import Navbar from '@/components/Navbar';

export default function AllProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'trending' | 'ending-soon'>('all');

  const fetchProjects = useCallback(async (pageNum: number = 1, search: string = '', reset: boolean = false, filter: 'all' | 'trending' | 'ending-soon' = 'all') => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let url = '';
      
      if (filter === 'trending') {
        url = `/api/projects/trending?limit=12`;
      } else if (filter === 'ending-soon') {
        url = `/api/projects/ending-soon?limit=12`;
      } else {
        url = search 
          ? `/api/projects?search=${encodeURIComponent(search)}&page=${pageNum}&limit=12`
          : `/api/projects?page=${pageNum}&limit=12`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (reset || pageNum === 1) {
        setProjects(data);
      } else {
        setProjects(prev => [...prev, ...data]);
      }
      
      // Check if there are more projects to load
      setHasMore(data.length === 12);
      
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects(1, searchTerm, true, activeFilter);
    setPage(1);
  }, [fetchProjects, searchTerm, activeFilter]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 &&
        !loadingMore &&
        hasMore &&
        !loading &&
        activeFilter === 'all' // Only enable infinite scroll for 'all' filter
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProjects(nextPage, searchTerm, false, activeFilter);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, page, searchTerm, fetchProjects, loading, activeFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchProjects(1, searchTerm, true, activeFilter);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateFundingPercentage = (current: number, goal: number) => {
    return Math.round((current / goal) * 100);
  };

  const isActiveFundraising = (project: Project) => {
    const now = new Date();
    const startDate = new Date(project.fundraisingStartDate);
    const endDate = new Date(project.fundraisingEndDate);
    return now >= startDate && now <= endDate && !project.isFundingComplete;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navbar */}
      <Navbar />

      {/* Filter Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchTerm('');
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Semua Proyek
            </button>
            <button
              onClick={() => {
                setActiveFilter('trending');
                setSearchTerm('');
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeFilter === 'trending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔥 Trending
            </button>
            <button
              onClick={() => {
                setActiveFilter('ending-soon');
                setSearchTerm('');
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeFilter === 'ending-soon'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⏰ Ending Soon
            </button>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {activeFilter === 'trending' && '🔥 Proyek Trending'}
              {activeFilter === 'ending-soon' && '⏰ Proyek Ending Soon'}
              {activeFilter === 'all' && 'Semua Proyek'}
            </h1>
            <p className="text-lg text-gray-600">
              {activeFilter === 'trending' && 'Proyek-proyek paling populer dan banyak didukung'}
              {activeFilter === 'ending-soon' && 'Proyek-proyek yang akan segera berakhir'}
              {activeFilter === 'all' && 'Temukan dan dukung proyek-proyek inspiratif yang membutuhkan bantuan Anda'}
            </p>
          </div>

          {/* Search Bar */}
          {activeFilter === 'all' && (
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Cari proyek berdasarkan nama, deskripsi, atau lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Cari Proyek
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Results info */}
          {!loading && (
            <div className="mb-8 text-center">
              <p className="text-gray-600">
                {activeFilter === 'trending' && (
                  <>Menampilkan proyek-proyek trending terpopuler</>
                )}
                {activeFilter === 'ending-soon' && (
                  <>Menampilkan proyek-proyek yang akan segera berakhir</>
                )}
                {activeFilter === 'all' && searchTerm && (
                  <>Menampilkan hasil pencarian untuk &quot;<span className="font-semibold">{searchTerm}</span>&quot;</>
                )}
                {activeFilter === 'all' && !searchTerm && (
                  <>Menampilkan semua proyek tersedia</>
                )}
                {projects.length > 0 && (
                  <span className="ml-2">({projects.length} proyek{hasMore && activeFilter === 'all' ? '+' : ''})</span>
                )}
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                  <div key={project._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="relative h-48 bg-gradient-to-r from-blue-400 to-green-400">
                      {project.projectImage && (
                        <img
                          src={project.projectImage}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-3 right-3">
                        {isActiveFundraising(project) ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Aktif
                          </span>
                        ) : project.isFundingComplete ? (
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Selesai
                          </span>
                        ) : (
                          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Berakhir
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {project.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                        {project.description}
                      </p>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Terkumpul</span>
                          <span className="font-semibold">{calculateFundingPercentage(project.currentFunding, project.fundingGoal)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, calculateFundingPercentage(project.currentFunding, project.fundingGoal))}%`
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          {formatCurrency(project.currentFunding)} dari {formatCurrency(project.fundingGoal)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          📍 {project.location}
                        </div>
                        <button 
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            isActiveFundraising(project)
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!isActiveFundraising(project)}
                        >
                          {isActiveFundraising(project) ? 'Donasi Sekarang' : 'Tidak Aktif'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading more indicator */}
              {loadingMore && activeFilter === 'all' && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Memuat proyek lainnya...</span>
                </div>
              )}

              {/* No more results */}
              {!hasMore && projects.length > 0 && activeFilter === 'all' && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">🎉</div>
                  <p className="text-gray-500">Anda telah melihat semua proyek yang tersedia</p>
                </div>
              )}

              {/* No results */}
              {projects.length === 0 && !loading && (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {activeFilter === 'trending' && 'Belum ada proyek trending'}
                    {activeFilter === 'ending-soon' && 'Tidak ada proyek yang akan berakhir'}
                    {activeFilter === 'all' && searchTerm && 'Tidak ada proyek ditemukan'}
                    {activeFilter === 'all' && !searchTerm && 'Belum ada proyek tersedia'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {activeFilter === 'trending' && 'Belum ada proyek yang sedang trending saat ini'}
                    {activeFilter === 'ending-soon' && 'Tidak ada proyek yang akan berakhir dalam waktu dekat'}
                    {activeFilter === 'all' && searchTerm && 'Coba kata kunci lain untuk pencarian Anda'}
                    {activeFilter === 'all' && !searchTerm && 'Jadilah yang pertama untuk memulai proyek impian Anda!'}
                  </p>
                  {activeFilter === 'all' && !searchTerm && (
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Mulai Proyek Anda
                    </button>
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
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Kembali ke atas"
        >
          ↑
        </button>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">FundMyProject</h4>
              <p className="text-gray-400">
                Platform crowdfunding terpercaya untuk mewujudkan impian bersama.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Tentang</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Cara Kerja</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tim Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Bantuan</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Ikuti Kami</h5>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FundMyProject. Hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
