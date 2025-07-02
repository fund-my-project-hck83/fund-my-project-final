'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium text-black mb-8 leading-tight">
            Buat Kontribusi
            <span className="block text-gray-600">
              Mulai dari Sini
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed font-normal">
            Di Fund My Project, kami memberikan support pada pelaku inovasi <br/>untuk mewujudkan ide yang memberikan impact.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/projects">
              <button className="bg-black text-white px-8 py-4 rounded-full font-normal text-base hover:bg-gray-800 transition-colors min-w-[200px]">
                Start Donating
              </button>
            </Link>
            <Link href="/create-project">
              <button className="bg-white text-black border border-black px-8 py-4 rounded-full font-normal text-base hover:bg-gray-50 transition-colors min-w-[200px]">
                Start A Project
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}