# Active Project Logic Documentation

## Logika Status "Aktif" di Halaman /projects

### Fungsi `isActiveFundraising(project)`

Sebuah proyek dianggap **"Aktif"** jika memenuhi SEMUA kondisi berikut:

1. **Tanggal Mulai Fundraising**: `now >= fundraisingStartDate`
   - Fundraising sudah dimulai (tidak future)

2. **Tanggal Berakhir Fundraising**: `now <= fundraisingEndDate` 
   - Fundraising belum berakhir (tidak expired)

3. **Status Funding**: `!project.isFundingComplete`
   - Target funding belum tercapai sempurna

### Implementasi Kode
```typescript
const isActiveFundraising = (project: Project) => {
  const now = new Date();
  const startDate = new Date(project.fundraisingStartDate);
  const endDate = new Date(project.fundraisingEndDate);
  return now >= startDate && now <= endDate && !project.isFundingComplete;
};

const getProjectStatus = (project: Project) => {
  const now = new Date();
  const startDate = new Date(project.fundraisingStartDate);
  const endDate = new Date(project.fundraisingEndDate);

  // Jika funding sudah complete
  if (project.isFundingComplete) {
    return { status: 'selesai', text: 'Selesai', color: 'bg-blue-500' };
  }

  // Jika fundraising belum dimulai
  if (now < startDate) {
    return { status: 'soon', text: 'Segera', color: 'bg-yellow-500' };
  }

  // Jika fundraising sedang berlangsung
  if (now >= startDate && now <= endDate) {
    return { status: 'aktif', text: 'Aktif', color: 'bg-green-500' };
  }

  // Jika fundraising sudah berakhir tapi belum complete
  return { status: 'berakhir', text: 'Berakhir', color: 'bg-gray-500' };
};
```

### Status Badge dalam Cards

#### 🟢 "Aktif" (Green Badge)
- Kondisi: `now >= startDate && now <= endDate && !isFundingComplete`
- Background: `bg-green-500`
- Text: "Aktif"
- Button: "Donasi Sekarang" (Enabled)

#### 🟡 "Segera" (Yellow Badge) 
- Kondisi: `now < startDate && !isFundingComplete`
- Background: `bg-yellow-500`
- Text: "Segera"
- Button: "Segera Dimulai" (Disabled)

#### 🔵 "Selesai" (Blue Badge) 
- Kondisi: `project.isFundingComplete === true`
- Background: `bg-blue-500`
- Text: "Selesai"
- Button: "Target Tercapai" (Disabled)

#### ⚫ "Berakhir" (Gray Badge)
- Kondisi: `now > endDate && !isFundingComplete`
- Background: `bg-gray-500` 
- Text: "Berakhir"
- Button: "Sudah Berakhir" (Disabled)

### Button Action Logic

#### Button "Donasi Sekarang" (Blue, Enabled)
- Kondisi: `isActiveFundraising(project) === true`
- Class: `bg-blue-600 hover:bg-blue-700`
- Status: Enabled

#### Button "Tidak Aktif" (Gray, Disabled)
- Kondisi: `isActiveFundraising(project) === false`
- Class: `bg-gray-300 cursor-not-allowed`
- Status: Disabled

### Penggunaan di UI Components
- Project Cards: Badge status dan button state
- Project Details: Action buttons
- Search Results: Filtering active projects
- Infinite Scroll: Status indication

### Date Handling
- Menggunakan `new Date()` untuk parsing tanggal
- Timezone: Local browser timezone
- Format: ISO 8601 dari database

### Dependencies
- `fundraisingStartDate`: Required field dari Project model
- `fundraisingEndDate`: Required field dari Project model  
- `isFundingComplete`: Boolean flag dari Project model

---
**File**: `src/app/projects/page.tsx`
**Last Updated**: July 1, 2025
