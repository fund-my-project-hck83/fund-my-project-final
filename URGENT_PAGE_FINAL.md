# Halaman Urgent - Final Implementation

## Deskripsi
Halaman `/projects/urgent` menampilkan proyek yang akan berakhir dalam 30 hari ke depan, diurutkan berdasarkan `fundraisingEndDate` terdekat.

## Fitur yang Diimplementasikan

### 1. Filter 30 Hari Otomatis
- Hanya menampilkan proyek dengan `fundraisingEndDate` <= 30 hari dari sekarang
- Tidak ada pilihan filter hari karena sudah fixed 30 hari

### 2. Toggle "Semua Proyek" vs "Hanya Aktif"
- **Hanya Aktif**: Menampilkan proyek aktif (`isFundingComplete: false` dan belum melewati `fundraisingEndDate`)
- **Semua Proyek**: Menampilkan semua proyek dalam rentang 30 hari (termasuk yang sudah selesai)

### 3. UI/UX
- **Navbar**: Tampil di halaman urgent, trending, dan halaman utama
- **No Header Section di Urgent**: Konten langsung dimulai dari main content (khusus halaman urgent)
- **Toggle Filter**: Berada di bagian atas content area (halaman urgent)
- **Grid Layout**: Halaman urgent menggunakan grid cards seperti trending (bukan list)
- **Project Cards**: Card format dengan image, progress bar, dan urgent badges

### 4. Status Badge Proyek
- **Aktif**: Badge urgent di corner dengan countdown hari (warna merah)
- **Selesai**: Badge hijau dengan ✅ dan button disabled
- **Berakhir**: Badge abu-abu dengan ⏰ dan button disabled

### 5. **HAPUS Statistics Cards** ❌
**Removed:** Total Proyek, Total Target, dan Total Terkumpul cards dihapus
**New Layout:** Grid cards 1-4 columns seperti halaman trending
**Cards:** Image full-width, compact info, dan urgent badges

### 6. **Action Button Konsisten** 🔄
**Changed:** Button "Donasi Sekarang" diganti menjadi "Lihat Detail"
**Color:** Menggunakan warna hijau (emerald-600) seperti halaman trending
**Consistent:** Sama persis seperti halaman trending untuk UX yang seragam
**Removed:** Conditional logic berdasarkan status proyek (semua button sama)

## API Endpoint
```
GET /api/projects/urgent?limit={number}&includeCompleted={boolean}
```

### Parameters:
- `limit`: Jumlah maksimal proyek yang dikembalikan (default: 10)
- `includeCompleted`: true untuk semua proyek, false untuk hanya aktif (default: false)

## Model Method
```typescript
ProjectModel.findUrgentProjects(limit?: number, includeCompleted?: boolean)
```
- Menggunakan filter MongoDB untuk `fundraisingEndDate` <= 30 hari dari sekarang
- Sort berdasarkan `fundraisingEndDate` ascending (terdekat dulu)
- Support filter `isFundingComplete` berdasarkan parameter `includeCompleted`

## File yang Dimodifikasi
1. `src/server/models/ProjectModel.ts` - Method `findUrgentProjects`
2. `src/app/api/projects/urgent/route.ts` - Endpoint API
3. `src/app/projects/urgent/page.tsx` - UI halaman urgent
4. `src/app/projects/trending/page.tsx` - Tambah Navbar

## Testing
- ✅ API endpoint berfungsi dengan parameter `includeCompleted`
- ✅ Filter 30 hari bekerja sesuai spesifikasi
- ✅ Toggle UI mengubah data yang ditampilkan
- ✅ Navbar tampil di halaman urgent, trending, dan halaman utama
- ✅ Grid layout cards seperti trending berfungsi dengan baik
- ✅ Statistics cards berhasil dihapus untuk UI yang lebih clean
- ✅ Action buttons "Lihat Detail" hijau konsisten dengan halaman trending
- ✅ Status badge menampilkan informasi yang tepat

## Catatan Teknis
- Menggunakan aggregation pipeline MongoDB untuk filtering date
- DateTime handling untuk timezone Indonesia (WIB)
- Responsive design untuk mobile dan desktop (grid 1-4 columns)
- Loading states dan error handling
- Card layout dengan image, progress bar, dan action buttons
- Urgent badges dengan warna sesuai status proyek
- Consistent button behavior dengan halaman trending (semua "Lihat Detail")
