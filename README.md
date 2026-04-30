# HUMI Training Hub

A full-stack, multi-tenant Learning Management System (LMS) built for training professionals across any field or industry. The platform manages the entire student lifecycle — from enrollment and payment to course delivery, AI-powered practice, assessments, certifications, and job placement — while supporting multiple user roles, white-label corporate clients, and a fully integrated Office Admin department for internal operations management.

**Live:** [va-training-center.vercel.app](https://va-training-center.vercel.app)

---

## Platform Overview

```
humi-hub/
│
├── portals/
│   ├── public/             # Marketing site, enrollment, job board, placement
│   ├── student/            # Learning, AI tools, career, community
│   ├── admin/              # Full LMS + accounting + operations management
│   │   └── office-admin/   # Inventory, procurement, logistics, budget, reports
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
- **Financial Reports** — Profit & Loss, Balance Sheet, Cash Flow, Trial Balance, General Ledger
- **Forensic Flags** — Anomaly detection and financial audit trail
- **Audit Logs** — Complete accounting audit history

#### Office Admin Department (8 modules)

A dedicated operations management department within the Admin portal for day-to-day office management.

**Inventory** — Multi-category inventory with real-time sync:
- Office Supplies, Maintenance, Medical, Stockroom, Fuel & Maintenance subcategories
- Inline editable grid with stock movements (IN / OUT / ADJUST)
- Add Stock bulk entry, low stock and out-of-stock alerts
- Per-row edit modal and delete with confirm
- Supply Requests queue with approval workflow (Approve → Issue → Complete)

**Procurement** — Purchase order management:
- PO tracking with vendor, quantity, unit price, delivery date, and status (Pending → Ordered → Delivered → Cancelled)
- Bulk grid entry for multiple items at once
- Full edit and delete per row

**Logistics** — Fleet and delivery management:
- **Fleet tab** — Vehicle registry (name, plate, type, driver, status)
- **Deliveries tab** — Origin/destination tracking, scheduled date/time, vehicle assignment, cargo notes
- Inline status updates (Scheduled → In Transit → Delivered → Cancelled)
- KPI strip: Scheduled, In Transit, Delivered, Cancelled counts
- Full edit modal and delete with confirm on both vehicles and deliveries

**Assets** — Office asset registry:
- Asset tracking with tag, type, status, location, purchase date, warranty, and serial number
- Full CRUD with inline editing

**Requests** — Internal office request system with approval chain:
- Categories: Supplies, Repair, IT, Facilities, Other
- Priority levels: Low, Normal, High, Urgent (color-coded)
- Workflow: Pending → Approved → Completed (or Rejected with reason)
- Filterable by status, category, and search term

**Vendors** — Supplier management:
- Vendor directory with contact person, email, phone, address, category, and status
- Full CRUD with search

**Budget** — Category-based budget tracking:
- Per-category monthly and yearly budget allocations
- Expense logging with description, amount, date, and reference
- Auto-pulls procurement spend (delivered POs) and fuel costs into actual spend
- Progress bars with over-budget alerts and utilization percentages
- Monthly / yearly period switching

**Reports** — 5 built-in report types with CSV export:
- **Inventory Usage Summary** — Stock IN / OUT by item with usage bars
- **Procurement Spend by Vendor** — Delivered PO spend ranked by vendor
- **Fuel Cost per Vehicle** — Liters, total cost, avg price/liter per vehicle
- **Budget vs Actual** — Category budgets against actual spend with status indicators
- **Monthly Expense Trends** — Month-by-month procurement, fuel, and other spend for the full year

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
│   ├── schema.prisma              # Database schema (137+ models)
│   └── seed.ts                    # Seed data (courses, admin, badges, lessons)
├── src/
│   ├── app/
│   │   ├── (public)/              # Public pages
│   │   ├── (admin)/admin/         # Admin dashboard (40+ protected routes)
│   │   │   ├── accounting/            # Full accounting suite
│   │   │   ├── admin/                 # Office Admin department
│   │   │   │   ├── inventory/         # Multi-category inventory
│   │   │   │   │   ├── page.tsx           # Main inventory grid (5 subcategories)
│   │   │   │   │   ├── office-supplies/   # Office supplies subpage
│   │   │   │   │   ├── maintenance-supplies/
│   │   │   │   │   ├── medical-supplies/
│   │   │   │   │   ├── stockroom/
│   │   │   │   │   ├── fuel-maintenance/  # Fuel logs + car maintenance
│   │   │   │   │   └── categories/[id]/   # Category bulk grid
│   │   │   │   ├── procurement/       # Purchase order management
│   │   │   │   ├── logistics/         # Fleet + delivery tracking
│   │   │   │   ├── assets/            # Office asset registry
│   │   │   │   ├── requests/          # Internal requests + approval chain
│   │   │   │   ├── vendors/           # Supplier directory
│   │   │   │   ├── budget/            # Category budgets + expense tracking
│   │   │   │   └── reports/           # 5-report analytics + CSV export
│   │   │   └── ...                    # Other admin modules
│   │   ├── (trainer)/trainer/     # Trainer portal (12+ protected routes)
│   │   ├── (corporate)/corporate/ # Corporate portal (18+ protected routes)
│   │   ├── (employer)/            # Employer dashboard
│   │   ├── (humi-admin)/          # Humi admin portal
│   │   ├── (superadmin)/          # Super admin portal (10+ protected routes)
│   │   ├── (student)/student/     # Student portal (35+ protected routes)
│   │   └── api/                   # 461+ API endpoints
│   │       ├── admin/office-admin/    # Office Admin APIs
│   │       │   ├── requests/          # CRUD + approval workflow
│   │       │   ├── logistics/         # Fleet + delivery management
│   │       │   ├── budget/            # Categories + entries + spend aggregation
│   │       │   ├── reports/           # 5 report types
│   │       │   ├── inventory/         # Inventory items + movements
│   │       │   ├── procurement/       # PO management
│   │       │   ├── fuel-maintenance/  # Fuel logs + car maintenance + PATCH
│   │       │   ├── supply-requests/   # Employee supply request queue
│   │       │   ├── transactions/      # Cell-level edit transactions
│   │       │   ├── workflows/         # Stock workflow recording
│   │       │   ├── stream/            # SSE real-time events
│   │       │   ├── activity-logs/     # Audit activity logs
│   │       │   └── ...
│   │       └── ...                    # 400+ other API routes
│   ├── components/
│   │   ├── admin/office-admin/    # ExcelGrid, BulkEntryGrid, GenericBulkGrid
│   │   └── ...
│   └── lib/
│       ├── auth.ts
│       ├── prisma.ts
│       ├── repositories/
│       ├── services/
│       ├── email/templates/
│       └── ...
└── public/
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
    ├── Tenant A (e.g. HUMI Training Hub / VA Training Center)
    │       ├── Admin → Trainers → Students
    │       ├── Office Admin → Inventory → Procurement → Logistics → Budget
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

## Office Admin Request Workflow

```
Request submitted (Supplies / Repair / IT / Facilities / Other)
        │
        ▼
Admin reviews → Reject (with reason) ──▸ Closed
        │
        ▼ Approve
Request moves to Approved queue
        │
        ▼
Admin fulfills → Mark Complete (with completion note)
        │
        ▼
Completed
```

---

## User Roles

| Role | Portal | Description |
|------|--------|-------------|
| **Student** | `/student` | Enrolled learners accessing courses and AI tools |
| **Admin** | `/admin` | Full platform management including accounting and office operations |
| **Trainer** | `/trainer` | Course delivery and student evaluation |
| **Corporate** | `/corporate` | White-label client with page builder and team training |
| **Employer** | `/employer-dashboard` | Job posting and applicant management |
| **Humi Admin** | `/humi-admin` | Platform-level content and tenant support |
| **Superadmin** | `/superadmin` | Multi-tenant SaaS management |

---

## Database Models (137+)

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
| **Office Admin — Inventory** | InventoryCategory, InventoryItem, StockMovement, InventoryAuditLog, AdminStockItem, AdminMaintenanceItem |
| **Office Admin — Operations** | AdminProcurementItem, AdminAsset, AdminSupplier, AdminEquipment, AdminRepairLog |
| **Office Admin — Logistics** | AdminVehicle, AdminDelivery, AdminFuelLog, AdminCarMaintenance, AdminVehicleLog |
| **Office Admin — Requests** | AdminOfficeRequest |
| **Office Admin — Budget** | AdminBudgetCategory, AdminBudgetEntry |
| **SaaS** | Subscription, Tier, Module, FeatureFlag |

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
npx prisma migrate deploy
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

---

## Security

- JWT-based sessions with 8-hour expiry
- bcrypt password hashing
- Role-based access control (7 roles)
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

