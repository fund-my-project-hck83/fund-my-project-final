'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import Link from 'next/link';

interface SwotCard {
  title: string;
  description: string;
  excerpt: string;
  badge: string;
}

export default function ProjectDisplayPage({ params }: { params: Promise<{ slug: string }> }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    const initializeAndFetch = async () => {
      try {
        // Await the params Promise
        const resolvedParams = await params;
        setSlug(resolvedParams.slug);
        
        const response = await fetch(`/api/projects/${resolvedParams.slug}`);
        if (response.ok) {
          const projectData = await response.json();
          setProject(projectData);
        } else {
          setError('Project not found');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetch();
  }, [params]);

  const getCardStyle = (type: string): string => {
    const styles: Record<string, string> = {
      strength: 'border-green-200 bg-green-50',
      weakness: 'border-red-200 bg-red-50', 
      opportunities: 'border-blue-200 bg-blue-50',
      threat: 'border-orange-200 bg-orange-50'
    };
    return styles[type] || 'border-gray-200 bg-gray-50';
  };

  const getBadgeStyle = (type: string): string => {
    const styles: Record<string, string> = {
      strength: 'bg-green-100 text-green-800',
      weakness: 'bg-red-100 text-red-800',
      opportunities: 'bg-blue-100 text-blue-800', 
      threat: 'bg-orange-100 text-orange-800'
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = () => {
    if (!project) return 0;
    return Math.min((project.currentFunding / project.fundingGoal) * 100, 100);
  };

  const getDaysRemaining = () => {
    if (!project) return 0;
    const endDate = new Date(project.fundraisingEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The project you\'re looking for doesn\'t exist.'}</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={project.projectImage}
          alt={project.name}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-4">{project.name}</h1>
            <p className="text-xl text-gray-200 mb-4">{project.description}</p>
            <div className="flex items-center space-x-4 text-gray-300">
              <span>📍 {project.location}</span>
              <span>⏰ {getDaysRemaining()} days remaining</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Funding Progress */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Funding Progress</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatCurrency(project.currentFunding)}
                  </span>
                  <span className="text-gray-600">
                    raised of {formatCurrency(project.fundingGoal)} goal
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{calculateProgress().toFixed(1)}% funded</span>
                  <span>{getDaysRemaining()} days to go</span>
                </div>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Expected Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {project.impactMetrics.map((metric, index) => (
                  <div key={index} className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {metric.number.toLocaleString()}
                    </div>
                    <div className="text-gray-700 capitalize">
                      {metric.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            {project.aiInsights && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(project.aiInsights as Record<string, SwotCard>).map(([key, insight]) => (
                    <div
                      key={key}
                      className={`p-6 rounded-lg border-2 ${getCardStyle(key)} relative overflow-hidden`}
                    >
                      {/* Decorative wave pattern */}
                      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <path
                            d="M0,50 Q25,20 50,50 T100,50 L100,0 L0,0 Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 capitalize">
                            {key}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeStyle(key)}`}>
                            {insight.badge}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-gray-800 mb-2">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{insight.excerpt}</p>
                        <p className="text-xs text-gray-500">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Proposal */}
            {(project.aiProposal || project.proposalDocumentUrl) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Proposal</h2>
                <div className="space-y-4">
                  {project.proposalDocumentUrl && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Uploaded Proposal Document</h3>
                      <a
                        href={project.proposalDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        📄 View Proposal Document
                      </a>
                    </div>
                  )}
                  
                  {project.aiProposal && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">AI-Generated Proposal</h3>
                      <a
                        href={`/projects/${slug}/proposal`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mr-4"
                      >
                        🤖 View AI Proposal
                      </a>
                      <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                          {project.aiProposal.substring(0, 300)}...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donate Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <button className="w-full bg-green-600 text-white py-4 px-6 rounded-md text-lg font-medium hover:bg-green-700 transition-colors">
                💰 Donate Now
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Secure donation processing
              </p>
            </div>

            {/* Project Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Project Timeline</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Fundraising:</span>
                  <div className="text-gray-600">
                    {new Date(project.fundraisingStartDate).toLocaleDateString()} - 
                    {new Date(project.fundraisingEndDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Project Implementation:</span>
                  <div className="text-gray-600">
                    {new Date(project.projectStartDate).toLocaleDateString()} - 
                    {new Date(project.projectEndDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Share This Project</h3>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700">
                  Facebook
                </button>
                <button className="flex-1 bg-sky-500 text-white py-2 px-3 rounded text-sm hover:bg-sky-600">
                  Twitter
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}