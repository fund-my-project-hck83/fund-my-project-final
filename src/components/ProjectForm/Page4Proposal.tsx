'use client';

import { useState } from 'react';
import { ProjectFormData } from './FormWrapper';

interface Page4Props {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
  errors: { [key: string]: string };
}

interface SwotCard {
  title: string;
  description: string;
  excerpt: string;
  badge: string;
  type: 'strength' | 'weakness' | 'opportunities' | 'threat';
}

export default function Page4Proposal({ formData, updateFormData, errors }: Page4Props) {
  const [generating, setGenerating] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  // Generate AI proposal
  const generateAIProposal = async () => {
    setGenerating(true);
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        fundingGoal: Number(formData.fundingGoal),
        projectStartDate: formData.projectStartDate,
        projectEndDate: formData.projectEndDate,
        impactMetrics: formData.impactMetrics.map(m => ({
          number: Number(m.number),
          description: m.description
        }))
      };

      const response = await fetch('/api/ai/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: projectData })
      });

      if (response.ok) {
        const data = await response.json();
        updateFormData({ 
          aiProposal: data.proposal,
          proposalType: 'ai'
        });
      } else {
        alert('Failed to generate proposal. Please try again.');
      }
    } catch (error) {
      console.error('Error generating proposal:', error);
      alert('Failed to generate proposal. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Generate AI insights
  const generateAIInsights = async () => {
    setGeneratingInsights(true);
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        fundingGoal: Number(formData.fundingGoal),
        impactMetrics: formData.impactMetrics.map(m => ({
          number: Number(m.number),
          description: m.description
        }))
      };

      const response = await fetch('/api/ai/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: projectData })
      });

      if (response.ok) {
        const data = await response.json();
        const insights = [
          { ...data.strength, type: 'strength' },
          { ...data.weakness, type: 'weakness' },
          { ...data.opportunities, type: 'opportunities' },
          { ...data.threat, type: 'threat' }
        ];
        updateFormData({ aiInsights: insights });
      } else {
        alert('Failed to generate insights. Please try again.');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Failed to generate insights. Please try again.');
    } finally {
      setGeneratingInsights(false);
    }
  };

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

  return (
    <div className="space-y-8">
      {/* Proposal Section */}
      <div>
        <h3 className="text-lg font-medium text-black mb-4">Project Proposal</h3>
        
        {!formData.proposalType && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => updateFormData({ proposalType: 'upload' })}
              className="p-6 border border-black rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">📄</div>
                <h4 className="text-lg font-medium text-black">Upload Proposal</h4>
                <p className="text-gray-600 font-normal">Upload your 3-page proposal document</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                updateFormData({ proposalType: 'ai' });
                generateAIProposal();
              }}
              className="p-6 border border-black rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h4 className="text-lg font-medium text-black">AI Generated</h4>
                <p className="text-gray-600 font-normal">Generate proposal using AI</p>
              </div>
            </button>
          </div>
        )}

        {formData.proposalType === 'upload' && (
          <div>
            <label htmlFor="proposalUrl" className="block text-sm font-medium text-black mb-2">
              Proposal Document URL *
            </label>
            <input
              type="url"
              id="proposalUrl"
              value={formData.proposalUrl}
              onChange={(e) => updateFormData({ proposalUrl: e.target.value })}
              className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal ${
                errors.proposalUrl ? 'border-red-500' : 'border-black'
              }`}
              placeholder="https://drive.google.com/file/d/your-document-id"
            />
            {errors.proposalUrl && (
              <p className="mt-2 text-sm text-red-600 font-normal">{errors.proposalUrl}</p>
            )}
            <p className="text-sm text-gray-600 font-normal mt-2">
              Upload your document to Google Drive, Dropbox, or similar and paste the share link
            </p>
          </div>
        )}

        {formData.proposalType === 'ai' && (
          <div>
            {generating ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                <p className="mt-4 text-gray-600 font-normal">Generating AI proposal...</p>
              </div>
            ) : formData.aiProposal ? (
              <div>
                <h4 className="text-lg font-medium text-black mb-4">Generated Proposal</h4>
                <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-normal">{formData.aiProposal}</pre>
                </div>
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-black font-normal">
                    ✅ <strong>AI Proposal will be available at:</strong> 
                    <br />
                    <code className="text-gray-600">/projects/your-project-slug/proposal</code>
                    <br />
                    <span className="text-xs text-gray-500">Accessible after project creation - shareable and printable</span>
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {formData.proposalType && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                updateFormData({ 
                  proposalType: null, 
                  proposalUrl: '', 
                  aiProposal: '',
                  aiInsights: null
                });
              }}
              className="text-black hover:underline text-sm font-normal"
            >
              ← Change proposal method
            </button>
          </div>
        )}
      </div>

      {/* AI Insights Section */}
      <div>
        <h3 className="text-lg font-medium text-black mb-4">AI Insights (Required)</h3>
        <p className="text-sm text-gray-600 font-normal mb-4">
          Generate strategic insights about your project to help potential donors understand its strengths, challenges, and opportunities.
        </p>

        {!formData.aiInsights ? (
          <div className="text-center py-8 border border-black rounded-lg">
            <div className="text-4xl mb-4">🧠</div>
            <h4 className="text-lg font-medium text-black mb-2">Generate Strategic Insights</h4>
            <p className="text-gray-600 font-normal mb-4">
              Our AI will analyze your project and provide SWOT analysis to strengthen your campaign.
            </p>
            <button
              type="button"
              onClick={generateAIInsights}
              disabled={generatingInsights}
              className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto font-normal"
            >
              {generatingInsights && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{generatingInsights ? 'Generating Insights...' : 'Generate SWOT Analysis'}</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-medium text-black">Generated Strategic Insights</h4>
              <button
                type="button"
                onClick={generateAIInsights}
                disabled={generatingInsights}
                className="text-sm text-black hover:underline font-normal"
              >
                🔄 Regenerate
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.aiInsights.map((insight: SwotCard, index: number) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg border ${getCardStyle(insight.type)} relative overflow-hidden`}
                >
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-lg font-medium text-black capitalize">
                        {insight.type}
                      </h5>
                      <span className={`px-2 py-1 text-xs font-normal rounded-full ${getBadgeStyle(insight.type)}`}>
                        {insight.badge}
                      </span>
                    </div>
                    
                    <h6 className="font-medium text-black mb-2">{insight.title}</h6>
                    <p className="text-sm text-gray-600 font-normal mb-3">{insight.excerpt}</p>
                    <p className="text-xs text-gray-500 font-normal">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Requirements Check */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-black mb-2">Completion Requirements</h4>
        <div className="space-y-1 text-sm text-gray-600 font-normal">
          <div className="flex items-center">
            <span className={`mr-2 ${(formData.proposalUrl || formData.aiProposal) ? 'text-green-600' : 'text-gray-400'}`}>
              {(formData.proposalUrl || formData.aiProposal) ? '✅' : '⚪'}
            </span>
            Proposal (uploaded or AI-generated)
          </div>
          <div className="flex items-center">
            <span className={`mr-2 ${formData.aiInsights ? 'text-green-600' : 'text-gray-400'}`}>
              {formData.aiInsights ? '✅' : '⚪'}
            </span>
            AI Strategic Insights (SWOT Analysis)
          </div>
        </div>
      </div>
    </div>
  );
}