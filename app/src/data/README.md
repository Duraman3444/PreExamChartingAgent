# Shared Data Source

## Overview

This directory contains the shared data sources used throughout the medical charting application to ensure consistency across all pages.

## Key Files

### `mockData.ts`
**⚠️ SINGLE SOURCE OF TRUTH FOR PATIENT DATA**

This file contains all patient and visit data used throughout the application. All pages that display patient or visit information should import and use this data to ensure consistency.

#### When adding new patients:
1. **Only add them to `mockData.ts`** - do not create separate mock data in individual page files
2. New patients will automatically appear across all tabs/pages:
   - Dashboard
   - Patients  
   - Visits
   - Transcripts
   - Visit Notes
   - AI Analysis
   - Profile
   - Settings

#### Pages that use this data:
- **Transcripts page** - Uses `mockVisits` directly
- **Notes page** - Uses `mockVisits` directly  
- **AI Analysis Entry page** - Uses `mockVisits` directly
- **Visit Management page** - Uses `mockVisits` with conversion to `VisitRecord` format
- **Patient Management page** - Derives patient data from `mockVisits`

## Data Conversion

Some pages require different data formats:

### VisitManagement.tsx
Uses `convertVisitToRecord()` function to map from shared `Visit` interface to local `VisitRecord` interface. Key mappings:
- `transcriptStatus` → `transcriptProcessingStatus`
- `analysisStatus` → `aiAnalysisStatus`

### PatientManagement.tsx
Uses `convertVisitsToPatients()` function to derive patient records from visit data:
- Groups visits by patient ID
- Calculates latest visit dates
- Generates case numbers and phone numbers
- Determines patient status based on visit status

## Best Practices

1. **Never create separate mock data arrays** in individual page components
2. **Always import from `mockData.ts`** when you need patient/visit data
3. **Update the shared data** when adding new patients or visits
4. **Use conversion functions** when your page needs a different data format
5. **Keep interfaces consistent** where possible to minimize conversion needs

## Benefits

- **Consistency**: All pages show the same patients and data
- **Maintainability**: Changes in one place update everywhere
- **Scalability**: Easy to add new patients or data fields
- **Developer Experience**: Clear single source of truth reduces confusion 