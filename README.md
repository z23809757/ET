# Pavan's Finance Tracker V3.1

A production-ready personal finance tracking application with multi-device sync, authentication, full audit trails, and powerful analytics.

## Features

- **Authentication**: Email/password signup and login with Supabase Auth
- **Multi-year tracking**: Organize finances by year
- **Flexible schema**: Create custom tabs, tables, and fields
- **Dynamic fields**: Text, Number, Date, Month, and Dropdown types
- **Currency support**: USD and INR with real-time exchange rate
- **Analytics**: Dashboard metrics, charts, monthly summaries, category breakdowns, yearly comparisons
- **Exports**: Export data to Excel (XLSX)
- **Backup/Restore**: Full JSON backup and restore functionality
- **Realtime sync**: Automatic cross-device synchronization
- **Audit Trail**: Complete history of all changes with rollback capability
- **Optimistic updates**: UI updates instantly with rollback on failure
- **Virtualized tables**: Smooth scrolling with thousands of rows
- **Responsive design**: Works on desktop and tablet

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Realtime)
- **Charts**: Recharts
- **Exports**: SheetJS (XLSX)
- **Icons**: Tabler Icons
- **Validation**: Zod
- **Hosting**: Vercel

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the migration SQL files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_indexes_and_functions.sql`
   - `supabase/migrations/003_add_audit_and_triggers.sql`
3. Enable Email auth in Authentication > Providers

### 2. Generate TypeScript Types

After setting up your Supabase project, run:
```bash
npm run generate-types