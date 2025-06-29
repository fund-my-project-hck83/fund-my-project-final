'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types';

export default function ProposalPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The proposal you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!project.aiProposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No AI Proposal Available</h1>
          <p className="text-gray-600 mb-8">This project doesn&apos;t have an AI-generated proposal.</p>
          <button
            onClick={() => router.push(`/projects/${slug}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/projects/${slug}`)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Project
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">AI-Generated Proposal</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.print()}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Document Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                <p className="text-blue-100 text-lg">{project.description}</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm text-blue-100">AI Generated</div>
                  <div className="text-lg font-semibold">🤖 Proposal</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded p-3">
                <div className="text-blue-100">Location</div>
                <div className="font-semibold">📍 {project.location}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded p-3">
                <div className="text-blue-100">Funding Goal</div>
                <div className="font-semibold">💰 {formatCurrency(project.fundingGoal)}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded p-3">
                <div className="text-blue-100">Generated</div>
                <div className="font-semibold">📅 {new Date().toLocaleDateString('id-ID')}</div>
              </div>
            </div>
          </div>

          {/* Document Body */}
          <div className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                style={{ 
                  whiteSpace: 'pre-wrap',
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
                }}
                dangerouslySetInnerHTML={{
                  __html: project.aiProposal
                    // Convert markdown-style headers to HTML
                    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h3>')
                    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
                    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')
                    // Convert markdown-style bold text
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                    // Convert markdown-style bullet points
                    .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
                    // Convert line breaks to proper spacing
                    .replace(/\n\n/g, '</p><p class="mb-4">')
                    // Wrap everything in paragraphs
                    .replace(/^(.+)$/gm, (match, p1) => {
                      // Don't wrap headers or list items
                      if (p1.startsWith('<h') || p1.startsWith('<li') || p1.trim() === '') {
                        return p1;
                      }
                      return `<p class="mb-4">${p1}</p>`;
                    })
                }}
              />
            </div>
          </div>

          {/* Document Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-6 text-center">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Proposal AI untuk {project.name}</strong>
              </p>
              <p>
                Dibuat pada {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} | 
                <span className="ml-2">
                  Target Dampak: {project.impactMetrics.map(m => `${m.number} ${m.description}`).join(', ')}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => router.push(`/projects/${slug}`)}
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            ← Back to Project
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            🖨️ Print Proposal
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .sticky { position: static !important; }
          button { display: none !important; }
          .shadow-md { box-shadow: none !important; }
          .bg-gray-50 { background: white !important; }
        }
      `}</style>
    </div>
  );
}