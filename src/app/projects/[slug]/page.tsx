"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { IProjectResponse } from "@/interfaces/interfaces";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import Navbar from "@/components/Navbar";
import { Menu, X, Heart, FileText, ExternalLink, Eye } from "lucide-react";

// Lazy load heavy components to reduce initial bundle size
const MidtransScript = lazy(() => import("@/components/MidtransScript"));
const DonateModal = lazy(() => import("@/components/DonateModal"));
const FundingProgress = lazy(() => import("@/components/FundingProgress"));
const ProjectHeader = lazy(() => import("@/components/ProjectHeader"));
const RecentDonations = lazy(() => import("@/components/RecentDonations"));
const ProjectSidebar = lazy(() => import("@/components/ProjectSidebar"));
const SuccessModal = lazy(() => import("@/components/SuccessModal"));
const ProjectChat = lazy(() => import("@/components/ProjectChat"));
const LivestreamSection = lazy(() => import("@/components/LivestreamSection"));
const ProjectInsights = lazy(() => import("@/components/ProjectInsights"));

interface IApiUserResp {
  username: string;
  userId: string;
}

interface MidtransResult {
  transaction_id: string;
  payment_type: string;
  order_id: string;
}

interface MidtransSnap {
  pay: (
    token: string,
    callbacks: {
      onSuccess: (result: MidtransResult) => void;
      onPending: () => void;
      onError: () => void;
      onClose: () => void;
    }
  ) => void;
}

declare global {
  interface Window {
    snap: MidtransSnap;
  }
}

interface SwotCard {
  title: string;
  description: string;
  excerpt: string;
  badge: string;
}

// Loading fallback components
const ModalLoadingFallback = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg">
      <LoadingSpinner message="Loading..." />
    </div>
  </div>
);

const ComponentLoadingFallback = ({ message }: { message: string }) => (
  <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
    <p className="text-gray-600 font-normal">{message}</p>
  </div>
);

