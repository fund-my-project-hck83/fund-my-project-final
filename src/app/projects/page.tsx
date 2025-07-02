"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import { Project } from "@/server/models/ProjectModel";
import Link from "next/link";

export default function AllProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  console.log(searchTerm, "ini yang baruuuuuuuu");

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

        // Check if there are more projects to load
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
    return Math.round((current / goal) * 100);
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

    // Jika funding sudah complete
    if (project.isFundingComplete) {
      return { status: "selesai", text: "Completed", color: "bg-blue-500" };
    }

    // Jika fundraising belum dimulai
    if (now < startDate) {
      return { status: "soon", text: "Coming Soon", color: "bg-yellow-500" };
    }

    // Jika fundraising sedang berlangsung
    if (now >= startDate && now <= endDate) {
      return { status: "aktif", text: "Active", color: "bg-green-500" };
    }

    // Jika fundraising sudah berakhir tapi belum complete
    return { status: "berakhir", text: "Ended", color: "bg-gray-500" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">

      {/* Page Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Lets begin your fundraising journey
            </h1>
            <p className="text-lg text-gray-600">
              Find and support inspiring projects that need your help
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Results info */}
          {!loading && (
            <div className="mb-8 text-center">
              <p className="text-gray-600">
                {searchTerm ? (
                  <>
                    Showing search results for &quot;
                    <span className="font-semibold">{searchTerm}</span>&quot;
                  </>
                ) : (
                  <>Showing all available projects</>
                )}
                {projects.length > 0 && (
                  <span className="ml-2">
                    ({projects.length} projects{hasMore ? "+" : ""})
                  </span>
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
              <InfiniteScroll
                dataLength={projects.length}
                next={fetchMoreProjects}
                hasMore={hasMore}
                loader={
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">
                      Loading more projects...
                    </span>
                  </div>
                }
                endMessage={
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">🎉</div>
                    <p className="text-gray-500">
                      You have seen all available projects
                    </p>
                  </div>
                }
                refreshFunction={() => fetchProjects(1, searchTerm, true)}
                pullDownToRefresh={false}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    >
                      <div className="relative h-48 bg-gradient-to-r from-blue-400 to-green-400">
                        {project.projectImage && (
                          <img
                            src={project.projectImage}
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-3 right-3">
                          {(() => {
                            const status = getProjectStatus(project);
                            return (
                              <span
                                className={`${status.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                              >
                                {status.text}
                              </span>
                            );
                          })()}
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
                            <span> Collected</span>
                            <span className="font-semibold">
                              {calculateFundingPercentage(
                                project.currentFunding,
                                project.fundingGoal
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(
                                  100,
                                  calculateFundingPercentage(
                                    project.currentFunding,
                                    project.fundingGoal
                                  )
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-2">
                            {formatCurrency(project.currentFunding)} dari{" "}
                            {formatCurrency(project.fundingGoal)}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            📍 {project.location}
                          </div>
                          <Link href={`/projects/${project.slug}`}>
                          <button
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              isActiveFundraising(project)
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={!isActiveFundraising(project)}
                          >
                            {(() => {
                              const status = getProjectStatus(project);
                              if (status.status === "aktif")
                                return "Donate Now";
                              if (status.status === "soon")
                                return "Coming Soon";
                              if (status.status === "selesai")
                                return "Target Achieved";
                              return "Already Ended";
                            })()}
                          </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </InfiniteScroll>

              {/* No results */}
              {projects.length === 0 && !loading && (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {searchTerm
                      ? "No projects found"
                      : "No projects available yet"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm
                      ? "Try other keywords for your search"
                      : "Be the first to start your dream project!"}
                  </p>
                  {!searchTerm && (
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Start Your Project
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
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
                Platform crowdfunding terpercaya untuk mewujudkan impian
                bersama.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Tentang</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cara Kerja
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tim Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Karir
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Bantuan</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Kontak
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Syarat & Ketentuan
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Ikuti Kami</h5>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Instagram
                </a>
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
