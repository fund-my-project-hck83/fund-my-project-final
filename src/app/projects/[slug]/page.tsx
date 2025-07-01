'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { IProjectResponse } from '@/interfaces/interfaces';
import Link from 'next/link';
import MidtransScript from '@/components/MidtransScript';
import DonateModal from '@/components/DonateModal';
import FundingProgress from '@/components/FundingProgress';
import ProjectHeader from '@/components/ProjectHeader';
import RecentDonations from '@/components/RecentDonations';
import ProjectSidebar from '@/components/ProjectSidebar';
import SuccessModal from '@/components/SuccessModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Menu, X, Heart, TrendingUp, Target, AlertTriangle, Zap, ChevronDown, ChevronUp, BarChart3, FileText, ExternalLink, Eye } from 'lucide-react';

interface MidtransResult {
  transaction_id: string;
  payment_type: string;
  order_id: string;
}

interface MidtransSnap {
  pay: (token: string, callbacks: {
    onSuccess: (result: MidtransResult) => void;
    onPending: () => void;
    onError: () => void;
    onClose: () => void;
  }) => void;
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
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${params.slug}`);
      if (!response.ok) {
        throw new Error('Project not found');
      }
      const data = await response.json();
      setProject(data);
    } catch {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    if (params.slug) {
      fetchProject();
    }
  }, [params.slug, fetchProject]);

  useEffect(() => {
    const donationSuccess = searchParams.get('donation_success');
    const orderId = searchParams.get('order_id');
    
    if (donationSuccess === 'true' && orderId) {
      setShowSuccessModal(true);
      setDonationAmount(1000);
      fetchProject();
      window.history.replaceState({}, '', `/projects/${params.slug}`);
    }
  }, [searchParams, params.slug, fetchProject]);

  const handleDonationSuccess = (amount: number) => {
    setShowSuccessModal(true);
    setDonationAmount(amount);
    fetchProject();
  };

  // const handleOwnerToggle = (newIsOwner: boolean) => {
  //   setIsOwner(newIsOwner);
  // };

  const getInsightIcon = (type: string) => {
    const icons = {
      strength: <Zap className="w-5 h-5 text-green-600" />,
      weakness: <AlertTriangle className="w-5 h-5 text-red-600" />,
      opportunities: <TrendingUp className="w-5 h-5 text-blue-600" />,
      threat: <Target className="w-5 h-5 text-orange-600" />
    };
    return icons[type as keyof typeof icons] || <Heart className="w-5 h-5 text-gray-600" />;
  };

  const getInsightGradient = (type: string): string => {
    const gradients = {
      strength: 'from-green-500 to-emerald-600',
      weakness: 'from-red-500 to-red-600',
      opportunities: 'from-blue-500 to-blue-600',
      threat: 'from-orange-500 to-orange-600'
    };
    return gradients[type as keyof typeof gradients] || 'from-gray-500 to-gray-600';
  };

  const getInsightBorder = (type: string): string => {
    const borders = {
      strength: 'border-green-200 hover:border-green-300',
      weakness: 'border-red-200 hover:border-red-300',
      opportunities: 'border-blue-200 hover:border-blue-300',
      threat: 'border-orange-200 hover:border-orange-300'
    };
    return borders[type as keyof typeof borders] || 'border-gray-200 hover:border-gray-300';
  };

  const getBadgeStyle = (type: string): string => {
    const styles = {
      strength: 'bg-green-100 text-green-800 border-green-200',
      weakness: 'bg-red-100 text-red-800 border-red-200',
      opportunities: 'bg-blue-100 text-blue-800 border-blue-200',
      threat: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const toggleInsightExpansion = (key: string) => {
    setExpandedInsights(prev => ({
      ...prev,
      [key]: !prev[key]
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <MidtransScript />
      
      {/* Owner Toggle Component */}
      {/* <OwnerToggle onToggle={handleOwnerToggle} /> */}
      
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
                  <h2 className="text-2xl font-bold text-gray-800">About This Project</h2>
                  <p className="text-sm text-gray-600">Learn more about this initiative</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">{project.description}</p>
            </div>

            {/* Funding Progress Component */}
            <FundingProgress
              currentFunding={project.currentFunding}
              fundingGoal={project.fundingGoal}
              isFundingComplete={project.isFundingComplete}
              completedAt={project.completedAt}
              projectSlug={project.slug}
            />

            {/* Livestream Manager (for owners) */}
            {/* {isOwner && (
              <LivestreamManager projectSlug={project.slug} />
            )} */}

            {/* Project Chat */}
            {/* <ProjectChat
              projectSlug={project.slug}
              isOwner={isOwner}
            /> */}

            {/* Recent Donations */}
            <RecentDonations 
              donations={project.donations} 
              projectSlug={project.slug}
            />

            {/* AI Insights Section - Added here, after Recent Donations */}
            {project.aiInsights && Object.keys(project.aiInsights).length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">AI Project Analysis</h2>
                    <p className="text-sm text-gray-600">Strategic insights powered by artificial intelligence</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(project.aiInsights as Record<string, SwotCard>)
                    .filter(([key]) => key === 'strength' || key === 'opportunities')
                    .map(([key, insight]) => {
                      const isExpanded = expandedInsights[key] || false;
                      
                      return (
                        <div
                          key={key}
                          className={`group relative rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getInsightBorder(key)} bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white overflow-hidden`}
                        >
                          {/* Decorative Background Pattern */}
                          <div className="absolute top-0 right-0 w-20 h-20 opacity-5 overflow-hidden rounded-xl">
                            <div className={`w-full h-full bg-gradient-to-br ${getInsightGradient(key)} transform rotate-12 scale-150`}></div>
                          </div>

                          {/* Main Card Content */}
                          <div className="relative p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 bg-gradient-to-r ${getInsightGradient(key)} rounded-lg flex items-center justify-center`}>
                                  {getInsightIcon(key)}
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900 capitalize group-hover:text-gray-800 transition-colors">
                                    {key === 'opportunities' ? 'Opportunities' : key.replace(/([A-Z])/g, ' $1').trim()}
                                  </h3>
                                </div>
                              </div>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getBadgeStyle(key)} transition-all duration-200`}>
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
                            <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
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
                                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
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
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getInsightGradient(key)} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
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
                    <span>This assessment highlights the project&apos;s strengths and growth opportunities</span>
                  </div>
                </div>
              </div>
            )}

{/* Impact Metrics Section */}
            {project.impactMetrics && project.impactMetrics.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Expected Impact</h2>
                    <p className="text-sm text-gray-600">Measurable outcomes this project aims to achieve</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {project.impactMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="group relative p-6 rounded-xl border border-emerald-200 hover:border-emerald-300 bg-gradient-to-br from-emerald-50 to-white hover:from-emerald-100 hover:to-emerald-50 transition-all duration-300 hover:shadow-lg"
                    >
                      {/* Decorative Background Pattern */}
                      <div className="absolute top-0 right-0 w-16 h-16 opacity-10 overflow-hidden rounded-xl">
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 transform rotate-12 scale-150"></div>
                      </div>

                      <div className="relative">
                        {/* Number Display */}
                        <div className="mb-4">
                          <div className="text-3xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                            {metric.number.toLocaleString()}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">
                            {metric.description}
                          </p>
                        </div>

                        {/* Decorative Element */}
                        <div className="mt-4 w-12 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all duration-300"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Proposal Section */}
            {(project.aiProposal || project.proposalDocumentUrl) && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Project Proposal</h2>
                    <p className="text-sm text-gray-600">Detailed project documentation and planning</p>
                  </div>
                </div>

                {/* AI Proposal Preview */}
                {project.aiProposal && (
                  <div className="mb-6">
                    <div className="p-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs">✨</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">AI-Generated Proposal</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          AI Enhanced
                        </span>
                      </div>
                      
                      {/* Preview Text */}
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-4">
                        <p>
                          {project.aiProposal.length > 300 
                            ? `${project.aiProposal.substring(0, 300)}...` 
                            : project.aiProposal
                          }
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
                  </div>
                )}

                {/* Document URL */}
                {project.proposalDocumentUrl && (
                  <div className="p-6 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-gray-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Proposal Document</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        PDF/Document
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Access the complete project proposal document with detailed specifications, timelines, and budget breakdown.
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
                )}

                {/* Both Available */}
                {project.aiProposal && project.proposalDocumentUrl && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                    <div className="flex items-center gap-2 text-sm text-indigo-700">
                      <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">💡</span>
                      </div>
                      <span className="font-medium">Comprehensive Documentation:</span>
                      <span>This project includes both AI-enhanced insights and traditional documentation</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className={`lg:col-span-1 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
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
  );




 
} 


