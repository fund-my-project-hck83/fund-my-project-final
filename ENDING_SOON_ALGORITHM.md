# Urgent Projects Algorithm - Updated

## Overview
Algoritma "Urgent Projects" (sebelumnya "Ending Soon") menampilkan proyek berdasarkan **tanggal berakhir terdekat** dengan UI yang informatif dan sense of urgency.

## Formula Urgent Projects:

### Primary Sort: Tanggal Berakhir Terdekat
- Proyek dengan `fundraisingEndDate` paling dekat akan muncul paling atas
- Contoh: Proyek berakhir 5/8/2025 muncul di atas proyek berakhir 28/7/2025

### Features:

1. **Filter Toggle Button**:
   - Button "📄 Semua Proyek" 
   - Button "🚨 Urgent" (warna merah untuk urgency)

2. **Countdown Badge**:
   - Menampilkan sisa hari: "5 hari lagi"
   - Badge merah untuk urgency visual
   - Auto-hide untuk filter "all"

3. **Enhanced Sorting**:
   - Menggunakan aggregation pipeline
   - Handle format tanggal string dan Date object
   - Sort ascending (tanggal terdekat pertama)

## Contoh Hasil Urutan:

| Rank | Project | End Date | Days Left | Status |
|------|---------|----------|-----------|--------|
| 1 | Tech Social Hackathon | 5/8/2025 | 5 hari lagi | 🚨 Urgent |
| 2 | Game Development Workshop | 28/7/2025 | 28 hari lagi | 🚨 Urgent |
| 3 | Rural Tech Education | 21/8/2025 | 21 hari lagi | 🚨 Urgent |
| 4 | Open Source Marathon | 1/8/2025 | 1 hari lagi | 🚨 Urgent |
| 5 | Startup Pitch Medan | 8/8/2025 | 8 hari lagi | 🚨 Urgent |

## UI/UX Improvements:

1. **Visual Urgency**: Badge merah menunjukkan countdown dengan emoji 🚨
2. **Clear Filter**: Toggle button "Urgent" dengan warna merah tegas
3. **Info Text**: Header "Proyek Urgent" memberikan sense of urgency
4. **Responsive**: Badge countdown responsive di mobile

## Filter Kondisi:
- ✅ Proyek belum selesai funding (`isFundingComplete: false`)
- ✅ Handle format tanggal string dan Date object
- ✅ Sort berdasarkan tanggal terdekat (`sortDate: 1`)
- ✅ Limit hasil sesuai parameter

## API Endpoint:
```
GET /api/projects/ending-soon?limit=12
```
*Note: API endpoint masih menggunakan "ending-soon" tapi UI sudah berubah ke "urgent"*

## Technical Implementation:
- MongoDB aggregation pipeline dengan `$addFields` dan `$sort`
- TypeScript safety dengan type casting untuk filter comparison
- React state management untuk filter toggle
- Conditional rendering untuk countdown badge

---
**Update Date**: July 1, 2025  
**Feature**: Renamed "Ending Soon" to "Urgent" + Enhanced UI for Urgency
