<!-- BEGIN:nextjs-agent-rules -->

Build the frontend for my existing Thai General Worker backend API.

First inspect the frontend project and follow its existing conventions. Do not modify the backend. Where this prompt specifies the stack and structure below, follow it. Connect to the API using NEXT_PUBLIC_API_URL (do not hardcode URLs or secrets). The API routes below already include the `/api` prefix.

=====================================
TECH STACK
=====================================
- Next.js (App Router) + TypeScript
- UI: shadcn/ui (Tailwind) with a polished, modern, professional design
- Forms: React Hook Form + Zod (via @hookform/resolvers) using shadcn <Form> components
- Global state: Zustand (auth store)
- Icons: lucide-react only
- HTTP: Axios (single configured instance with interceptors)
- Data fetching: SWR (reads/lists); direct service calls for mutations, then SWR mutate() to revalidate
- Toasts: shadcn Sonner/Toast for success and error feedback

=====================================
FOLDER STRUCTURE
=====================================
src/
  app/
    (public)/
      layout.tsx                    // public navbar + footer (no sidebar)
      page.tsx                      // landing page at "/"
    (auth)/login/page.tsx
    (dashboard)/layout.tsx          // sidebar + topbar shell
    (dashboard)/dashboard/page.tsx  // role-based dashboard
    (dashboard)/workers/...
    (dashboard)/users/...  companies/...  managers/...  years/...  (admin only)
  middleware.ts                      // route protection
  components/
    ui/                              // shadcn primitives only
    shared/                          // DataTable, Pagination, SearchInput, ConfirmDialog, EmptyState, PageHeader, StatCard, etc.
    layout/                          // Sidebar, MobileSidebar (Sheet), Topbar, UserMenu
  modules/
    landing/
      components/                    // PublicNavbar, Hero, About, Features, HowItWorks, Roles, Contact, Footer
      constants.ts                   // all landing copy in one editable file
    auth/
      components/                    // auth-related UI ONLY (LoginForm, etc.)
      hooks/                         // use-login-form.ts: React Hook Form setup + calls services/auth
      schemas/                       // zod schemas
    worker/ user/ company/ manager/ year/ document/
      components/ hooks/ schemas/    // same pattern per module
  services/                          // backend service layer (no UI)
    auth.ts  user.ts  worker.ts  company.ts  manager.ts  year.ts  document.ts
  lib/
    axios.ts                         // axios instance + interceptors
    utils.ts                         // shadcn cn()
  utils/
    format.ts                        // reusable formatters: formatDate, formatDateTime, formatCurrency (THB), toApiDate (YYYY-MM-DD), Thailand timezone helpers
    constants.ts                     // roles, routes, nav config
  store/
    auth-store.ts                    // zustand
  types/                             // API request/response types

Rules:
- Components never call axios directly. Flow: component -> module hook -> service -> axios instance.
- Each module's hook owns the form logic (useForm, schema, submit handler that calls the service, toasts, error mapping). The form component only renders using the hook.
- Pages stay thin; they compose module components.
- SWR hooks (e.g. useWorkers, useWorker, useDashboardSummary) live in each module's hooks folder and call the services as fetchers.

=====================================
PUBLIC LANDING PAGE (before login)
=====================================
Create a public, unauthenticated landing page at "/" that introduces the Thai General Worker project. It must not call any protected API endpoint.

Sections:
1. Public navbar: logo/project name, anchor links (About, Features, How it works, Contact), a "Login" button (or "Go to Dashboard" if already authenticated, read from the auth store), and a mobile hamburger menu (Sheet).
2. Hero: headline and subheading explaining that this is a system for managing general workers in Thailand (work permits, passports, visa dates, report deadlines, payments, and documents), with a primary "Login" CTA and a secondary "Learn more" anchor.
3. About the project: short description of the problem it solves and who uses it.
4. Features (lucide icons, card grid): worker records, work permit and passport tracking, report-deadline reminders, payment and deposit tracking, document upload and storage, role-based access.
5. How it works: 3 or 4 steps (admin registers workers, documents are uploaded, managers track their workers, reminders are sent before report deadlines).
6. Roles: three cards for Admin, Manager, and General Worker describing what each can do.
7. Contact / footer: placeholder contact details, copyright, and a login link.

Landing rules:
- Do not invent statistics, customer counts, testimonials, or company claims. Use clearly marked placeholder text in a single constants file (modules/landing/constants.ts) so I can edit the copy easily.
- Fully responsive on desktop and mobile, with smooth scroll to anchors.
- Same design system as the dashboard (shadcn, Tailwind, lucide-react), light/dark mode supported, polished and not generic.
- Add SEO metadata (title, description, Open Graph) via the Next.js metadata API.
- Accessible: semantic landmarks, keyboard navigation, visible focus states, alt text.
- Server component by default; use client components only for interactive parts (mobile menu, auth-aware button).

=====================================
AUTHENTICATION & TOKEN HANDLING
=====================================
- Login: POST /api/auth/login  Body: { email, password }
  Response includes accessToken, refreshToken, and user { id, fullName, email, role, imageUrl }.
- On login success, save user + tokens to the Zustand auth store (persisted) and write the tokens to cookies so middleware.ts can read them. Choose the most secure approach that works with middleware (e.g., cookies set via js-cookie or a Next route handler, SameSite=Lax, Secure in production) and tell me the trade-off you chose.
- Axios interceptors (lib/axios.ts):
  - Request: attach `Authorization: Bearer <accessToken>`.
  - Response: on 401, call POST /api/auth/refresh-token using the refresh token as a Bearer token, then retry the original request once.
  - Queue concurrent requests during a refresh so only one refresh call is made.
  - If refresh fails: clear the store and cookies, redirect to /login, and show a "session expired" toast.
