'use client';

import Image from 'next/image';

interface ProjectHeaderProps {
  name: string;
  location: string;
  imageUrl: string;
}

export default function ProjectHeader({ name, location, imageUrl }: ProjectHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
      <div className="relative h-64 md:h-96">
        <Image
          src={imageUrl || '/placeholder-project.jpg'}
          alt={name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{name}</h1>
          <p className="text-lg opacity-90">{location}</p>
        </div>
      </div>
    </div>
  );
} 