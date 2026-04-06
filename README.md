# HUMI Training Hub

A full-stack, multi-tenant Learning Management System (LMS) built for training professionals across any field or industry. The platform manages the entire student lifecycle — from enrollment and payment to course delivery, AI-powered practice, assessments, certifications, and job placement — while supporting multiple user roles and white-label corporate clients.

**Live:** [humi-hub.vercel.app](https://humi-hub.vercel.app)

---

## Platform Overview

```
humi-hub/
│
├── portals/
│   ├── public/             # Marketing site, enrollment, job board, placement
│   ├── student/            # Learning, AI tools, career, community
│   ├── admin/              # Full LMS + accounting + operations management
│   ├── trainer/            # Course delivery, grading, student management
│   ├── corporate/          # White-label client portal with page builder
│   ├── employer/           # Job postings and applicant management
│   ├── humi-admin/         # Platform-level administration
│   └── superadmin/         # Multi-tenant SaaS management
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth | NextAuth.js 4 (JWT sessions, credentials-based) |
| AI | OpenAI API (`gpt-4o-mini`) |
| Email | React Email + Nodemailer (Gmail SMTP) |
| PDF | `@react-pdf/renderer` (certificates) |
| Payments | PayMongo (GCash, PayMaya, cards) + Stripe |
| File Storage | AWS S3 + Vercel Blob |
| Calendar | Google Calendar API |
| Drag & Drop | `@dnd-kit` (page builder) |
| Styling | Tailwind CSS 4 |
| UI | Radix UI + shadcn/ui, Lucide icons |
| Validation | Zod 4 + React Hook Form |
| Deployment | Vercel |

---

## Features

### Public Pages
- **Landing Page** — Hero section, program previews, testimonials, and value propositions
- **Programs Catalog** — Browse available programs with pricing and outcomes
- **Free Lesson Previews** — Preview select lessons before enrolling
- **Multi-Step Enrollment** — Personal info, skills assessment, and motivation capture
- **Online Payment** — PayMongo checkout (GCash, PayMaya, cards) or manual proof upload
- **Career Placement** — Job board with placement services (coaching, resume, interview, jobs)
- **Certificate Verification** — Public verification of issued certificates by cert number
- **Skill Verification** — Public verification of student skill badges
- **Portfolio** — Public student portfolio pages
- **Student Success** — Graduate success stories and outcomes
- **Student Ranking** — Public leaderboard
- **Enterprise** — Corporate training solutions page
- **Pricing** — Subscription tiers and plans
- **Learning Paths** — Structured multi-course pathways
- **Community** — Community hub
- **Certifications** — Available certification programs
- **Resources** — Free learning resources
- **Help Center** — Searchable help articles
- **Invite System** — Referral and invite links (`/invite/[code]`)
- **Account Activation** — Email-based account activation (`/activate/[token]`)
- **Forgot / Reset Password** — Self-service password recovery
- **Registration** — Direct sign-up flow
- **Enrollment Status Tracker** — Real-time status lookup (`/enrollment-status/[id]`)
- **Contact Form** — Direct inquiry with email notification

### Admin Dashboard (40+ pages)
- **Dashboard** — Real-time metrics (enrollments, payments, attendance, schedules)
- **Enrollee Pipeline** — Full lifecycle: Pending > Approved > Enrolled with profile view
- **Payment Verification** — Review proofs, verify payments, PayMongo webhook tracking
- **Course Management** — CRUD with outcomes, pricing, and active/inactive toggle
- **Lesson Management** — Lesson CRUD with video URLs, ordering, and preview flags
- **Trainer Management** — Trainer profiles, specializations, and course assignments
- **Course Resources** — Upload training documents (PDF, DOC, PPT, XLS, images)
- **Quiz & Assignment Management** — Create quizzes, grade submissions, provide feedback
- **Schedule Management** — Training batches with capacity, dates, and enrollment cutoffs
- **Calendar** — Platform-wide events (announcements, deadlines, orientations, holidays)
- **Student Management** — Active students, access control, batch assignment, directory
- **Attendance** — Live clock-in/out monitoring
- **Analytics** — Enrollment trends, course popularity, quiz performance
- **Engagement Metrics** — Activity tracking and inactivity identification
- **Student Ranking** — Gamified leaderboard management
- **Communications** — Email management with 26+ templates
- **AI Control Tower** — AI-powered risk indicators, anomaly detection, recommendations
- **AI Insights** — Performance predictions and dropout risk scores
- **Testimonials** — Curate and publish student success stories
- **Job Postings** — Create and manage job listings
- **Job Applications** — Track and manage applicant pipeline
- **Placements** — Career placement tracking and management
- **Reports & Export** — CSV/Excel data export, summary reports
- **Certificate Issuance** — Generate and manage completion certificates
- **Revenue** — Revenue tracking and financial overview
- **Sales** — Sales pipeline and management
- **HR** — Human resources management
- **Inventory** — Resource and asset inventory
- **IT** — IT asset and system management
- **Marketing** — Marketing campaigns and content
- **Organizations** — Partner and organization management
- **Knowledge Base** — Internal knowledge base management
- **Messages** — Internal messaging system
- **Notifications** — Platform notification management
- **Subscriptions** — Subscription plan management
- **Tiers** — Pricing tier configuration
- **Tasks** — Internal task management
- **Support Tickets** — Helpdesk ticket management
- **Users (Corporate)** — Corporate client user management
- **Profile** — Admin profile management
- **Settings** — Platform-wide settings

#### Accounting Module (Full Double-Entry Bookkeeping)
- **Chart of Accounts** — Full account hierarchy management
- **Transactions** — Journal entries and transaction ledger
- **Invoices** — Invoice creation, management, and tracking
- **Expenses** — Expense submission, approval, and rejection workflow
- **Bank Accounts** — Bank account management with auto-reconciliation and CSV import
- **Bank Transactions** — Transaction matching and reconciliation
- **Financial Reports**:
  - Profit & Loss Statement
  - Balance Sheet
  - Cash Flow Statement
  - Trial Balance
  - General Ledger
- **Forensic Flags** — Anomaly detection and financial audit trail
- **Audit Logs** — Complete accounting audit history

### Trainer Portal (12+ pages)
- **Course Dashboard** — Assigned course overview and activity
- **Lessons** — Lesson delivery and content management
- **Students** — Student list and progress tracking
- **Submissions** — Assignment grading and feedback
- **Schedule** — Personal training schedule
- **Materials** — Course material uploads
- **Messages** — Communication with students and admins
- **Notifications** — Trainer notifications
- **Ratings** — Student feedback and ratings
- **Tasks** — Task management
- **Support** — Support ticket submission
- **Profile** — Trainer profile management

### Corporate Portal (18+ pages)
- **Dashboard** — Corporate training overview and analytics
- **Employees** — Employee roster and training assignment
- **Enrollments** — Bulk enrollment management
- **Courses** — Assigned course catalog
- **Trainers** — Corporate trainer directory
- **Calendar** — Corporate training calendar
- **Analytics** — Training completion and performance reports
- **Reports** — Corporate reporting
- **Messages** — Internal messaging
- **Announcements** — Company-wide announcements
- **Tasks** — Task management
- **Files** — Document management
- **Support** — Support request management
- **Settings** — Corporate account settings
- **Theme** — White-label theme customization
- **Page Builder** — Drag-and-drop website page builder
- **Website** — Corporate microsite management
- **AI Tools** — AI-powered corporate training tools
- **Notifications** — Corporate notification center

### Employer Dashboard (3+ pages)
- **Job Listings** — Browse and search job postings
- **Post a Job** — Create new job listings
- **Registration / Login** — Employer account management

### Student Portal (35+ pages)
- **Dashboard** — Progress overview, quiz averages, points, badges, and activity feed
- **Lesson Viewer** — Structured lessons with video support and completion tracking
- **Quizzes** — Multiple choice, true/false, short answer with instant scoring
- **Assignments** — File submission with grading, feedback, and AI evaluation
- **Discussion Forum** — Course-specific and global threaded discussions
- **Leaderboard** — Gamified ranking with points and badges
- **Certificates** — View, download (PDF), and share completion certificates
- **Calendar** — Personal schedule with events and due dates
- **Attendance** — Daily clock-in/out tracking
- **Portfolio** — Build and showcase a public portfolio
- **Resume Builder** — AI-assisted resume creation
- **Career** — Career development hub
- **Career Readiness** — 6-dimension readiness scoring
- **Learning Analytics** — Personal learning data and insights
- **Progress** — Detailed course progress tracking
- **Skill Tree** — Visual skill progression map
- **Skill Verification** — Verified skill badges
- **Mentor** — Mentorship program access
- **Freelance** — Freelance opportunity board
- **Internship Program** — Internship matching and management
- **Job Matches** — AI-powered job recommendations
- **Employer Feedback** — Feedback from employers post-placement
- **Messages** — Direct messaging
- **Notifications** — In-app notification center
- **Help Center** — Searchable help articles
- **Support** — Support ticket submission
- **Profile** — Student profile management
- **Settings** — Account settings
- **Change Password** — Required on first login

### AI-Powered Features (12+)

| Feature | Description |
|---------|-------------|
| AI Client Simulator | Practice with virtual client scenarios per course specialty |
| AI Mock Interviews | Realistic job interview practice with multi-question scoring |
| AI Practice Tasks | On-demand task generation with evaluation and feedback |
| AI Skill Assessments | 6-dimension career readiness scoring |
| AI Task Generator | Course-specific tasks at varying difficulty levels |
| AI Business Assistant | Real-time Q&A, template suggestions, email drafting |
| AI Job Matching | Skill-based job recommendations with match percentages |
| AI Email Practice | Professional email writing practice with AI feedback |
| AI Feedback Engine | Personalized learning feedback and improvement suggestions |
| AI Lab | Experimental AI tools and advanced practice scenarios |
| AI Control Tower | Admin dashboard with AI insights and risk detection |
| AI Admin Insights | Platform-wide predictions and analytics |
| Work Pace Monitor | Productivity tracking with improvement suggestions |

### Super Admin Portal (10+ pages)
- **Tenant Management** — Create, edit, and manage white-label client tenants
- **Tenant View** — Live drill-down into any tenant's dashboard, courses, students, revenue, trainers
- **Subscriptions** — Subscription plan assignment per tenant
- **Modules** — Feature module toggles per tenant
- **Feature Flags** — Platform-wide feature flag management
- **Financial** — Cross-tenant financial overview
- **Revenue** — Platform-wide revenue analytics
- **Analytics** — Aggregate platform analytics
- **Support** — Platform-level support management
- **Humi Admins** — Manage Humi Admin user accounts
- **Settings** — Super admin settings

### Humi Admin Portal (4+ pages)
- **Tenant Management** — Tenant oversight and support
- **Content** — Platform content management
- **Monitoring** — System health and monitoring
- **Support** — Escalated support management

### Email Notifications (26+ templates)
- Enrollment confirmation, approval, rejection
- Payment instructions, reminders, confirmation
- Assignment due reminders, graded notifications
- Course and lesson completion
- Badge earned, quiz passed/failed
- Certificate issued
- Weekly progress reports
- Forum reply notifications
- Inactivity reminders
- Password reset and email verification
- Account activation
- Support ticket notifications
- Mentor and internship communications

---

## Project Structure

```
humi-hub/
├── prisma/
│   ├── schema.prisma              # Database schema (40+ models)
│   └── seed.ts                    # Seed data (courses, admin, badges, lessons)
├── src/
│   ├── app/
│   │   ├── (public)/              # Public pages
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── about/                 # About page
│   │   │   ├── activate/[token]/      # Account activation
│   │   │   ├── career-placement/      # Job board & placement services
│   │   │   ├── certifications/        # Certification programs
│   │   │   ├── community/             # Community hub
│   │   │   ├── contact/               # Contact form
│   │   │   ├── courses/ → programs/   # Redirected (permanent)
│   │   │   ├── enterprise/            # Corporate solutions
│   │   │   ├── enroll/                # Multi-step enrollment form
│   │   │   ├── enrollment-status/[id]/# Enrollment tracker
│   │   │   ├── employer-dashboard/    # Employer portal
│   │   │   ├── features/              # Platform features page
│   │   │   ├── forgot-password/       # Password recovery
│   │   │   ├── help/[slug]/           # Help center
│   │   │   ├── invite/[code]/         # Invite system
│   │   │   ├── jobs/ → career-placement/ # Redirected (permanent)
│   │   │   ├── learning-paths/        # Learning pathways
│   │   │   ├── pay/[enrollmentId]/    # Payment page (online + manual)
│   │   │   ├── placement/             # Placement services
│   │   │   ├── portfolio/[studentId]/ # Public student portfolio
│   │   │   ├── pricing/               # Pricing plans
│   │   │   ├── programs/[slug]/       # Program catalog & detail pages
│   │   │   ├── register/              # Direct registration
│   │   │   ├── reset-password/        # Password reset
│   │   │   ├── resources/             # Free resources
│   │   │   ├── student-ranking/       # Public leaderboard
│   │   │   ├── student-success/       # Success stories
│   │   │   ├── verify/                # Certificate verification
│   │   │   ├── verify-email/          # Email verification
│   │   │   └── verify-skills/[id]/    # Skill verification
│   │   ├── (admin)/admin/         # Admin dashboard (40+ protected routes)
│   │   │   ├── page.tsx               # Dashboard overview
│   │   │   ├── accounting/            # Full accounting suite
│   │   │   ├── ai-insights/           # AI analytics
│   │   │   ├── analytics/             # Platform analytics
│   │   │   ├── attendance/            # Live attendance tracking
│   │   │   ├── calendar/              # Event calendar
│   │   │   ├── certificates/          # Certificate management
│   │   │   ├── communications/        # Email management
│   │   │   ├── control-tower/         # AI control tower
│   │   │   ├── courses/               # Course CRUD
│   │   │   ├── engagement/            # Student engagement
│   │   │   ├── enrollees/             # Enrollment pipeline
│   │   │   ├── hr/                    # HR management
│   │   │   ├── inventory/             # Inventory management
│   │   │   ├── it/                    # IT management
│   │   │   ├── job-applications/      # Job applicant management
│   │   │   ├── job-postings/          # Job posting management
│   │   │   ├── knowledge-base/        # Knowledge base
│   │   │   ├── lessons/               # Lesson management
│   │   │   ├── marketing/             # Marketing management
│   │   │   ├── messages/              # Messaging
│   │   │   ├── notifications/         # Notification management
│   │   │   ├── organizations/         # Organization management
│   │   │   ├── payments/              # Payment verification
│   │   │   ├── placements/            # Placement tracking
│   │   │   ├── reports/               # Data export
│   │   │   ├── revenue/               # Revenue overview
│   │   │   ├── sales/                 # Sales management
│   │   │   ├── schedules/             # Batch schedule management
│   │   │   ├── settings/              # Platform settings
│   │   │   ├── student-ranking/       # Leaderboard management
│   │   │   ├── students/              # Student management
│   │   │   ├── submissions/           # Assignment grading
│   │   │   ├── subscriptions/         # Subscription management
│   │   │   ├── tasks/                 # Task management
│   │   │   ├── testimonials/          # Testimonial management
│   │   │   ├── tickets/               # Support ticket management
│   │   │   ├── tiers/                 # Pricing tier management
│   │   │   ├── trainers/              # Trainer management
│   │   │   └── users/                 # User management
│   │   ├── (trainer)/trainer/     # Trainer portal (12+ protected routes)
│   │   ├── (corporate)/corporate/ # Corporate portal (18+ protected routes)
│   │   ├── (employer)/            # Employer dashboard
│   │   ├── (humi-admin)/          # Humi admin portal
│   │   ├── (superadmin)/          # Super admin portal (10+ protected routes)
│   │   ├── (student)/student/     # Student portal (35+ protected routes)
│   │   └── api/                   # 150+ API endpoints
│   │       ├── auth/                  # NextAuth
│   │       ├── admin/                 # Admin API (accounting + LMS)
│   │       ├── corporate/             # Corporate API
│   │       ├── employer/              # Employer API
│   │       ├── humi-admin/            # Humi admin API
│   │       ├── superadmin/            # Super admin API
│   │       ├── student/               # Student API
│   │       ├── trainer/               # Trainer API
│   │       ├── payments/              # Payment processing & webhooks
│   │       ├── cron/                  # Scheduled jobs
│   │       ├── google/                # Google Calendar integration
│   │       ├── invite/                # Invite system
│   │       ├── jobs/                  # Public job board API
│   │       ├── knowledge-base/        # Knowledge base API
│   │       ├── messages/              # Messaging API
│   │       ├── notifications/         # Notifications API
│   │       ├── placement/             # Placement API
│   │       ├── subscriptions/         # Subscription API
│   │       ├── tenant/                # Tenant management API
│   │       ├── testimonials/          # Public testimonials API
│   │       ├── tickets/               # Support ticket API
│   │       ├── tiers/                 # Tier config API
│   │       └── chat/                  # AI chatbot
│   ├── components/
│   │   ├── admin/                 # Admin components (settings, etc.)
│   │   ├── corporate/             # Corporate portal components
│   │   ├── employer/              # Employer portal components
│   │   ├── enrollment/            # Enrollment form components
│   │   ├── humi-admin/            # Humi admin components
│   │   ├── page-builder/          # Drag-and-drop page builder
│   │   ├── placement/             # Placement components
│   │   ├── portal/                # Login portal components
│   │   ├── public/                # Public page components
│   │   ├── shared/                # Shared across portals
│   │   ├── student/               # Student portal components
│   │   ├── superadmin/            # Super admin components
│   │   ├── theme-panel/           # White-label theme panel
│   │   ├── trainer/               # Trainer portal components
│   │   └── ui/                    # shadcn/ui primitives
│   └── lib/
│       ├── auth.ts                # NextAuth configuration
│       ├── prisma.ts              # Prisma client singleton
│       ├── guards/                # Route guard utilities
│       ├── repositories/          # 50+ data access modules
│       ├── services/              # 35+ business logic modules
│       ├── validations/           # Zod schemas
│       ├── validators/            # Additional validators
│       ├── email/templates/       # 26+ React Email templates
│       ├── constants/             # Enums and constants
│       ├── types/                 # TypeScript type definitions
│       └── utils/                 # Utility functions
└── public/
    └── uploads/                   # Uploaded files (payments, resources)
```

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌───────────┐
│   Client     │ ──▸ │  API Routes  │ ──▸ │  Services        │ ──▸ │  Prisma   │
│  (React)     │     │  (Next.js)   │     │  (Business Logic)│     │  (ORM)    │
└─────────────┘     └──────────────┘     └──────────────────┘     └───────────┘
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐     ┌──────────────────┐
                    │  Validations │     │  Repositories    │
                    │  (Zod)       │     │  (Data Access)   │
                    └──────────────┘     └──────────────────┘
```

- **API Routes** — Handle HTTP requests, auth checks, and input validation
- **Services** — Business logic, AI integrations, and email notifications
- **Repositories** — Database queries via Prisma (no business logic)
- **Validations** — Zod schemas for type-safe input validation at boundaries

### Multi-Tenant Architecture

```
Superadmin
    │
    ├── Tenant A (e.g. HUMI Training Hub)
    │       ├── Admin → Trainers → Students
    │       ├── Corporate Clients → Employees
    │       └── Employers → Job Postings
    │
    └── Tenant B (white-label client)
            └── Same structure, isolated data
```

Each tenant gets its own isolated data, branding (theme + logo), subdomain support, and feature module configuration controlled by the Superadmin.

---

## Enrollment Workflow

```
Student submits enrollment form
        │
        ▼
Admin reviews application ──▸ Rejected (email sent)
        │
        ▼ Approved (email with payment instructions)
Student pays online (PayMongo / Stripe) or uploads proof
        │
        ▼
Admin verifies payment (or webhook auto-verifies)
        │
        ▼
Student account created ──▸ Welcome email with credentials
        │
        ▼
Student logs in ──▸ Must change password on first login
        │
        ▼
Course access begins
```

---

## User Roles

| Role | Portal | Description |
|------|--------|-------------|
| **Student** | `/student` | Enrolled learners accessing courses and AI tools |
| **Admin** | `/admin` | Full platform management including accounting |
| **Trainer** | `/trainer` | Course delivery and student evaluation |
| **Corporate** | `/corporate` | White-label client with page builder and team training |
| **Employer** | `/employer-dashboard` | Job posting and applicant management |
| **Humi Admin** | `/humi-admin` | Platform-level content and tenant support |
| **Superadmin** | `/superadmin` | Multi-tenant SaaS management |

---

## Database Models

| Category | Models |
|----------|--------|
| **Core** | Course, Enrollment, Student, Admin, Payment, Tenant |
| **Content** | Lesson, Quiz, QuizQuestion, QuizAnswer, QuizAttempt, Assignment, Submission |
| **Certification** | Certificate, Badge, StudentBadge, PointTransaction |
| **Community** | ForumThread, ForumPost, Messaging, Notification |
| **Scheduling** | Schedule, AttendanceRecord, CalendarEvent, GoogleToken |
| **AI & Career** | SimulationSession, InterviewSession, CareerReadinessScore, JobPosting, JobMatch, WorkPaceMonitor, EmailPracticeSession, FeedbackEngineSession |
| **Management** | Trainer, CourseTrainer, CourseResource, Testimonial, ContactMessage, KnowledgeBase, SupportTicket |
| **Corporate** | Organization, CorporateUser, TenantPage, TenantTheme |
| **Accounting** | Account, Transaction, Invoice, Expense, BankAccount, BankTransaction, ForensicFlag, AuditLog |
| **SaaS** | Subscription, Tier, Module, FeatureFlag |

---

## Available Programs

Programs are fully configurable from the Admin Dashboard. The platform currently features specialized virtual assistant training programs and supports any training curriculum — professional skills, technical courses, certifications, and more.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database ([Neon](https://neon.tech) recommended)
- Gmail account with App Password (for email)
- OpenAI API key (for AI features)
- PayMongo account (for online payments — optional)
- Stripe account (for subscription payments — optional)
- AWS S3 or Vercel Blob (for file storage — optional)

### 1. Clone and Install

```bash
git clone https://github.com/erikalightt9-ctrl/humi-hub.git
cd humi-hub
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Authentication (Required)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email - Gmail SMTP (Required)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"
EMAIL_FROM_NAME="HUMI Training Hub"
EMAIL_FROM_ADDRESS="your-email@gmail.com"

# AI Features (Required for AI features)
OPENAI_API_KEY="sk-..."

# PayMongo - Online Payments (Optional)
PAYMONGO_SECRET_KEY="sk_test_..."
PAYMONGO_WEBHOOK_SECRET="whsk_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe - Subscription Payments (Optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3 - File Storage (Optional)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-southeast-1"
AWS_S3_BUCKET="..."

# Vercel Blob - File Storage (Optional)
BLOB_READ_WRITE_TOKEN="..."

# Google Calendar (Optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Manual Payment Info (Optional)
GCASH_NUMBER="09XX-XXX-XXXX"
GCASH_NAME="Your Name"
GCASH_QR_URL="https://..."
BANK_NAME="BDO"
BANK_ACCOUNT_NUMBER="0000-0000-0000"
BANK_ACCOUNT_NAME="Your Name"

# Cron Jobs (Optional)
CRON_SECRET="your-cron-secret"
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default Admin Credentials
- **Email:** admin@humitraininghub.com
- **Password:** Admin@123456!

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Run migrations + generate Prisma client + production build |
| `npm start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage report |

---

## Security

- JWT-based sessions with 8-hour expiry
- bcrypt password hashing
- Role-based access control (7 roles: student, admin, trainer, corporate, employer, humi-admin, superadmin)
- Security headers (X-Frame-Options, CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Rate limiting on API endpoints
- Input validation at all boundaries (Zod)
- Parameterized queries via Prisma (SQL injection prevention)
- HTML sanitization (`sanitize-html`)
- Student access expiry enforcement
- PayMongo webhook signature verification (HMAC-SHA256)
- Stripe webhook signature verification
- Email verification on registration
- Account activation flow

---

## Deployment

Deployed on [Vercel](https://vercel.com) with automatic `prisma migrate deploy` + `prisma generate` in the build step.

```bash
npx vercel --prod
```

**Required Vercel Environment Variables:**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `NEXTAUTH_URL` | Production URL |
| `GMAIL_USER` | Email sender address |
| `GMAIL_APP_PASSWORD` | Gmail app password |
| `OPENAI_API_KEY` | AI features |
| `PAYMONGO_SECRET_KEY` | Online payments |
| `PAYMONGO_WEBHOOK_SECRET` | Payment webhook verification |
| `NEXT_PUBLIC_APP_URL` | Payment redirect URLs |
| `STRIPE_SECRET_KEY` | Subscription payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |

---

## License

Private project. All rights reserved.
