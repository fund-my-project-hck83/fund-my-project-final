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
    <div className="min-h-screen bg-white">
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
            {/* Livestream Indicator (for public users) */}
            {/* {!isOwner && (
              <LivestreamIndicator 
                projectSlug={project.slug}
              />
            )} */}

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
            <FundingProgress
              currentFunding={project.currentFunding}
              fundingGoal={project.fundingGoal}
              isFundingComplete={project.isFundingComplete}
              completedAt={project.completedAt}
              projectSlug={project.slug}
            />

            {/* Livestream Section */}
            <div className="bg-white border border-black rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
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

            {/* AI Insights Section - Updated to match flat design */}
            {project.aiInsights &&
              Object.keys(project.aiInsights).length > 0 && (
                <div className="bg-white border border-black rounded-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-medium text-black">
                        AI Project Analysis
                      </h2>
                      <p className="text-sm text-gray-600 font-normal">
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
                            className={`border-2 rounded-lg transition-all duration-300 hover:border-gray-800 bg-white ${
                              key === "strength" 
                                ? "border-green-500" 
                                : "border-blue-500"
                            }`}
                          >
                            {/* Main Card Content */}
                            <div className="p-6">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      key === "strength" 
                                        ? "bg-green-500" 
                                        : "bg-blue-500"
                                    }`}
                                  >
                                    {getInsightIcon(key)}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-medium text-black capitalize">
                                      {key === "opportunities"
                                        ? "Opportunities"
                                        : key.replace(/([A-Z])/g, " $1").trim()}
                                    </h3>
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 text-xs font-normal rounded-full border ${
                                    key === "strength"
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : "bg-blue-100 text-blue-800 border-blue-300"
                                  }`}
                                >
                                  {insight.badge}
                                </span>
                              </div>

                              {/* Always Visible Content */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-black leading-snug">
                                  {insight.title}
                                </h4>
                                <p className="text-sm text-gray-600 font-normal leading-relaxed">
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
                                <div className="pt-3 border-t border-gray-200">
                                  <p className="text-sm text-gray-500 font-normal leading-relaxed">
                                    {insight.description}
                                  </p>
                                </div>
                              </div>

                              {/* Toggle Button */}
                              <button
                                onClick={() => toggleInsightExpansion(key)}
                                className={`w-full mt-4 py-2 px-4 rounded-full border transition-all duration-200 flex items-center justify-center gap-2 text-sm font-normal ${
                                  isExpanded
                                    ? key === "strength"
                                      ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                                      : "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
                                    : "border-black text-gray-600 hover:border-gray-800 hover:bg-gray-50"
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
                          </div>
                        );
                      })}
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✨</span>
                      </div>
                      <span className="font-medium">AI-Powered Analysis:</span>
                      <span className="font-normal">
                        This assessment highlights the project&apos;s strengths
                        and growth opportunities
                      </span>
                    </div>
                  </div>
                </div>
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
                      detailed specifications, timelines, and budget breakdown.
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
