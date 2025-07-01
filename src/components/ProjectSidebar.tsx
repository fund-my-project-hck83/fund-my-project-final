'use client';

import Image from 'next/image';

interface ProjectOwner {
  name: string;
  avatarUrl?: string;
  bio?: string;
}

interface ProjectSidebarProps {
  isFundingComplete: boolean;
  completedAt?: Date;
  projectStartDate: string | Date;
  projectEndDate: string | Date;
  fundraisingEndDate: string | Date;
  owner?: ProjectOwner;
  onDonateClick: () => void;
}

export default function ProjectSidebar({
  isFundingComplete,
  completedAt,
  projectStartDate,
  projectEndDate,
  fundraisingEndDate,
  owner,
  onDonateClick
}: ProjectSidebarProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Support This Project</h2>
      
      {isFundingComplete ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">This project has reached its funding goal!</p>
          <div className="bg-green-100 rounded-lg p-4">
            <p className="text-green-800 font-semibold">Funding Complete</p>
            {completedAt && (
              <p className="text-green-600 text-sm">Completed on {formatDate(completedAt)}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={onDonateClick}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Donate Now
          </button>
        </div>
      )}

      {/* Project Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Project Details</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Start Date:</span>
            <span>{formatDate(projectStartDate)}</span>
          </div>
          <div className="flex justify-between">
            <span>End Date:</span>
            <span>{formatDate(projectEndDate)}</span>
          </div>
          <div className="flex justify-between">
            <span>Fundraising End:</span>
            <span>{formatDate(fundraisingEndDate)}</span>
          </div>
        </div>
      </div>

      {/* Project Owner */}
      {owner && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Project Owner</h3>
          <div className="flex items-center space-x-3">
            {owner.avatarUrl && (
              <Image
                src={owner.avatarUrl}
                alt={owner.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-800">{owner.name}</p>
              {owner.bio && (
                <p className="text-sm text-gray-600">{owner.bio}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 