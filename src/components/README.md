# FundMyProject Components

Kumpulan komponen React untuk homepage FundMyProject yang dibangun dengan Next.js, TypeScript, dan Tailwind CSS.

## Komponen yang Tersedia

### 1. HeroSection
Komponen hero section untuk halaman utama FundMyProject.

**Features:**
- Headline dan subheadline yang menarik
- Tombol CTA: "Jelajahi Proyek" dan "Ajukan Proyek Anda"
- Statistik preview dalam card transparan
- Background gradient dengan dekorasi visual
- Responsive design untuk semua device

### 2. TrendingProjects
Komponen untuk menampilkan proyek-proyek trending/populer.

**Props:**
- `projects: Project[]` - Array data proyek

**Features:**
- Grid layout responsif (1 kolom di mobile, 2 di tablet, 3 di desktop)
- Progress bar funding dengan animasi
- Badge "LIVE" untuk proyek yang sedang live
- Badge status funding (Aktif/Selesai dengan persentase)
- Hover effects dan transisi
- Optimized images dengan Next.js Image component
- Maksimal 6 proyek ditampilkan

### 3. ImpactMetrics
Komponen untuk menampilkan metrik dampak dari proyek.

**Props:**
- `impactMetrics: Array<{number: number, description: string}>` - Data metrik dampak
- `projectName?: string` - Nama proyek (optional)

**Features:**
- Grid layout untuk desktop, horizontal scroll untuk mobile
- Format angka yang user-friendly (K, M untuk ribuan/jutaan)
- Icon dinamis untuk setiap metrik
- Gradient background dan hover effects
- Call-to-action section
- Responsive design dengan snap scroll di mobile

### 4. UpcomingLivestream
Komponen untuk menampilkan livestream yang akan datang.

**Props:**
- `livestreams: Livestream[]` - Array data livestream

**Features:**
- Sort otomatis berdasarkan tanggal terdekat
- Maksimal 3 livestream ditampilkan
- Countdown timer "X jam/hari lagi"
- Format tanggal dan waktu dalam bahasa Indonesia
- Badge "UPCOMING" dan tombol reminder
- Host information display
- Grid responsif dengan hover effects

### 5. TotalDonationBanner
Komponen banner yang menampilkan total donasi terkumpul.

**Props:**
- `donations: Donation[]` - Array data donasi

**Features:**
- Filter otomatis donasi dengan status SUCCESS
- Format mata uang Rupiah
- Format compact untuk angka besar (Rb, Jt, M)
- Statistik tambahan: jumlah donasi, jumlah donatur, rata-rata donasi
- Background gradient dengan efek glassmorphism
- Trust indicators (keamanan, verifikasi, dll)
- Call-to-action buttons

### Helper Functions

#### `getTotalDonations(donations: Donation[]): number`
Fungsi helper untuk menghitung total donasi dari array Donation.
- Filter donasi dengan `paymentStatus === "success"`
- Return total amount dalam number

## Penggunaan

```tsx
import { 
  HeroSection, 
  TrendingProjects, 
  ImpactMetrics, 
  UpcomingLivestream, 
  TotalDonationBanner 
} from '@/components';

// Data contoh
const projects = [/* array of Project */];
const donations = [/* array of Donation */];
const livestreams = [/* array of Livestream */];
const impactMetrics = [
  { number: 1500, description: 'Masyarakat Terbantu' },
  { number: 25, description: 'Desa Terdampak' }
];

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <TrendingProjects projects={projects} />
      <TotalDonationBanner donations={donations} />
      <ImpactMetrics impactMetrics={impactMetrics} />
      <UpcomingLivestream livestreams={livestreams} />
    </div>
  );
}
```

## Styling

Semua komponen menggunakan:
- **Tailwind CSS** untuk styling
- **Responsive design** (mobile-first approach)
- **Hover effects** dan animasi CSS
- **Glassmorphism** untuk beberapa elemen
- **Gradient backgrounds** untuk visual appeal
- **Emoji icons** untuk visual indicators

## Dependencies

- Next.js (dengan Image optimization)
- React
- TypeScript
- Tailwind CSS
- Model interfaces: `Project`, `Donation`, `Livestream`

## Performance

- Optimized images dengan Next.js Image component
- CSS animations untuk smooth transitions
- Responsive grid layouts
- Efficient data filtering dan formatting
- Minimal re-renders dengan proper props handling

## Browser Support

Kompatibel dengan semua browser modern yang mendukung:
- CSS Grid
- Flexbox
- CSS Custom Properties
- ES6+ JavaScript features
