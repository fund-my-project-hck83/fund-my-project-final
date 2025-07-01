# Algoritma Trending - Updated

## Overview
Algoritma trending telah diupdate untuk memprioritaskan **jumlah dana terkumpul terbanyak** sebagai faktor utama dalam menentukan trending projects.

## Formula Baru (90% Funding Amount + 10% Percentage)

### Komponen Scoring:
1. **Funding Score (90% weight)**: Berdasarkan jumlah dana terkumpul
   - Semakin besar dana terkumpul = skor semakin tinggi
   - Contoh: 45 juta > 22 juta (meskipun persentase 22 juta lebih tinggi)

2. **Percentage Bonus (10% weight)**: Bonus kecil untuk persentase pencapaian
   - Memberikan sedikit boost untuk proyek yang mendekati target
   - Hanya 10% dari total skor

### Trending Score Formula:
```
trendingScore = (currentFunding × 0.9) + ((currentFunding/fundingGoal) × 0.1)
```

## Contoh Hasil:

| Rank | Project | Dana Terkumpul | Target | Persentase | Trending Logic |
|------|---------|---------------|--------|------------|----------------|
| 1 | Mobile App Competition | 45 juta | 150 juta | 30% | ✅ Dana terbanyak |
| 2 | VR Learning Center | 42 juta | 180 juta | 23% | ✅ Dana terbanyak ke-2 |
| 3 | Digital Nomad Hub | 35 juta | 200 juta | 17% | ✅ Dana terbanyak ke-3 |
| 4 | Blockchain Bootcamp | 28 juta | 120 juta | 23% | ✅ Dana terbanyak ke-4 |
| 5 | Tech Social Hackathon | 22 juta | 65 juta | 33% | ✅ Dana terbanyak ke-5 |

## Keunggulan Algoritma Baru:

1. **Fairness**: Proyek dengan dana besar lebih terlihat, sesuai dengan besarnya impact
2. **Simplicity**: Lebih mudah dipahami oleh users
3. **Motivation**: Mendorong donatur untuk berkontribusi lebih besar
4. **Transparency**: Urutan berdasarkan jumlah nyata dana terkumpul

## Filter Kondisi:
- ✅ Proyek masih aktif (belum selesai funding)
- ✅ Tanggal berakhir masih di masa depan  
- ✅ Memiliki funding goal > 0
- ✅ Sudah ada dana terkumpul > 0

## API Endpoint:
```
GET /api/projects/trending?limit=8&method=percentage
```

---
**Update Date**: July 1, 2025  
**Algorithm Version**: 2.0 - Funding Amount Priority
