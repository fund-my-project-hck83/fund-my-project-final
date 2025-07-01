'use client';

import { useEffect, useState } from 'react';
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
      setDonations(prev => [newDonation, ...prev.slice(0, 9)]); // Keep only 10 most recent
      
      // Show visual indicator for new donation
      setIsNewDonation(true);
      setTimeout(() => setIsNewDonation(false), 3000);
    });

    return () => {
      pusherClient.unsubscribe(`project-${projectSlug}-donations`);
    };
  }, [projectSlug]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Recent Donations</h2>
        {isNewDonation && (
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium animate-pulse">
            🎉 New donation!
          </div>
        )}
      </div>
      {donations.length > 0 ? (
        <div className="space-y-3">
          {donations.map((donation, index) => (
            <div 
              key={`${donation.donorName}-${donation.createdAt}-${index}`} 
              className={`flex justify-between items-center p-3 rounded-lg transition-all duration-300 ${
                index === 0 && isNewDonation 
                  ? 'bg-green-50 border border-green-200 animate-pulse' 
                  : 'bg-gray-50'
              }`}
            >
              <div>
                <p className="font-semibold text-gray-800">{donation.donorName}</p>
                <p className="text-sm text-gray-600">{formatDate(donation.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">{formatCurrency(donation.amount)}</p>
                {donation.isExcess && (
                  <p className="text-xs text-green-600">Excess donation</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No donations yet. Be the first to support this project!</p>
      )}
    </div>
  );
} 