// 'use client';

// import { useState, useEffect } from 'react';
// import { Project } from '@/types';
// import Link from 'next/link';

// interface SwotCard {
//   title: string;
//   description: string;
//   excerpt: string;
//   badge: string;
// }

// export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
//   const [project, setProject] = useState<Project | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [slug, setSlug] = useState<string>('');

//   useEffect(() => {
//     const initializeAndFetch = async () => {
//       try {
//         // Await the params Promise
//         const resolvedParams = await params;
//         setSlug(resolvedParams.slug);
        
//         const response = await fetch(`/api/projects/${resolvedParams.slug}`);
//         if (response.ok) {
//           const projectData = await response.json();
//           setProject(projectData);
//         } else {
//           setError('Project not found');
//         }
//       } catch (error) {
//         console.error('Error fetching project:', error);
//         setError('Failed to load project');
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeAndFetch();
//   }, [params]);

//   const getCardStyle = (type: string): string => {
//     const styles: Record<string, string> = {
//       strength: 'border-green-200 bg-green-50',
//       weakness: 'border-red-200 bg-red-50', 
//       opportunities: 'border-blue-200 bg-blue-50',
//       threat: 'border-orange-200 bg-orange-50'
//     };
//     return styles[type] || 'border-gray-200 bg-gray-50';
//   };

