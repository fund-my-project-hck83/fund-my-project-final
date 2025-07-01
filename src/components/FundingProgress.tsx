'use client';

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';

interface FundingProgressProps {
  currentFunding: number;
  fundingGoal: number;
  isFundingComplete: boolean;
  completedAt?: Date;
  projectSlug: string;
}

export default function FundingProgress({
  currentFunding: initialFunding,
  fundingGoal,
  isFundingComplete: initialIsComplete,
  completedAt: initialCompletedAt,
  projectSlug
}: FundingProgressProps) {
  const [currentFunding, setCurrentFunding] = useState(initialFunding);
  const [isFundingComplete, setIsFundingComplete] = useState(initialIsComplete);
  const [completedAt, setCompletedAt] = useState(initialCompletedAt);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    return Math.min((currentFunding / fundingGoal) * 100, 100);
  };

  const getExcessAmount = () => {
    return Math.max(0, currentFunding - fundingGoal);
  };

  const getExcessPercentage = () => {
    if (currentFunding <= fundingGoal) return 0;
    return ((currentFunding - fundingGoal) / fundingGoal) * 100;
  };

  const getStatusBadge = () => {
    if (currentFunding > fundingGoal) {
      return {
        text: 'Exceeding Goal',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '🎯'
      };
    } else if (isFundingComplete) {
      return {
        text: 'Funding Complete',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '🎉'
      };
    } else {
      return {
        text: 'Active Funding',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '📈'
      };
    }
  };

  useEffect(() => {
    // Set up Pusher subscription for real-time funding updates
    const channel = pusherClient.subscribe(`project-${projectSlug}-funding`);
    
    channel.bind('funding-updated', (data: {
      currentFunding: number;
      isFundingComplete: boolean;
      completedAt: Date | null;
      progressPercentage: number;
    }) => {
      setIsUpdating(true);
      
      // Update state with new funding data
      setCurrentFunding(data.currentFunding);
      setIsFundingComplete(data.isFundingComplete);
      if (data.completedAt) {
        setCompletedAt(data.completedAt);
      }
      
      // Show updating indicator briefly
      setTimeout(() => setIsUpdating(false), 2000);
    });

    return () => {
      pusherClient.unsubscribe(`project-${projectSlug}-funding`);
    };
  }, [projectSlug]);

  const statusBadge = getStatusBadge();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Funding Progress</h2>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${statusBadge.color}`}>
            <span className="mr-1">{statusBadge.icon}</span>
            {statusBadge.text}
          </div>
          {isUpdating && (
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium animate-pulse">
              🔄 Live Update
            </div>
          )}
        </div>
      </div>

      {/* Funding Amounts */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Raised: {formatCurrency(currentFunding)}</span>
          <span>Goal: {formatCurrency(fundingGoal)}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        
        <div className="text-center">
          <span className="text-lg font-semibold text-blue-600">
            {getProgressPercentage().toFixed(1)}% Complete
          </span>
        </div>
      </div>

      {/* Excess Funding Info */}
      {currentFunding > fundingGoal && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-800 font-semibold">Exceeding Goal!</p>
              <p className="text-purple-600 text-sm">
                {formatCurrency(getExcessAmount())} over target ({getExcessPercentage().toFixed(1)}%)
              </p>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
        </div>
      )}

      {/* Funding Complete Info */}
      {isFundingComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-semibold">🎉 Funding Goal Achieved!</p>
              {completedAt && (
                <p className="text-green-600 text-sm">
                  Completed on {formatDate(completedAt)}
                </p>
              )}
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
      )}

      {/* Funding Statistics */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(currentFunding)}
          </p>
          <p className="text-sm text-gray-600">Total Raised</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(fundingGoal)}
          </p>
          <p className="text-sm text-gray-600">Funding Goal</p>
        </div>
      </div>
    </div>
  );
} 