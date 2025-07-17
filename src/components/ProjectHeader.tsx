'use client';

import Image from 'next/image';

interface ProjectHeaderProps {
  name: string;
  location: string;
  imageUrl: string;
}

export default function ProjectHeader({ name, location, imageUrl }: ProjectHeaderProps) {
  return (
    <div className="bg-white border border-black rounded-lg overflow-hidden mb-8">
      <div className="relative h-64 md:h-96">
        <Image
          src={imageUrl || '/placeholder-project.jpg'}
          alt={name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-45"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-medium mb-2">{name}</h1>
          <div className="flex items-center text-lg font-normal opacity-90">
            <span className="mr-2">📍</span>
            {location}
          </div>
        </div>
      </div>
    </div>
  );
}