//   const getBadgeStyle = (type: string): string => {
//     const styles: Record<string, string> = {
//       strength: 'bg-green-100 text-green-800',
//       weakness: 'bg-red-100 text-red-800',
//       opportunities: 'bg-blue-100 text-blue-800', 
//       threat: 'bg-orange-100 text-orange-800'
//     };
//     return styles[type] || 'bg-gray-100 text-gray-800';
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0,
//     }).format(amount);
//   };

//   const calculateProgress = () => {
//     if (!project) return 0;
//     return Math.min((project.currentFunding / project.fundingGoal) * 100, 100);
//   };

//   const getDaysRemaining = () => {
//     if (!project) return 0;
//     const endDate = new Date(project.fundraisingEndDate);
//     const today = new Date();
//     const diffTime = endDate.getTime() - today.getTime();
//     return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading project...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !project) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
//           <p className="text-gray-600 mb-8">{error || 'The project you\'re looking for doesn\'t exist.'}</p>
//           <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
//             Go Home
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero Section */}
//       <div className="relative h-96 bg-gray-900">
//         <img
//           src={project.projectImage}
//           alt={project.name}
//           className="w-full h-full object-cover opacity-70"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
//         <div className="absolute bottom-0 left-0 right-0 p-8">
//           <div className="max-w-6xl mx-auto">
//             <h1 className="text-4xl font-bold text-white mb-4">{project.name}</h1>
//             <p className="text-xl text-gray-200 mb-4">{project.description}</p>
//             <div className="flex items-center space-x-4 text-gray-300">
//               <span>📍 {project.location}</span>
//               <span>⏰ {getDaysRemaining()} days remaining</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Funding Progress */}
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Funding Progress</h2>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-3xl font-bold text-blue-600">
//                     {formatCurrency(project.currentFunding)}
//                   </span>
//                   <span className="text-gray-600">
//                     raised of {formatCurrency(project.fundingGoal)} goal
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-4">
//                   <div
//                     className="bg-blue-600 h-4 rounded-full transition-all duration-300"
//                     style={{ width: `${calculateProgress()}%` }}
//                   ></div>
//                 </div>
//                 <div className="flex justify-between text-sm text-gray-600">
//                   <span>{calculateProgress().toFixed(1)}% funded</span>
//                   <span>{getDaysRemaining()} days to go</span>
//                 </div>
//               </div>
//             </div>

