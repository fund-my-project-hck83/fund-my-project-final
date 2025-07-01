# Projects Page Sorting Update

## Overview
Halaman `/projects` (semua proyek) telah diupdate untuk menampilkan proyek berdasarkan kriteria yang lebih relevan dan user-friendly.

## Perubahan Sorting Algorithm:

### Sebelum:
- ❌ Menampilkan semua proyek (termasuk yang sudah selesai)
- ❌ Tidak ada sorting yang jelas
- ❌ User harus scroll untuk mencari proyek aktif

### Sesudah:
- ✅ **Hanya proyek aktif** (`isFundingComplete: false`)
- ✅ **Filter tanggal aktif** (fundraising belum berakhir)
- ✅ **Sorting berdasarkan tanggal berakhir terdekat** (ascending)

## Formula Sorting Baru:

### 1. **Filter Aktif**
```javascript
{
    isFundingComplete: false,
    $or: [
        { fundraisingEndDate: { $gt: new Date() } }, // Date objects
        { 
            fundraisingEndDate: { $type: "string", $exists: true } // String dates
        }
    ]
}
```

### 2. **Sort by Closest End Date**
```javascript
{
    $sort: { sortDate: 1 } // Ascending - closest end date first
}
```

## Contoh Hasil Urutan:

| Rank | Project | End Date | Status | Logic |
|------|---------|----------|--------|-------|
| 1 | VR Learning Center | 15/7/2025 | 🟢 Aktif | Paling dekat berakhir |
| 2 | Blockchain Bootcamp | 22/7/2025 | 🟢 Aktif | Kedua terdekat |
| 3 | Cybersecurity Campaign | 25/7/2025 | 🟢 Aktif | Ketiga terdekat |
| 4 | Mobile App Competition | 27/7/2025 | 🟢 Aktif | Keempat terdekat |
| 5 | Game Workshop | 28/7/2025 | 🟢 Aktif | Kelima terdekat |

## User Experience Benefits:

### 1. **Relevance First**
- User langsung melihat proyek yang bisa mereka dukung
- Tidak ada kebingungan dengan proyek yang sudah selesai
- Focus pada actionable projects

### 2. **Urgency Awareness**
- Proyek yang akan berakhir muncul lebih dulu
- User merasa "time pressure" untuk donate
- Natural call-to-action untuk urgent projects

### 3. **Better Engagement**
- User lebih likely untuk donate pada proyek aktif
- Sorting yang predictable dan logical
- Consistent dengan mindset "urgent = important"

## Technical Implementation:

### Backend Changes:
- ✅ Updated `findWithPagination()` method
- ✅ Aggregation pipeline dengan sorting
- ✅ Handle both Date dan string formats
- ✅ Proper indexing untuk performance

### API Consistency:
- ✅ Same endpoint: `/api/projects?page=1&limit=12`
- ✅ Search functionality tetap berfungsi
- ✅ Pagination tetap reliable
- ✅ Infinite scroll compatible

## Filter Integration:

### Projects Page (`/projects`)
- **"Semua Proyek"**: Active projects sorted by end date
- **"🚨 Urgent"**: Urgent projects (same logic, different UI)

### Search Function:
- Search tetap berdasarkan nama proyek saja
- Results tetap sorted berdasarkan tanggal berakhir
- Consistent dengan overall UX

---
**Update Date**: July 1, 2025  
**Feature**: Active Projects with Closest End Date Sorting
