# AcadConnect

**A High-Trust Faculty Recruitment & Matching Ecosystem for Higher Education**

AcadConnect is a production-grade, multi-tenant web application designed to connect premier global educational institutions with verified academic faculty candidates. Built with a focus on trust, credentials authentication, and user-centric aesthetics, AcadConnect replaces fragmented academic searches with a verified, secure, and modern matching marketplace.

---

## 🚀 Key Features

### 🎓 For Faculty Candidates (Scholars)
* **Verified Academic Profiles:** Link credentials using official institutional email domains (e.g., `.edu`, `.ac.in`) and verify scholarly output.
* **ORCID Integration:** Connect with ORCID registries to import verified publication lists, author credits, and research achievements.
* **Application Tracking:** Build application files, attach cover letters (5+ characters minimum for easier testing), and monitor review pipelines.
* **Saved Vacancies & Notifications:** Bookmark interesting job postings and receive real-time notifications about application status updates.

### 🏫 For Recruiters & Institutions
* **Accredited Onboarding:** Register new institutions and automatically generate URL-safe slugs for dynamic routing workspaces.
* **Verification Status Gating:** Vacancy listings remain invisible to candidates until administrators audit and set the institution's verification state to `approved`.
* **Workspace Dashboard:** View real-time database metrics (Active Listings, Total Applicants, Shortlisted Candidates) with mock statistics removed for authenticity.
* **Applicant Screening Pipelines:** Review candidate CVs securely via dynamic server-side authorization checks and update candidate pipeline positions.
* **Billing & Premium Plans Portal:** Clean preview screen illustrating active Free Tier benefits and outlining upcoming premium subscriptions.

### 🌐 Platform & UI Enhancements
* **Responsive Layouts:** The navigation header dynamically hides guest auth buttons on mobile screens to prevent overflow and shifting, routing mobile users via an elegant slide-over drawer.
* **Interactive Legal Portals:** Dedicated `/privacy` and `/terms` pages featuring:
  * Sticky Table of Contents (TOC) with scrollspy active-state tracking.
  * Instant search query filtering for clauses.
  * Custom styled print stylesheets for saving documents cleanly.
* **Global Dark & Light Theme:** persist preferred themes to `localStorage` and block server-side flashes via inline `<head>` scripts.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Core Framework** | Next.js 16.2.9 (Turbopack, App Router, Server Actions) |
| **Runtime / Compiler** | React 19.2.4 (React Compiler enabled for automatic memoization) |
| **Styling & Theme** | Tailwind CSS v4, Vanilla CSS custom variables, Framer Motion |
| **Component System** | Base UI & Shadcn UI components |
| **Database & Auth** | Supabase (PostgreSQL 15, Row Level Security, Trigger Functions) |
| **Form Handling** | React Hook Form & Zod Schemas |
| **Vulnerability Gating** | PostCSS ^8.5.10 (Secured via npm `overrides` to prevent CSS XSS vectors) |

---

## 📂 Project Directory Structure

```text
acadconnect/
├── public/                 # Static public assets
│   └── favicon.png         # Main custom website logo
├── src/
│   ├── app/                # Next.js App Router (Nested Route Groups)
│   │   ├── (admin)/        # /admin - Administration overview & gating
│   │   ├── (faculty)/      # /applications, /profile, /saved-jobs, /settings
│   │   ├── (institution)/  # /inst/[slug]/dashboard - Recruiter workspace
│   │   ├── (public)/       # /, /about, /contact, /privacy, /terms, /jobs
│   │   ├── api/            # API Endpoints (e.g. /api/cv for secure CV streams)
│   │   ├── globals.css     # Tailwind v4 import & custom OKLCH color palettes
│   │   ├── icon.png        # Compiled app favicon (next.js auto-file router)
│   │   └── layout.tsx      # Root html wrapper with theme script
│   ├── components/         # Global layout (Navbar, Footer, Sidebar) & UI components
│   ├── features/           # Domain-driven features (auth, jobs, institutions)
│   ├── hooks/              # Custom React hooks (use-mounted, theme hooks)
│   ├── lib/                # Client & Server integrations (supabase connections)
│   ├── providers/          # App state providers (theme, supabase, react-query)
│   ├── schemas/            # Unified Zod input schemas (job validation, auth)
│   └── types/              # TypeScript types and database definitions
├── supabase/
│   └── migrations/         # PostgreSQL tables schema, trigger actions, and storage policies
└── package.json            # Scripts, project dependencies, and PostCSS dependency overrides
```

---

## 🔐 Security & Database Architecture

AcadConnect enforces a zero-trust model at the database layer using **Supabase Row Level Security (RLS)**:

* **Profiles & Faculty Profiles:** Gated so users can only write/update their own profile metadata. Recruiter access to faculty details is restricted to candidates who have actively submitted a job application to their institution.
* **Jobs Gating:** Drafts are only readable by members of the publishing institution. Published listings are readable by authenticated candidates—subject to the publishing institution's verification status being `approved`.
* **Private CV Storage:** Resumes are uploaded to a private Supabase storage bucket (`resumes`). Download/stream access is managed by the `/api/cv` API route which authenticates requests and verifies that the caller is either the owner of the CV or an institution member with an active vacancy application from that scholar.
* **Activity Logs:** Blocked from client-side read operations. Write operations are restricted to logging actions matching the authenticated user ID.

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory and add the following keys:

```env
# Supabase API Settings (Publicly exposed in client build)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anonymous_key

# Supabase Admin Settings (Strictly secret - server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

*Warning: Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_` as it bypasses database Row Level Security.*

---

## 💻 Local Development

### 1. Prerequisites
* Node.js (version 20 or higher)
* npm, yarn, or pnpm package manager

### 2. Installation & Server Initialization
Clone the repository and initialize node packages:
```bash
npm install
```

Start the Next.js development server:
```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000).

### 3. Production Verification & Building
To run static analysis and build optimization checks locally:
```bash
# Lint check and style rule audit
npm run lint

# Build optimized production bundle
npm run build
```

---

## ⚖️ Governing Law & Jurisdiction

Any disputes, claims, or contract compliance issues arising from the use of the AcadConnect platform are governed in accordance with the **laws of India**, subject to the exclusive jurisdiction of the competent courts of **Jodhpur, Rajasthan, India**.
