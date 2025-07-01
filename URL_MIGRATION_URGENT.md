# URL Routing Update: "Ending Soon" → "Urgent"

## Overview
Semua URL routing dan navigasi telah diupdate dari "ending-soon" menjadi "urgent" untuk konsistensi branding dan user experience.

## Perubahan URL dan Routing:

### 1. **Page Routes**
| Sebelum | Sesudah | Status |
|---------|---------|--------|
| `/projects/ending-soon` | `/projects/urgent` | ✅ Updated |

### 2. **API Routes**
| Sebelum | Sesudah | Status |
|---------|---------|--------|
| `/api/projects/ending-soon` | `/api/projects/urgent` | ✅ Updated |

### 3. **Navbar Links**
| Location | Sebelum | Sesudah | Status |
|----------|---------|---------|--------|
| Desktop Menu | `href="/projects/ending-soon"` | `href="/projects/urgent"` | ✅ Updated |
| Mobile Menu | `href="/projects/ending-soon"` | `href="/projects/urgent"` | ✅ Updated |
| Desktop Text | "Ending Soon" | "Urgent" | ✅ Updated |
| Mobile Text | "Ending Soon" | "Urgent" | ✅ Updated |

## File Changes:

### 1. **New Files Created**
- ✅ `src/app/api/projects/urgent/route.ts` (API endpoint)
- ✅ `src/app/projects/urgent/page.tsx` (Page component)

### 2. **Updated Files**
- ✅ `src/components/Navbar.tsx` (Navigation links & text)
- ✅ `src/app/projects/page.tsx` (Filter button & API calls)

### 3. **Legacy Files** (still exist for backward compatibility)
- 📁 `src/app/api/projects/ending-soon/` (can be removed later)
- 📁 `src/app/projects/ending-soon/` (can be removed later)

## Navigation Flow:

### Desktop Navigation:
```
Navbar: Jelajahi Proyek | Trending | Urgent
                                        ↓ 
                              /projects/urgent
```

### Mobile Navigation:
```
Hamburger Menu:
├── Jelajahi Proyek
├── Trending  
└── Urgent → /projects/urgent
```

## Filter Integration:

### Projects Page (`/projects`)
- ✅ Filter button: "🚨 Urgent" 
- ✅ API call: `/api/projects/urgent?limit=12`
- ✅ Header: "🚨 Proyek Urgent"

### Dedicated Urgent Page (`/projects/urgent`)
- ✅ Full page dedicated to urgent projects
- ✅ Advanced filtering (days, limit)
- ✅ Enhanced UI with countdown badges

## User Experience:

### Consistency:
- ✅ All "Ending Soon" terminology changed to "Urgent"
- ✅ Emoji updated: ⏰ → 🚨 (more urgent feeling)
- ✅ URL structure clean and intuitive
- ✅ Same functionality, better branding

### Navigation:
- ✅ Users can access urgent projects via navbar
- ✅ Filter available in main projects page
- ✅ Dedicated page for detailed urgent view
- ✅ All routes working and tested

## Technical Notes:

### Backward Compatibility:
- Legacy endpoints still functional (if needed)
- Can safely remove old files after full migration
- No breaking changes for existing bookmarks

### API Consistency:
- Same response format and data structure
- Same sorting algorithm (by closest end date)
- Same filter logic and functionality

---
**Update Date**: July 1, 2025  
**Migration**: Complete "ending-soon" → "urgent" URL structure
