'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { pusherClient } from '@/lib/pusher';

interface Donation {
  amount: number;
  donorName: string;
  createdAt: string | Date;
  isExcess: boolean;
  excessAmount?: number;
}

interface RecentDonationsProps {
  donations: Donation[];
  projectSlug: string;
}

export default function RecentDonations({ donations: initialDonations, projectSlug }: RecentDonationsProps) {
  const [donations, setDonations] = useState(initialDonations);
  const [isNewDonation, setIsNewDonation] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    // Set up Pusher subscription for real-time donation updates
    const channel = pusherClient.subscribe(`project-${projectSlug}-donations`);
    
    channel.bind('new-donation', (newDonation: Donation) => {
      // Add new donation to the top of the list
      setDonations(prev => [newDonation, ...prev.slice(0, 19)]); // Keep only 20 most recent
      
      // Show visual indicator for new donation
      setIsNewDonation(true);
      setTimeout(() => setIsNewDonation(false), 3000);
    });

    return () => {
      pusherClient.unsubscribe(`project-${projectSlug}-donations`);
    };
  }, [projectSlug]);

  const visibleDonations = showAll ? donations : donations.slice(0, 5);
  const hasMoreDonations = donations.length > 5;

  return (
    <div className="bg-white border border-black rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-black">Recent Donations</h2>
        {isNewDonation && (
          <div className="px-3 py-1 bg-green-100 border border-green-300 text-green-800 rounded-full text-sm font-normal">
            🎉 New donation!
          </div>
        )}
      </div>
      
      {donations.length > 0 ? (
        <div className="space-y-3">
          {visibleDonations.map((donation, index) => (
            <div 
              key={`${donation.donorName}-${donation.createdAt}-${index}`} 
              className={`flex justify-between items-center p-4 rounded-lg border transition-colors duration-300 ${
                index === 0 && isNewDonation 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <p className="font-medium text-black">{donation.donorName}</p>
                <p className="text-sm text-gray-600 font-normal">{formatDate(donation.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-blue-600">{formatCurrency(donation.amount)}</p>
                {donation.isExcess && (
                  <p className="text-xs text-green-600 font-normal">Excess donation</p>
                )}
              </div>
            </div>
          ))}

          {/* Show More/Less Button */}
          {hasMoreDonations && (
            <div className="relative">
              
              
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-gray-300 hover:border-black text-gray-700 hover:text-black rounded-lg transition-colors font-normal"
              >
                {showAll ? (
                  <>
                    <span>Show Less</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>See More Donations</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💝</span>
          </div>
          <p className="text-gray-600 font-normal">No donations yet. Be the first to support this project!</p>
        </div>
      )}
    </div>
  );
}