- Access tokens expire after 15 minutes.
- Logout: POST /api/auth/logout with the access token, then clear store, cookies, and SWR cache, and redirect to /login.
- middleware.ts:
  - Public routes (no token needed): "/" and any other (public) pages. Static assets and /api routes must be excluded via the matcher.
  - Protected routes: /dashboard and all dashboard sub-routes (workers, users, companies, managers, years). Without a valid token cookie, redirect to /login.
  - Redirect an authenticated user away from /login to /dashboard.
  - On "/", an authenticated user still sees the landing page, but the navbar button changes from "Login" to "Go to Dashboard".
  - Optionally decode the role from the token/cookie to block admin-only routes; the API remains the real authority.
- Roles: ADMIN, MANAGER, GENERAL_WORKER. Build role-based sidebar navigation and hide actions the user cannot perform.

=====================================
DASHBOARD LAYOUT (sidebar)
=====================================
- Sidebar-based dashboard shell using shadcn components (Sidebar or Sheet), lucide icons for each nav item.
- ADMIN: desktop-focused experience. Full sidebar; the layout must remain usable but is optimized for large screens.
- MANAGER and GENERAL_WORKER: must be fully responsive on desktop AND mobile. On mobile, use a collapsible Sheet sidebar with a hamburger trigger, a stacked card layout instead of wide tables where needed, and touch-friendly controls.
- Topbar with user avatar (imageUrl), name, role badge, and a logout menu.
- Support light/dark mode if it fits the existing setup.

=====================================
DASHBOARD DATA
=====================================
- GET /api/worker/financial-summary (ADMIN and MANAGER)
  Use workerCount, total, deposit, and balance for stat cards and a chart (use shadcn charts / Recharts). Admin sees all workers; a manager sees only their own.
- GET /api/worker/report-notifications (ADMIN only)
  Show the returned workers in a notification section. The backend returns workers whose reportDate is exactly 7 days from today in Thailand time. Do not calculate a different reminder schedule in the frontend.

=====================================
WORKERS
=====================================
- GET /api/worker?page=1&per_page=10&search=...&sort_by=createdAt&sort_order=desc
  ADMIN sees all; MANAGER sees only assigned workers. Render a paginated table with search/sort controls.
- GET /api/worker/:id
- POST /api/worker (ADMIN only; multipart/form-data if uploading `image`)
- PATCH /api/worker/:id (ADMIN only; multipart/form-data if uploading `image`)
- DELETE /api/worker/:id (ADMIN only)
- Fields: userId, managerId, yearId, companyId, passportNumber, workPermitNumber, ciNumber, typeOfBook, gender, phone, total, deposit, renewalDecision, workPermitVisaDate, reportDate, image.
- Money: show total price, deposit paid, and remaining balance. The backend calculates balance (total minus deposit) and rejects a deposit above total. Do NOT calculate and submit a balance. Validate deposit <= total client-side only as a UX hint.
- Dates are sent as YYYY-MM-DD (use utils/format.ts). workPermitVisaDate is the passport visa-stamp date; reportDate is the report deadline.
- Form selects for userId, managerId, yearId, companyId should load options from their list endpoints.

=====================================
OTHER ADMIN RESOURCES (ADMIN only)
=====================================
- Users: /api/user, /api/user/:id (GET/PATCH/DELETE), POST /api/user
- Companies: /api/company, /api/company/:id, POST /api/company
- Managers: /api/manager, /api/manager/:id, POST /api/manager
- Years: /api/year, /api/year/:id, POST /api/year
- Lists use the pagination response { data, links, meta } and support page, per_page (max 100), search, sort_by, sort_order.
- Build one reusable DataTable + Pagination + SearchInput and reuse it across all resources.

=====================================
DOCUMENTS
=====================================
- Upload: POST /api/documents/upload, multipart/form-data with files, documentTypes, workerId (ADMIN only). Up to 10 files; PDF, JPEG, PNG, WebP only. Validate type and count client-side.
- List: GET /api/documents/worker/:workerId
- Download URL: GET /api/documents/:id/download
- Delete: DELETE /api/documents/:id (ADMIN only)
- Show documents in the worker detail page with a drag-and-drop upload area, file previews, and per-file type selection.

=====================================
UI / UX REQUIREMENTS
=====================================
- Outstanding, polished UI: consistent spacing and typography, subtle shadows and borders, smooth transitions, skeleton loaders, meaningful empty states with icons, clear visual hierarchy, status badges, and accessible focus states. Avoid a generic template look.
- Include loading, empty, validation, and API-error states everywhere.
- Toast feedback for create, update, delete, upload, and login.
- Server-side pagination and search. Debounce the search input (~400ms) rather than calling the API on every keystroke, and keep search/page in the URL query string.
- Confirmation dialog (shadcn AlertDialog) before destructive actions.
- Show server validation errors on the matching form fields when the API returns them.

=====================================
API RULES
=====================================
- Use the API's actual response shapes. If a response shape is unclear, inspect the backend response or report the uncertainty instead of inventing fields.
- Add typed request/response models in /types.
- Do not hardcode secrets or production API URLs; provide a .env.example.

=====================================
FINISH
=====================================
After implementing, run the existing lint, type-check, and tests, fix any failures, and summarize: the public landing page sections and routes, pages/components created, the services and API routes connected, how auth/token storage works, and any assumptions or uncertainties.

<!-- END:nextjs-agent-rules -->
