"use client";

import { useState } from "react";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SwotCard {
  title: string;
  description: string;
  excerpt: string;
  badge: string;
}

interface ProjectInsightsProps {
  aiInsights: Record<string, SwotCard>;
}

export default function ProjectInsights({ aiInsights }: ProjectInsightsProps) {
  const [expandedInsights, setExpandedInsights] = useState<
    Record<string, boolean>
  >({});

  const getInsightIcon = (type: string) => {
    const icons = {
      strength: <Zap className="w-5 h-5 text-green-600" />,
      weakness: <AlertTriangle className="w-5 h-5 text-red-600" />,
      opportunities: <TrendingUp className="w-5 h-5 text-blue-600" />,
      threat: <Target className="w-5 h-5 text-orange-600" />,
    };
    return (
      icons[type as keyof typeof icons] || (
        <TrendingUp className="w-5 h-5 text-gray-600" />
      )
    );
  };

  const toggleInsightExpansion = (key: string) => {
    setExpandedInsights((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
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
        {Object.entries(aiInsights)
          .filter(([key]) => key === "strength" || key === "opportunities")
          .map(([key, insight]) => {
            const isExpanded = expandedInsights[key] || false;

            return (
              <div
                key={key}
                className={`border-2 rounded-lg transition-all duration-300 hover:border-gray-800 bg-white ${
                  key === "strength" ? "border-green-500" : "border-blue-500"
                }`}
              >
                {/* Main Card Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          key === "strength" ? "bg-green-500" : "bg-blue-500"
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
            This assessment highlights the project&apos;s strengths and growth
            opportunities
          </span>
        </div>
      </div>
    </div>
  );
}