//             {/* Impact Metrics */}
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Expected Impact</h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 {project.impactMetrics.map((metric, index) => (
//                   <div key={index} className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
//                     <div className="text-3xl font-bold text-blue-600 mb-2">
//                       {metric.number.toLocaleString()}
//                     </div>
//                     <div className="text-gray-700 capitalize">
//                       {metric.description}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* AI Insights */}
//             {project.aiInsights && (
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Analysis</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {Object.entries(project.aiInsights as Record<string, SwotCard>).map(([key, insight]) => (
//                     <div
//                       key={key}
//                       className={`p-6 rounded-lg border-2 ${getCardStyle(key)} relative overflow-hidden`}
//                     >
//                       {/* Decorative wave pattern */}
//                       <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
//                         <svg viewBox="0 0 100 100" className="w-full h-full">
//                           <path
//                             d="M0,50 Q25,20 50,50 T100,50 L100,0 L0,0 Z"
//                             fill="currentColor"
//                           />
//                         </svg>
//                       </div>
                      
//                       <div className="relative">
//                         <div className="flex items-center justify-between mb-3">
//                           <h3 className="text-lg font-bold text-gray-900 capitalize">
//                             {key}
//                           </h3>
//                           <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeStyle(key)}`}>
//                             {insight.badge}
//                           </span>
//                         </div>
                        
//                         <h4 className="font-semibold text-gray-800 mb-2">{insight.title}</h4>
//                         <p className="text-sm text-gray-600 mb-3">{insight.excerpt}</p>
//                         <p className="text-xs text-gray-500">{insight.description}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Project Proposal */}
//             {(project.aiProposal || project.proposalDocumentUrl) && (
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Proposal</h2>
//                 <div className="space-y-4">
//                   {project.proposalDocumentUrl && (
//                     <div>
//                       <h3 className="font-medium text-gray-900 mb-2">Uploaded Proposal Document</h3>
//                       <a
//                         href={project.proposalDocumentUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                       >
//                         📄 View Proposal Document
//                       </a>
//                     </div>
//                   )}
                  
//                   {project.aiProposal && (
//                     <div>
//                       <h3 className="font-medium text-gray-900 mb-2">AI-Generated Proposal</h3>
//                       <a
//                         href={`/projects/${slug}/proposal`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mr-4"
//                       >
//                         🤖 View AI Proposal
//                       </a>
//                       <div className="mt-4 p-4 bg-gray-50 rounded-md border">
//                         <p className="text-sm text-gray-600 mb-2">Preview:</p>
//                         <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
//                           {project.aiProposal.substring(0, 300)}...
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Donate Button */}
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <button className="w-full bg-green-600 text-white py-4 px-6 rounded-md text-lg font-medium hover:bg-green-700 transition-colors">
//                 💰 Donate Now
//               </button>
//               <p className="text-xs text-gray-500 mt-2 text-center">
//                 Secure donation processing
//               </p>
//             </div>

//             {/* Project Timeline */}
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="font-bold text-gray-900 mb-4">Project Timeline</h3>
//               <div className="space-y-4 text-sm">
//                 <div>
//                   <span className="font-medium text-gray-700">Fundraising:</span>
//                   <div className="text-gray-600">
//                     {new Date(project.fundraisingStartDate).toLocaleDateString()} - 
//                     {new Date(project.fundraisingEndDate).toLocaleDateString()}
//                   </div>
//                 </div>
//                 <div>
//                   <span className="font-medium text-gray-700">Project Implementation:</span>
//                   <div className="text-gray-600">
//                     {new Date(project.projectStartDate).toLocaleDateString()} - 
//                     {new Date(project.projectEndDate).toLocaleDateString()}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Share */}
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="font-bold text-gray-900 mb-4">Share This Project</h3>
//               <div className="flex space-x-2">
//                 <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700">
//                   Facebook
//                 </button>
//                 <button className="flex-1 bg-sky-500 text-white py-2 px-3 rounded text-sm hover:bg-sky-600">
//                   Twitter
//                 </button>
//                 <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700">
//                   WhatsApp
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }