'use client';

import Link from 'next/link';

interface ErrorMessageProps {
  title?: string;
  message: string;
  showHomeButton?: boolean;
}

export default function ErrorMessage({ 
  title = "Something went wrong", 
  message, 
  showHomeButton = false 
}: ErrorMessageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        {showHomeButton && (
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        )}
      </div>
    </div>
  );
} 