"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import { ArrowLeft, Printer, Share2 } from "lucide-react";

export default function ProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    const initializeAndFetch = async () => {
      try {
        const { slug } = await params;
        setSlug(slug);

        const response = await fetch(`/api/projects/${slug}`);
        if (response.ok) {
          const projectData = await response.json();
          setProject(projectData);
        } else {
          setError("Project not found");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetch();
  }, [params]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-normal">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📄</span>
          </div>
          <h1 className="text-2xl font-medium text-black mb-4">
            Proposal Not Found
          </h1>
          <p className="text-gray-600 mb-8 font-normal">
            {error || "The proposal you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-normal"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!project.aiProposal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🤖</span>
          </div>
          <h1 className="text-2xl font-medium text-black mb-4">
            No AI Proposal Available
          </h1>
          <p className="text-gray-600 mb-8 font-normal">
            This project doesn&apos;t have an AI-generated proposal.
          </p>
          <button
            onClick={() => router.push(`/projects/${slug}`)}
            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-normal"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/projects/${slug}`)}
                className="flex items-center text-gray-600 hover:text-black transition-colors font-normal"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Project
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-medium text-black">
                AI-Generated Proposal
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.print()}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-black border border-gray-300 rounded-full hover:border-black transition-colors font-normal"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="flex items-center px-3 py-2 text-sm text-white bg-black rounded-full hover:bg-gray-800 transition-colors font-normal"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Proposal Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-black rounded-lg overflow-hidden">
            {/* Document Header */}
            <div className="bg-black text-white p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-medium mb-3">{project.name}</h1>
                  <p className="text-gray-300 text-lg font-normal">
                    {project.description}
                  </p>
                </div>
                <div className="ml-6">
                  <div className="bg-white text-black border border-gray-300 rounded-lg px-3 py-2 text-sm font-normal">
                    AI Generated
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                  <div className="text-gray-600 font-normal">Location</div>
                  <div className="font-medium text-black">
                    📍 {project.location}
                  </div>
                </div>
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                  <div className="text-gray-600 font-normal">Funding Goal</div>
                  <div className="font-medium text-black">
                    💰 {formatCurrency(project.fundingGoal)}
                  </div>
                </div>
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                  <div className="text-gray-600 font-normal">Generated</div>
                  <div className="font-medium text-black">
                    📅 {new Date().toLocaleDateString("id-ID")}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-gray-700 leading-relaxed font-normal"
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily:
                      '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: project.aiProposal
                      // Convert markdown-style headers to HTML
                      .replace(
                        /^### (.*$)/gm,
                        '<h3 class="text-xl font-medium text-black mt-6 mb-3">$1</h3>'
                      )
                      .replace(
                        /^## (.*$)/gm,
                        '<h2 class="text-2xl font-medium text-black mt-8 mb-4">$1</h2>'
                      )
                      .replace(
                        /^# (.*$)/gm,
                        '<h1 class="text-3xl font-medium text-black mt-8 mb-6">$1</h1>'
                      )
                      // Convert markdown-style bold text
                      .replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="font-medium text-black">$1</strong>'
                      )
                      // Convert markdown-style bullet points
                      .replace(
                        /^- (.*$)/gm,
                        '<li class="ml-4 mb-1 font-normal">• $1</li>'
                      )
                      // Convert line breaks to proper spacing
                      .replace(/\n\n/g, '</p><p class="mb-4 font-normal">')
                      // Wrap everything in paragraphs
                      .replace(/^(.+)$/gm, (match, p1) => {
                        // Don't wrap headers or list items
                        if (
                          p1.startsWith("<h") ||
                          p1.startsWith("<li") ||
                          p1.trim() === ""
                        ) {
                          return p1;
                        }
                        return `<p class="mb-4 font-normal">${p1}</p>`;
                      }),
                  }}
                />
              </div>
            </div>

            {/* Document Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-6 text-center">
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong className="font-medium">
                    Proposal AI untuk {project.name}
                  </strong>
                </p>
                <p className="font-normal">
                  Dibuat pada{" "}
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  |
                  <span className="ml-2">
                    Target Dampak:{" "}
                    {project.impactMetrics
                      ?.map((m) => `${m.number} ${m.description}`)
                      .join(", ") || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => router.push(`/projects/${slug}`)}
              className="flex items-center px-6 py-3 bg-white border border-black text-black rounded-full hover:bg-gray-50 transition-colors font-normal"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-normal"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Proposal
            </button>
          </div>
        </div>
      </section>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .sticky {
            position: static !important;
          }
          button {
            display: none !important;
          }
          .border-black {
            border-color: #000 !important;
          }
          .bg-white {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
