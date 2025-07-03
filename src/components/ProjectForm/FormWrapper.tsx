'use client';

import { ReactNode } from 'react';

interface SwotInsight {
  title: string;
  description: string;
  excerpt: string;
  badge: string;
  type: 'strength' | 'weakness' | 'opportunities' | 'threat';
}

export interface ProjectFormData {
  // Page 1: Basic Info
  name: string;
  description: string;
  projectStartDate: string;
  projectEndDate: string;
  location: string;
  
  // Page 2: Impact & Visual
  impactMetrics: Array<{
    number: string;
    description: string;
  }>;
  projectImageUrl: string;
  
  // Page 3: Fundraising
  fundingGoal: string;
  fundraisingStartDate: string;
  fundraisingEndDate: string;
  
  // Page 4: Proposal & AI
  proposalType: 'upload' | 'ai' | null;
  proposalUrl: string;
  aiProposal: string;
  aiInsights: SwotInsight[] | null;
}

interface FormWrapperProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  nextButtonText?: string;
  backButtonText?: string;
  isLoading?: boolean;
}

const stepTitles = [
  'About Your Project',
  'About Your Project', 
  'Fundraising Information',
  'Proposal & AI Insights'
];

const stepDescriptions = [
  'Informasi tentang project kamu',
  'Definisi impact dan penambahan visual',
  'Tentukan target fundraising',
  'Buat proposal dan dapatkan insights'
];

export default function FormWrapper({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canGoNext,
  canGoBack,
  nextButtonText = 'Next',
  backButtonText = 'Back',
  isLoading = false
}: FormWrapperProps) {
  
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-normal
                  ${index + 1 <= currentStep 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`
                    w-16 h-1 mx-4
                    ${index + 1 < currentStep ? 'bg-black' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-medium text-black mb-2">
              {stepTitles[currentStep - 1]}
            </h1>
            <p className="text-gray-600 text-sm font-normal">
              {stepDescriptions[currentStep - 1]}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white border border-black rounded-lg p-8 mb-8">
          {children}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack || isLoading}
            className={`
              px-6 py-3 rounded-full font-normal transition-colors border
              ${canGoBack && !isLoading
                ? 'border-black text-black hover:bg-gray-50'
                : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {backButtonText}
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className={`
              px-6 py-3 rounded-full font-normal transition-colors flex items-center space-x-2
              ${canGoNext && !isLoading
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{nextButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}