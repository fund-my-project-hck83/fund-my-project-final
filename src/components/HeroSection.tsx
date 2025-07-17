'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Moving Elements Background */}
      <div className="absolute inset-0 pointer-events-none">
        {mounted && (
          <>
            {/* Flowing Orbs */}
            <div 
              className="absolute w-80 h-80 rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgb(37, 99, 235) 0%, rgba(37, 99, 235, 0.3) 70%, transparent 100%)',
                top: '-10%',
                right: '-5%',
                animation: 'drift-1 25s ease-in-out infinite'
              }}
            ></div>

            <div 
              className="absolute w-60 h-60 rounded-full opacity-15"
              style={{
                background: 'radial-gradient(circle, rgb(59, 130, 246) 0%, rgba(59, 130, 246, 0.2) 70%, transparent 100%)',
                bottom: '-8%',
                left: '-3%',
                animation: 'drift-2 30s ease-in-out infinite'
              }}
            ></div>

            <div 
              className="absolute w-40 h-40 rounded-full opacity-25"
              style={{
                background: 'radial-gradient(circle, rgb(29, 78, 216) 0%, rgba(29, 78, 216, 0.4) 70%, transparent 100%)',
                top: '30%',
                left: '15%',
                animation: 'drift-3 20s ease-in-out infinite'
              }}
            ></div>

            {/* Floating Particles */}
            <div 
              className="absolute w-4 h-4 bg-blue-600 rounded-full opacity-30"
              style={{
                top: '20%',
                right: '20%',
                animation: 'particle-float-1 15s ease-in-out infinite'
              }}
            ></div>

            <div 
              className="absolute w-3 h-3 bg-blue-500 rounded-full opacity-40"
              style={{
                top: '60%',
                right: '30%',
                animation: 'particle-float-2 18s ease-in-out infinite'
              }}
            ></div>

            <div 
              className="absolute w-2 h-2 bg-blue-700 rounded-full opacity-50"
              style={{
                bottom: '30%',
                left: '25%',
                animation: 'particle-float-3 12s ease-in-out infinite'
              }}
            ></div>

            <div 
              className="absolute w-3 h-3 bg-blue-400 rounded-full opacity-35"
              style={{
                top: '45%',
                right: '10%',
                animation: 'particle-float-4 22s ease-in-out infinite'
              }}
            ></div>

            {/* Flowing Lines */}
            <div 
              className="absolute w-px h-40 bg-gradient-to-b from-transparent via-blue-600 to-transparent opacity-20"
              style={{
                top: '10%',
                left: '70%',
                animation: 'line-flow-1 16s ease-in-out infinite'
              }}
            ></div>

            <div 
              className="absolute w-px h-32 bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-15"
              style={{
                bottom: '15%',
                right: '25%',
                animation: 'line-flow-2 20s ease-in-out infinite'
              }}
            ></div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto z-10">
        <div className="text-center">
          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium text-black mb-8 leading-tight">
            Buat Kontribusi
            <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Mulai dari Sini
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-normal">
            Di Fund My Project, kami memberikan support pada pelaku inovasi <br className="hidden sm:block"/>
            untuk mewujudkan ide yang memberikan impact.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/projects">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-normal text-base hover:bg-blue-700 transition-all duration-300 min-w-[200px] hover:scale-105 transform">
                Start Donating
              </button>
            </Link>
            <Link href="/create-project">
              <button className="bg-white/90 backdrop-blur-sm text-black border border-blue-300 px-8 py-4 rounded-full font-normal text-base hover:bg-white transition-all duration-300 min-w-[200px] hover:scale-105 transform">
                Start A Project
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes drift-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-30px, -20px) scale(1.1); }
          66% { transform: translate(20px, -40px) scale(0.9); }
        }
        @keyframes drift-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25% { transform: translate(40px, -30px) scale(1.2); }
          50% { transform: translate(-20px, -50px) scale(0.8); }
          75% { transform: translate(30px, -20px) scale(1.1); }
        }
        @keyframes drift-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-25px, 35px) scale(1.3); }
        }
        @keyframes particle-float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25% { transform: translateY(-40px) translateX(20px); opacity: 0.7; }
          50% { transform: translateY(-60px) translateX(-10px); opacity: 0.4; }
          75% { transform: translateY(-30px) translateX(30px); opacity: 0.6; }
        }
        @keyframes particle-float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          33% { transform: translateY(-30px) translateX(-20px); opacity: 0.8; }
          66% { transform: translateY(-45px) translateX(15px); opacity: 0.5; }
        }
        @keyframes particle-float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
          50% { transform: translateY(-50px) translateX(-25px); opacity: 0.9; }
        }
        @keyframes particle-float-4 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.35; }
          40% { transform: translateY(-35px) translateX(25px); opacity: 0.7; }
          80% { transform: translateY(-20px) translateX(-15px); opacity: 0.5; }
        }
        @keyframes line-flow-1 {
          0% { opacity: 0; transform: translateY(-20px) scaleY(0.5); }
          50% { opacity: 0.2; transform: translateY(0px) scaleY(1); }
          100% { opacity: 0; transform: translateY(20px) scaleY(0.5); }
        }
        @keyframes line-flow-2 {
          0% { opacity: 0; transform: translateY(20px) scaleY(0.3); }
          50% { opacity: 0.15; transform: translateY(0px) scaleY(1); }
          100% { opacity: 0; transform: translateY(-20px) scaleY(0.3); }
        }
      `}</style>
    </section>
  );
}