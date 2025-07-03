"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { IProjectResponse } from "@/interfaces/interfaces";
import Link from "next/link";
import MidtransScript from "@/components/MidtransScript";
import DonateModal from "@/components/DonateModal";
import FundingProgress from "@/components/FundingProgress";
import ProjectHeader from "@/components/ProjectHeader";
import RecentDonations from "@/components/RecentDonations";
import ProjectSidebar from "@/components/ProjectSidebar";
import SuccessModal from "@/components/SuccessModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import {
  Menu,
  X,
  Heart,
  TrendingUp,
  Target,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Eye,
  Video,
} from "lucide-react";
import ProjectChat from "@/components/ProjectChat";
import LivestreamSection from "@/components/LivestreamSection";
import Navbar from "@/components/Navbar";

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

export default function ProjectDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [project, setProject] = useState<IProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [error, setError] = useState('');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<IApiUserResp | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<
    Record<string, boolean>
  >({});
  console.log(currentUser, "<<<<<<<<<<<<");

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

  const getInsightIcon = (type: string) => {
    const icons = {
      strength: <Zap className="w-5 h-5 text-green-600" />,
      weakness: <AlertTriangle className="w-5 h-5 text-red-600" />,
      opportunities: <TrendingUp className="w-5 h-5 text-blue-600" />,
      threat: <Target className="w-5 h-5 text-orange-600" />,
    };
    return (
      icons[type as keyof typeof icons] || (
        <Heart className="w-5 h-5 text-gray-600" />
      )
    );
  };

  const getInsightGradient = (type: string): string => {
    const gradients = {
      strength: "from-green-500 to-emerald-600",
      weakness: "from-red-500 to-red-600",
      opportunities: "from-blue-500 to-blue-600",
      threat: "from-orange-500 to-orange-600",
    };
    return (
      gradients[type as keyof typeof gradients] || "from-gray-500 to-gray-600"
    );
  };

  const getInsightBorder = (type: string): string => {
    const borders = {
      strength: "border-green-200 hover:border-green-300",
      weakness: "border-red-200 hover:border-red-300",
      opportunities: "border-blue-200 hover:border-blue-300",
      threat: "border-orange-200 hover:border-orange-300",
    };
    return (
      borders[type as keyof typeof borders] ||
      "border-gray-200 hover:border-gray-300"
    );
  };

  const getBadgeStyle = (type: string): string => {
    const styles = {
      strength: "bg-green-100 text-green-800 border-green-200",
      weakness: "bg-red-100 text-red-800 border-red-200",
      opportunities: "bg-blue-100 text-blue-800 border-blue-200",
      threat: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return (
      styles[type as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const toggleInsightExpansion = (key: string) => {
    setExpandedInsights((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <MidtransScript />

      {/* Modals */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thank You!"
        message="Your donation of"
        amount={donationAmount}
        showFundingUpdate={true}
      />

      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
        projectId={project._id.toString()}
        isFundingComplete={project.isFundingComplete}
        onDonationSuccess={handleDonationSuccess}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <ProjectHeader
          name={project.name}
          location={project.location}
          imageUrl={project.projectImage}
        />

        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
          >
            {sidebarOpen ? (
              <>
                <X className="w-4 h-4" />
                Close Sidebar
              </>
            ) : (
              <>
                <Menu className="w-4 h-4" />
                Project Info
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Livestream Indicator (for public users) */}
            {/* {!isOwner && (
              <LivestreamIndicator 
                projectSlug={project.slug}
              />
            )} */}

            {/* Project Description */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    About This Project
                  </h2>
                  <p className="text-sm text-gray-600">
                    Learn more about this initiative
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {project.description}
              </p>
            </div>

            {/* Funding Progress Component */}
            <FundingProgress
              currentFunding={project.currentFunding}
              fundingGoal={project.fundingGoal}
              isFundingComplete={project.isFundingComplete}
              completedAt={project.completedAt}
              projectSlug={project.slug}
            />

            {/* Livestream Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Live Stream
                  </h2>
                  <p className="text-sm text-gray-600">
                    Watch live updates and engage with the project creator
                  </p>
                </div>
              </div>

              <LivestreamSection
                isLoggedIn={isLoggedIn}
                projectSlug={params.slug as string}
                isOwner={isOwner}
                userId={currentUser?.userId || ""}
                userName={currentUser?.username || ""}
              />
            </div>

            {/* Project Chat */}
            <ProjectChat projectSlug={project.slug} isOwner={isOwner} />

            {/* Recent Donations */}
            <RecentDonations
              donations={project.donations}
              projectSlug={project.slug}
            />

            {/* AI Insights Section - Added here, after Recent Donations */}
            {project.aiInsights &&
              Object.keys(project.aiInsights).length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        AI Project Analysis
                      </h2>
                      <p className="text-sm text-gray-600">
                        Strategic insights powered by artificial intelligence
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(
                      project.aiInsights as Record<string, SwotCard>
                    )
                      .filter(
                        ([key]) => key === "strength" || key === "opportunities"
                      )
                      .map(([key, insight]) => {
                        const isExpanded = expandedInsights[key] || false;

                        return (
                          <div
                            key={key}
                            className={`group relative rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getInsightBorder(
                              key
                            )} bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white overflow-hidden`}
                          >
                            {/* Decorative Background Pattern */}
                            <div className="absolute top-0 right-0 w-20 h-20 opacity-5 overflow-hidden rounded-xl">
                              <div
                                className={`w-full h-full bg-gradient-to-br ${getInsightGradient(
                                  key
                                )} transform rotate-12 scale-150`}
                              ></div>
                            </div>

                            {/* Main Card Content */}
                            <div className="relative p-6">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 bg-gradient-to-r ${getInsightGradient(
                                      key
                                    )} rounded-lg flex items-center justify-center`}
                                  >
                                    {getInsightIcon(key)}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900 capitalize group-hover:text-gray-800 transition-colors">
                                      {key === "opportunities"
                                        ? "Opportunities"
                                        : key.replace(/([A-Z])/g, " $1").trim()}
                                    </h3>
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getBadgeStyle(
                                    key
                                  )} transition-all duration-200`}
                                >
                                  {insight.badge}
                                </span>
                              </div>

                              {/* Always Visible Content */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-gray-800 leading-snug">
                                  {insight.title}
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {insight.excerpt}
                                </p>
                              </div>

                              {/* Expandable Content */}
                              <div
                                className={`transition-all duration-300 overflow-hidden ${
                                  isExpanded
                                    ? "max-h-96 opacity-100 mt-4"
                                    : "max-h-0 opacity-0"
                                }`}
                              >
                                <div className="pt-3 border-t border-gray-100">
                                  <p className="text-sm text-gray-500 leading-relaxed">
                                    {insight.description}
                                  </p>
                                </div>
                              </div>

                              {/* Toggle Button */}
                              <button
                                onClick={() => toggleInsightExpansion(key)}
                                className={`w-full mt-4 py-2 px-4 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${
                                  isExpanded
                                    ? `${getBadgeStyle(key)} hover:opacity-80`
                                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {isExpanded ? (
                                  <>
                                    Show Less
                                    <ChevronUp className="w-4 h-4" />
                                  </>
                                ) : (
                                  <>
                                    Show Details
                                    <ChevronDown className="w-4 h-4" />
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Hover Effect Border */}
                            <div
                              className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getInsightGradient(
                                key
                              )} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                            ></div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✨</span>
                      </div>
                      <span className="font-medium">AI-Powered Analysis:</span>
                      <span>
                        This assessment highlights the project&apos;s strengths
                        and growth opportunities
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Project Proposal Section */}
            {(project.proposalDocumentUrl || project.aiProposal) && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Project Proposal
                    </h2>
                    <p className="text-sm text-gray-600">
                      Detailed project documentation and planning
                    </p>
                  </div>
                </div>

                {/* Priority: Show Document URL if exists, otherwise show AI Proposal */}
                {project.proposalDocumentUrl ? (
                  // Show Document URL (Priority 1)
                  <div className="p-6 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-gray-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Proposal Document
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        PDF/Document
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Access the complete project proposal document with
                      detailed specifications, timelines, and budget breakdown.
                    </p>

                    {/* Download/View Button */}
                    <a
                      href={project.proposalDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Document
                    </a>
                  </div>
                ) : (
                  // Show AI Proposal (Priority 2 - only if no document URL)
                  project.aiProposal && (
                    <div className="p-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs">✨</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          AI-Generated Proposal
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          AI Enhanced
                        </span>
                      </div>

                      {/* Preview Text */}
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-4">
                        <p>
                          {project.aiProposal.length > 300
                            ? `${project.aiProposal.substring(0, 300)}...`
                            : project.aiProposal}
                        </p>
                      </div>

                      {/* View Full Proposal Button */}
                      <Link
                        href={`/projects/${project.slug}/proposal`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 text-sm"
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
            <ProjectSidebar
              isFundingComplete={project.isFundingComplete}
              completedAt={project.completedAt}
              projectStartDate={project.projectStartDate}
              projectEndDate={project.projectEndDate}
              fundraisingEndDate={project.fundraisingEndDate}
              owner={project.owner || undefined}
              onDonateClick={() => setShowDonateModal(true)}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
