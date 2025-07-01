// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;



// -----

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   // allowedDevOrigins: ['https://88df-139-228-111-119.ngrok-free.app'],
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//         port: '',
//         pathname: '/**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'via.placeholder.com',
//         port: '',
//         pathname: '/**',
//       },
//     ],
//   },
// };

// export default nextConfig;

// ---

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'encrypted-tbn0.gstatic.com',
      'lh3.googleusercontent.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'example.com',
      'images.gofundme.com',
      'ui-avatars.com',
    ],
  },
};

export default nextConfig;