export default function ProjectDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [project, setProject] = useState<IProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<IApiUserResp | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${params.slug}`);
      if (!response.ok) {
        throw new Error("Project not found");
      }
      const data = await response.json();
      setProject(data);
    } catch {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  const checkOwnership = useCallback(async () => {
    try {
      const userResponse = await fetch("/api/user");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.user) {
          setCurrentUser(userData.user);
          setIsLoggedIn(true);
          if (project && project.owner) {
            setIsOwner(userData.user.userId === project.owner.id);
          }
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
          setIsOwner(false);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setIsOwner(false);
      }
    } catch (error) {
      console.error("Error checking ownership:", error);
      setIsLoggedIn(false);
      setCurrentUser(null);
      setIsOwner(false);
    }
  }, [project]);

  useEffect(() => {
    if (params.slug) {
      fetchProject();
    }
  }, [params.slug, fetchProject]);

  useEffect(() => {
    if (project) {
      checkOwnership();
    }
  }, [project, checkOwnership]);

  useEffect(() => {
    const donationSuccess = searchParams.get("donation_success");
    const orderId = searchParams.get("order_id");

    if (donationSuccess === "true" && orderId) {
      setShowSuccessModal(true);
      setDonationAmount(1000);
      fetchProject();
      window.history.replaceState({}, "", `/projects/${params.slug}`);
    }
  }, [searchParams, params.slug, fetchProject]);

  const handleDonationSuccess = (amount: number) => {
    setShowSuccessModal(true);
    setDonationAmount(amount);
    fetchProject();
  };

  if (loading) {
    return <LoadingSpinner message="Loading project..." />;
  }

  if (error || !project) {
    return (
      <ErrorMessage
        title="Project Not Found"
        message="The project you're looking for doesn't exist."
        showHomeButton={true}
      />
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Lazy load MidtransScript - only loads when donation modal opens */}
        {showDonateModal && (
          <Suspense fallback={<ModalLoadingFallback />}>
            <MidtransScript />
          </Suspense>
        )}

        {/* Modals with lazy loading */}
        <Suspense fallback={<ModalLoadingFallback />}>
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title="Thank You!"
            message="Your donation of"
            amount={donationAmount}
            showFundingUpdate={true}
          />
        </Suspense>

        <Suspense fallback={<ModalLoadingFallback />}>
          <DonateModal
            isOpen={showDonateModal}
            onClose={() => setShowDonateModal(false)}
            projectId={project._id.toString()}
            isFundingComplete={project.isFundingComplete}
            onDonationSuccess={handleDonationSuccess}
          />
        </Suspense>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Project Header */}
          <Suspense
            fallback={
              <ComponentLoadingFallback message="Loading project header..." />
            }
          >
            <ProjectHeader
              name={project.name}
              location={project.location}
              imageUrl={project.projectImage}
            />
          </Suspense>

          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-black rounded-lg hover:bg-gray-50 transition-colors font-normal"
            >
              {sidebarOpen ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Close Project Info</span>
                </>
              ) : (
                <>
                  <Menu className="w-4 h-4" />
                  <span>View Project Info</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Description */}
              <div className="bg-white border border-black rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-medium text-black">
                      About This Project
                    </h2>
                    <p className="text-sm text-gray-600 font-normal">
                      Learn more about this initiative
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg font-normal">
                  {project.description}
                </p>
              </div>

              {/* Funding Progress Component */}
              <Suspense
                fallback={
                  <ComponentLoadingFallback message="Loading funding progress..." />
                }
              >
                <FundingProgress
                  currentFunding={project.currentFunding}
                  fundingGoal={project.fundingGoal}
                  isFundingComplete={project.isFundingComplete}
                  completedAt={project.completedAt}
                  projectSlug={project.slug}
                />
              </Suspense>

              {/* Livestream Section - Heavy component with Agora SDK */}
              <div className="bg-white border border-black rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">📹</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-medium text-black">
                      Live Stream
                    </h2>
                    <p className="text-sm text-gray-600 font-normal">
                      Watch live updates and engage with the project creator
                    </p>
                  </div>
                </div>

                <Suspense
                  fallback={
                    <ComponentLoadingFallback message="Loading livestream..." />
                  }
                >
                  <LivestreamSection
                    isLoggedIn={isLoggedIn}
                    projectSlug={params.slug as string}
                    isOwner={isOwner}
                    userId={currentUser?.userId || ""}
                    userName={currentUser?.username || ""}
                  />
                </Suspense>
              </div>

              {/* Project Chat - Heavy component with Pusher */}
              <Suspense
                fallback={
                  <ComponentLoadingFallback message="Loading chat..." />
                }
              >
                <ProjectChat projectSlug={project.slug} isOwner={isOwner} />
              </Suspense>

              {/* Recent Donations */}
              <Suspense
                fallback={
                  <ComponentLoadingFallback message="Loading donations..." />
                }
              >
                <RecentDonations
                  donations={project.donations}
                  projectSlug={project.slug}
                />
              </Suspense>

              {/* AI Insights Section */}
              {project.aiInsights &&
                Object.keys(project.aiInsights).length > 0 && (
                  <Suspense
                    fallback={
                      <ComponentLoadingFallback message="Loading AI insights..." />
                    }
                  >
                    <ProjectInsights
                      aiInsights={
                        project.aiInsights as Record<string, SwotCard>
                      }
                    />
                  </Suspense>
                )}

              {/* Project Proposal Section */}
              {(project.proposalDocumentUrl || project.aiProposal) && (
                <div className="bg-white border border-black rounded-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-medium text-black">
                        Project Proposal
                      </h2>
                      <p className="text-sm text-gray-600 font-normal">
                        Detailed project documentation and planning
                      </p>
                    </div>
                  </div>

                  {/* Priority: Show Document URL if exists, otherwise show AI Proposal */}
                  {project.proposalDocumentUrl ? (
                    // Show Document URL (Priority 1)
                    <div className="p-6 rounded-lg border border-gray-300 bg-gray-50">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-gray-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-3 h-3 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-black">
                          Proposal Document
                        </h3>
                        <span className="px-2 py-1 text-xs font-normal rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                          PDF/Document
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 font-normal">
                        Access the complete project proposal document with
                        detailed specifications, timelines, and budget
                        breakdown.
                      </p>

                      {/* Download/View Button */}
                      <a
                        href={project.proposalDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-normal transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Document
                      </a>
                    </div>
                  ) : (
                    // Show AI Proposal (Priority 2 - only if no document URL)
                    project.aiProposal && (
                      <div className="p-6 rounded-lg border border-blue-300 bg-blue-50">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs">✨</span>
                          </div>
                          <h3 className="text-lg font-medium text-black">
                            AI-Generated Proposal
                          </h3>
                          <span className="px-2 py-1 text-xs font-normal rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                            AI Enhanced
                          </span>
                        </div>

                        {/* Preview Text */}
                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-4">
                          <p className="font-normal">
                            {project.aiProposal.length > 300
                              ? `${project.aiProposal.substring(0, 300)}...`
                              : project.aiProposal}
                          </p>
                        </div>

                        {/* View Full Proposal Button */}
                        <Link
                          href={`/projects/${project.slug}/proposal`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-normal transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View Full Proposal
                        </Link>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div
              className={`lg:col-span-1 ${
                sidebarOpen ? "block" : "hidden lg:block"
              }`}
            >
              <Suspense
                fallback={
                  <ComponentLoadingFallback message="Loading sidebar..." />
                }
              >
                <ProjectSidebar
                  isFundingComplete={project.isFundingComplete}
                  completedAt={project.completedAt}
                  projectStartDate={project.projectStartDate}
                  projectEndDate={project.projectEndDate}
                  fundraisingEndDate={project.fundraisingEndDate}
                  owner={project.owner || undefined}
                  onDonateClick={() => setShowDonateModal(true)}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
