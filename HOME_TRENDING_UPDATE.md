# Home Page Trending Projects Update

## Perubahan yang Dibuat

### Sebelum:
- Trending projects di halaman home menggunakan method **"percentage"**
- Menampilkan proyek berdasarkan persentase progress tertinggi

### Sesudah: 
- Trending projects di halaman home menggunakan method **"amount"**
- Menampilkan proyek berdasarkan dana terkumpul terbanyak

## Implementasi

**File yang diubah:** `src/app/page.tsx`

```typescript
// Sebelum:
const projectsRes = await fetch("/api/projects/trending?limit=8&method=percentage");

// Sesudah:
const projectsRes = await fetch("/api/projects/trending?limit=8&method=amount");
```

## Alasan Perubahan

1. **Lebih Representatif**: Dana terbanyak menunjukkan proyek yang paling dipercaya investor
2. **Konsistensi**: Selaras dengan expectation "trending" = yang paling banyak mendapat dukungan finansial
3. **Impact Based**: Proyek dengan dana besar biasanya memiliki dampak yang lebih signifikan

## Testing Results

**API Endpoint:** `/api/projects/trending?limit=8&method=amount`

**Urutan Trending di Home:**
1. **Mobile App Dev Competition Surabaya**: 45,000,000 IDR ✅ (tertinggi)
2. **VR Learning Experience Center**: 42,000,000 IDR
3. **Digital Nomad Hub Bali**: 35,000,000 IDR

## Dampak

- ✅ Halaman home sekarang menampilkan proyek dengan dana terbanyak
- ✅ Tidak ada breaking changes pada komponen lain
- ✅ API endpoint yang sama tetap digunakan, hanya parameter method yang berubah
- ✅ Performance tetap sama (tidak ada overhead tambahan)

## Halaman Trending vs Home

- **Halaman Trending** (`/projects/trending`): User dapat memilih antara "Mendekati Target" (percentage) atau "Dana Terbanyak" (amount)
- **Halaman Home**: Fixed menggunakan "Dana Terbanyak" (amount) untuk menampilkan proyek paling populer
