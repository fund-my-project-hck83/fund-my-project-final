# Trending Projects & Search Feature Documentation

## Overview
Sistem trending projects dan search telah diupdate dengan struktur yang lebih sederhana dan user-friendly. **Trending projects hanya ditampilkan di halaman utama**, sedangkan **search functionality telah dipindahkan ke navbar** untuk akses yang lebih mudah.

## Struktur Halaman
- **Home Page** (`/`): Menampilkan trending projects menggunakan smart algorithm
- **Projects Page** (`/projects`): Menampilkan "Semua Proyek" dan "Ending Soon" saja
- **Navbar**: Search box terintegrasi untuk pencarian proyek
- **Search Results**: Menggunakan halaman projects dengan query parameter `?search=keyword`

## Search Functionality

### Lokasi Search
- **Desktop**: Search box di navbar (sebelah kanan menu navigasi)
- **Mobile**: Search box di dalam mobile menu dropdown

### Cara Kerja Search
1. User mengetik keyword di search box navbar
2. Tekan Enter atau klik tombol search (🔍)
3. Redirect ke `/projects?search=keyword`
4. Halaman projects menampilkan hasil pencarian

### Search Implementation
```javascript
// Search handler di Navbar
const handleSearch = () => {
  if (searchTerm.trim()) {
    router.push(`/projects?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
    setIsMenuOpen(false);
  }
};

// Search di Projects page menggunakan URL params
const searchParams = useSearchParams();
const searchTerm = searchParams.get('search') || '';
```

## Trending Projects

### Lokasi Tampilan
- **Home Page Only**: Trending projects hanya ditampilkan di halaman utama dengan judul "🔥 Proyek Trending"

### Algoritma Trending untuk Homepage
Menggunakan **Percentage Method** yang dioptimalkan untuk menampilkan proyek yang mendekati funding goal:

**Formula:**
```
trendingScore = (proximityScore * 0.6) + (normalizedFunding * 0.4)

proximityScore = 1 - |1 - fundingPercentage|
normalizedFunding = currentFunding / 10,000,000
```

**Faktor Penilaian:**
- **60%** - Proximity Score (kedekatan dengan target 100%)
- **40%** - Normalized Current Funding (jumlah dana yang terkumpul)

**Keunggulan Algoritma:**
- Proyek yang mendekati 100% funding goal mendapat prioritas tertinggi
- Proyek dengan funding tinggi tetap mendapat skor yang baik
- Proyek yang sudah mencapai 100% tetap ditampilkan dengan skor maksimal
- Filter: hanya proyek aktif dengan funding > 0

### Kriteria Seleksi
- `isFundingComplete: false` - Proyek belum selesai
- `fundraisingEndDate > today` - Masih dalam periode fundraising
- `fundingGoal > 0` - Memiliki target yang valid
- `currentFunding > 0` - Sudah memiliki dana terkumpul

## API Endpoints

### Trending Projects
```
GET /api/projects/trending?limit=8&method=percentage
```

**Parameters:**
- `limit`: Jumlah proyek (default: 8)
- `method`: `percentage` (digunakan di homepage) | `advanced` | `amount`

**Homepage Default:**
- Method: `percentage` - Optimized untuk proyek yang mendekati target
- Limit: 8 proyek

### Project Search
```
GET /api/projects?search=keyword&page=1&limit=12
```

**Parameters:**
- `search`: Keyword pencarian
- `page`: Halaman (untuk pagination)
- `limit`: Jumlah proyek per halaman

## Routes Structure

### Current Active Routes
- `/` - Home page dengan trending projects
- `/projects` - All projects dan ending soon
- `/projects?search=keyword` - Search results
- `/projects/ending-soon` - Projects ending soon

### Removed Routes
- `/trending` - **REMOVED** (trending hanya di home page)
- `/projects/trending` - **REMOVED** (sudah dihapus sebelumnya)

## User Experience Improvements

### 1. Simplified Navigation
- Trending projects mudah ditemukan di home page
- Search box selalu tersedia di navbar
- Tidak ada halaman terpisah untuk trending

### 2. Unified Search Experience
- Search dari navbar mengarah ke halaman projects
- URL menggunakan query parameter untuk SEO-friendly
- Hasil search ditampilkan dengan konteks yang jelas

### 3. Mobile-Friendly Design
- Search box responsive di mobile menu
- Trending projects optimized untuk mobile view
- Touch-friendly interface

## Implementation Benefits

1. **Simplified Structure**: Mengurangi kompleksitas navigasi
2. **Better UX**: Search selalu accessible dari navbar
3. **SEO Friendly**: Search menggunakan URL parameters
4. **Performance**: Trending hanya load di home page
5. **Maintenance**: Lebih mudah maintain dengan struktur yang sederhana

## Technical Notes
- Search menggunakan `useSearchParams` untuk read URL parameters
- Navbar search menggunakan `useRouter` untuk navigation
- Projects page otomatis fetch berdasarkan search parameter
- Trending algorithm tetap menggunakan MongoDB aggregation pipeline
- Responsive design untuk semua screen sizes
