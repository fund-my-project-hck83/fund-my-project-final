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
    <div className="bg-white border border-black rounded-lg p-6 sticky top-28">
      <h2 className="text-2xl font-medium text-black mb-4">Support This Project</h2>
      
      {isFundingComplete ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4 font-normal">This project has reached its funding goal!</p>
          <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <p className="text-green-800 font-medium">Funding Complete</p>
            {completedAt && (
              <p className="text-green-600 text-sm font-normal">Completed on {formatDate(completedAt)}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={onDonateClick}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-full font-normal hover:bg-blue-700 transition-colors"
          >
            Donate Now
          </button>
        </div>
      )}

      {/* Project Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-black mb-3">Project Details</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span className="font-normal">Start Date:</span>
            <span className="font-normal">{formatDate(projectStartDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-normal">End Date:</span>
            <span className="font-normal">{formatDate(projectEndDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-normal">Fundraising End:</span>
            <span className="font-normal">{formatDate(fundraisingEndDate)}</span>
          </div>
        </div>
      </div>

      {/* Project Owner */}
      {owner && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-black mb-3">Project Owner</h3>
          <div className="flex items-center space-x-3">
            {owner.avatarUrl ? (
              <Image
                src={owner.avatarUrl}
                alt={owner.name}
                width={40}
                height={40}
                className="rounded-full border border-gray-300"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center">
                <span className="text-black text-sm font-medium">
                  {owner.name[0]?.toUpperCase() || "U"}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-black">{owner.name}</p>
              {owner.bio && (
                <p className="text-sm text-gray-600 font-normal">{owner.bio}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}