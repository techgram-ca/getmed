<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# GetMed — Complete Codebase Reference

This document is the authoritative AI-agent reference for the GetMed codebase. Every section is exhaustive by design. Do not summarise or skip sections when reading this as context.

---

## 1. Project Overview

### What the App Does

GetMed is a Canadian pharmacy-delivery platform that connects patients with local pharmacies and delivery drivers. Patients can:

- Search for nearby pharmacies by address.
- Submit prescription orders, prescription-transfer requests, or OTC orders directly to a pharmacy's landing page.
- Book consultations with pharmacists.

Pharmacies can:
- Register on the platform (pending admin approval).
- Manage incoming orders through a dashboard (change status, assign notes, create manual orders).
- Customise their public-facing landing page (hero image, about section, stats).
- Manage a pharmacist profile for consultation bookings.

Drivers can:
- Register as a delivery driver (pending admin approval).
- View assigned orders, mark them dispatched, and submit proof of delivery (photo + signature).

Admins can:
- Review and approve/reject/suspend pharmacy and driver applications.
- Assign drivers to orders.
- Configure platform-wide settings: search radius, SMS on/off, SMS template bodies.
- View all orders and pharmacy/driver data.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Radix UI (`@radix-ui/react-slot`), Lucide React icons |
| Database + Auth | Supabase (PostgreSQL + GoTrue auth + Storage) |
| Supabase client | `@supabase/ssr` 0.10.2 |
| SMS | Twilio SDK 6.x |
| Maps | Google Maps JavaScript API (Places Autocomplete) |
| Styling utilities | `clsx`, `tailwind-merge`, `class-variance-authority` |
| Email | None currently wired (Resend is not present in the codebase) |
| Hosting | Not explicitly set — standard Next.js deployment (Vercel assumed) |

### Environment Branches

No explicit branching strategy is documented in the repo. Development branch is `claude/dreamy-brahmagupta-fn67hz`. Main production branch is assumed to be `main`.

---

## 2. Architecture

### Folder Structure

```
getmed/
├── next.config.ts              # Next.js config: 10 MB server action body limit
├── postcss.config.mjs          # PostCSS: Tailwind plugin
├── eslint.config.mjs           # ESLint: Next.js core-web-vitals + TS rules
├── tsconfig.json               # TS config: path alias @/* → ./src/*
├── package.json                # Dependencies (see Section 1)
├── CLAUDE.md                   # References AGENTS.md
├── AGENTS.md                   # This file
├── supabase/
│   └── schema.sql              # Full DB schema + migrations (append-only)
└── src/
    ├── app/                    # Next.js App Router: all routes
    │   ├── layout.tsx          # Root layout: Inter font, metadata, flex shell
    │   ├── globals.css         # Tailwind import + CSS custom properties + keyframes
    │   ├── (getmed)/           # Route group — public patient-facing pages
    │   │   ├── layout.tsx      # Injects GoogleMapsScript for all public pages
    │   │   ├── page.tsx        # Home page
    │   │   ├── search/         # Pharmacy search results
    │   │   ├── consult/        # Consultation landing + nearby pharmacists
    │   │   ├── about/
    │   │   ├── faq/
    │   │   ├── privacy/
    │   │   ├── terms/
    │   │   └── support/
    │   ├── order/              # Public take-order pages
    │   │   └── [slug]/         # Pharmacy take-order page (prescription/transfer/OTC forms + actions.ts)
    │   ├── pharmacy/           # Pharmacy portal
    │   │   ├── login/
    │   │   ├── signup/
    │   │   ├── get-started/
    │   │   ├── [slug]/         # Public pharmacy landing page (hero, about, services)
    │   │   └── dashboard/      # Pharmacy dashboard (auth-protected)
    │   │       ├── page.tsx    # Overview / stats
    │   │       ├── actions.ts  # Logout
    │   │       ├── orders/     # Order list, detail, new manual order
    │   │       ├── patients/   # Patient consultation list
    │   │       ├── consultations/
    │   │       └── settings/   # Profile, pharmacist, landing page, password
    │   ├── driver/             # Driver portal
    │   │   ├── login/
    │   │   ├── signup/
    │   │   ├── layout.tsx      # Driver shell: PWA viewport, DriverBottomNav
    │   │   └── dashboard/      # Driver dashboard (auth-protected)
    │   │       ├── page.tsx    # Assigned orders
    │   │       ├── actions.ts  # markDispatched, submitDeliveryProof
    │   │       ├── history/
    │   │       └── account/
    │   └── admin/              # Admin portal
    │       ├── page.tsx        # Redirect: admin → /admin/dashboard else /admin/login
    │       ├── login/
    │       └── dashboard/
    │           ├── page.tsx    # Admin overview stats
    │           ├── orders/     # All orders + driver assignment
    │           ├── pharmacies/ # Pharmacy applications + review
    │           ├── drivers/    # Driver applications + review
    │           └── settings/   # SMS, radius, templates, password
    ├── components/
    │   ├── ui/                 # Shared primitive UI components
    │   ├── getmed/             # Public/patient-facing components
    │   ├── pharmacy/           # Pharmacy portal components
    │   ├── driver/             # Driver portal components
    │   ├── admin/              # Admin portal components
    │   └── shared/             # Cross-portal components
    └── lib/
        ├── utils.ts            # cn() utility
        ├── twilio.ts           # SMS service + templates
        └── supabase/
            ├── client.ts       # Browser Supabase client (SSR)
            ├── server.ts       # Server Supabase client (cookie-based)
            └── admin.ts        # Service-role admin client (server-only)
```

### How the App is Organised

**Pages** live in `src/app/` using Next.js 15+ App Router conventions. Route groups `(getmed)` avoid adding a URL segment while sharing a layout. Every protected page relies on server-side session checks inside the page component or its server actions — there is no middleware file (no `src/middleware.ts`).

**Components** are co-located by portal. Patient-facing components are in `components/getmed/`, pharmacy portal in `components/pharmacy/`, driver in `components/driver/`, admin in `components/admin/`. Shared primitives (Button, Input, Textarea) live in `components/ui/`.

**Server Actions** are the sole API mechanism. There are no API route handlers (`route.ts`). Every mutation goes through `actions.ts` files with `"use server"` directive. Actions are called from client components via `useActionState` (React 19) or direct invocation.

**Library** code in `src/lib/` handles cross-cutting concerns: Supabase clients, Twilio SMS, CSS utilities.

---

## 3. Database Schema

All schema lives in `supabase/schema.sql`. The file is append-only: the top section is the original schema, followed by commented-out or runnable migration blocks. The effective live schema is the union of all un-commented statements.

### Enums

```sql
CREATE TYPE pharmacy_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE driver_status   AS ENUM ('pending', 'approved', 'rejected', 'suspended');
```

### Table: `public.pharmacies`

Primary table for pharmacy accounts.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, UNIQUE |
| `email` | `text` | Contact email |
| `contact_name` | `text` | NOT NULL |
| `phone` | `text` | NOT NULL |
| `legal_name` | `text` | NOT NULL |
| `display_name` | `text` | NOT NULL |
| `logo_url` | `text` | Public URL from `pharmacy-logos` bucket |
| `url_slug` | `text` | UNIQUE; auto-generated from `display_name + city` |
| `full_address` | `text` | NOT NULL |
| `unit` | `text` | nullable |
| `city` | `text` | NOT NULL |
| `province` | `text` | NOT NULL |
| `postal_code` | `text` | NOT NULL |
| `lat` | `double precision` | nullable; geocoded lat |
| `lng` | `double precision` | nullable; geocoded lng |
| `license_number` | `text` | NOT NULL |
| `license_url` | `text` | Storage path in `pharmacy-licenses` bucket (private) |
| `opening_hours` | `jsonb` | Default `{}`. Shape: `{ "Monday": { "open": true, "openTime": "09:00", "closeTime": "18:00" }, ... }` |
| `payment_methods` | `text[]` | Default `{}` |
| `service_online_orders` | `boolean` | Default `false` |
| `service_delivery` | `boolean` | Default `false` |
| `service_consultation` | `boolean` | Default `false` |
| `hero_image_url` | `text` | Public URL from `pharmacy-hero-images` bucket |
| `hero_title` | `text` | Defaults to `display_name` in UI when null |
| `hero_subtitle` | `text` | nullable |
| `about_heading` | `text` | nullable |
| `about_description` | `text` | nullable |
| `landing_stats` | `jsonb` | Default `[]`. Shape: `[{ "value": "15+", "label": "Years serving" }]` |
| `price_list` | `jsonb` | Default `[]`. Dynamic service price list shown on the public landing page. Shape: `[{ "name": "Flu Shot", "price": "25", "description": "..." }]`. Captured during signup. |
| `status` | `pharmacy_status` | Default `pending` |
| `rejection_reason` | `text` | nullable |
| `reviewed_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

**Indexes:** `user_id`, `status`, `(city, province)`, `url_slug`

### Table: `public.pharmacist_profiles`

One-to-one extension of a pharmacy for consultation-enabled pharmacies.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `pharmacy_id` | `uuid` | FK → `pharmacies(id)` ON DELETE CASCADE, UNIQUE |
| `full_name` | `text` | NOT NULL |
| `photo_url` | `text` | Public URL from `pharmacist-photos` bucket |
| `qualification` | `text` | NOT NULL |
| `license_number` | `text` | NOT NULL |
| `years_of_experience` | `integer` | CHECK 0–100 |
| `specialization` | `text[]` | Default `{}` |
| `languages` | `text[]` | Default `{}` |
| `bio` | `text` | nullable |
| `availability_hours` | `jsonb` | Same shape as `opening_hours` |
| `consultation_modes` | `text[]` | Values: `chat`, `phone`, `video` |
| `consultation_fee` | `numeric(10,2)` | CHECK >= 0 |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

**Index:** `pharmacy_id`

### Table: `public.orders`

All patient orders, regardless of type.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `pharmacy_id` | `uuid` | FK → `pharmacies(id)` ON DELETE CASCADE, NOT NULL |
| `order_type` | `text` | CHECK: `prescription`, `transfer`, `otc`, `manual` |
| `patient_name` | `text` | NOT NULL |
| `patient_phone` | `text` | NOT NULL |
| `patient_email` | `text` | nullable |
| `delivery_type` | `text` | CHECK: `pickup`, `delivery` |
| `address` | `text` | nullable; required when `delivery_type = delivery` |
| `details` | `jsonb` | Order-type specific fields (see below) |
| `file_urls` | `text[]` | Storage paths in `prescription-uploads` bucket |
| `status` | `text` | CHECK: `new`, `processing`, `ready`, `dispatched`, `completed`, `cancelled`, `delivery_failed`. Default `new` |
| `assigned_driver_id` | `uuid` | FK → `drivers(id)` ON DELETE SET NULL; nullable |
| `order_source` | `text` | CHECK: `online`, `manual`. Default `online` |
| `delivery_proof` | `jsonb` | nullable. Shape: `{ outcome, note, photo_path, signature_path, captured_at }` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

**`details` JSONB shapes by order type:**

- `prescription`: `{ healthCardNumber, deliveryInstructions, consent, prescriptionFilePaths[], insuranceFilePaths[] }`
- `transfer`: `{ currentPharmacyName, currentPharmacyPhone, rxNumber, medicationName, doctorName, healthCardNumber, consent, notes, prescriptionFilePaths[], insuranceFilePaths[] }`
- `otc`: `{ productName, quantity, brandPreference, symptoms, notes }`
- `manual`: free-form JSON set by pharmacy staff

**Indexes:** `pharmacy_id`, `status`, `created_at DESC`, `assigned_driver_id`

### Table: `public.consultations`

Consultation requests sent to a pharmacy.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `pharmacy_id` | `uuid` | FK → `pharmacies(id)` ON DELETE CASCADE, NOT NULL |
| `patient_name` | `text` | NOT NULL |
| `patient_phone` | `text` | NOT NULL |
| `patient_email` | `text` | nullable |
| `condition` | `text` | nullable |
| `notes` | `text` | nullable |
| `status` | `text` | CHECK: `pending`, `in_progress`, `completed`, `cancelled`. Default `pending` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

**Indexes:** `pharmacy_id`, `status`, `created_at DESC`

### Table: `public.drivers`

Driver account registry.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, UNIQUE |
| `email` | `text` | nullable |
| `full_name` | `text` | NOT NULL |
| `phone` | `text` | NOT NULL |
| `photo_url` | `text` | Public URL from `driver-photos` bucket |
| `url_slug` | `text` | UNIQUE |
| `city` | `text` | NOT NULL |
| `province` | `text` | NOT NULL |
| `postal_code` | `text` | NOT NULL |
| `vehicle_type` | `text` | nullable |
| `vehicle_make` | `text` | nullable |
| `vehicle_model` | `text` | nullable |
| `vehicle_year` | `integer` | nullable |
| `vehicle_plate` | `text` | nullable |
| `license_number` | `text` | NOT NULL |
| `license_expiry` | `date` | nullable |
| `license_province` | `text` | nullable |
| `license_url` | `text` | Storage path in `driver-licenses` (private); use signed URL to retrieve |
| `status` | `driver_status` | Default `pending` |
| `rejection_reason` | `text` | nullable |
| `reviewed_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

**Indexes:** `user_id`, `status`, `(city, province)`, `url_slug`

### Table: `public.app_settings`

Admin-managed key-value config store.

| Column | Type | Notes |
|---|---|---|
| `key` | `text` | PK |
| `value` | `text` | NOT NULL |
| `updated_at` | `timestamptz` | Default `now()` |

**Seeded keys:**
- `search_radius_km` → `"10"` (default)
- `sms_enabled` → `"false"` (default)
- `sms_tpl_<templateKey>` → custom SMS body (created on override; deleted on reset)

### Triggers

A shared `set_updated_at()` PL/pgSQL function fires `BEFORE UPDATE` on every table to set `updated_at = now()`. Triggers are named `<table>_set_updated_at`.

### RLS Policies

**`pharmacies`**
- `pharmacy_owner_select`: authenticated users can SELECT their own row (`auth.uid() = user_id`)
- `pharmacy_owner_insert`: authenticated users can INSERT their own row
- `pharmacy_owner_update`: authenticated users can UPDATE their own row
- No public/anon read policy — admin uses service role; public search uses service role in server component

**`pharmacist_profiles`**
- `pharmacist_owner_select/insert/update`: authenticated users can access only the profile belonging to their pharmacy (via a sub-select on `pharmacies.user_id = auth.uid()`)

**`orders`**
- `orders_pharmacy_select`: pharmacy owner can read orders for their pharmacy
- `orders_pharmacy_update`: pharmacy owner can update orders for their pharmacy
- `driver_assigned_orders_select`: driver can read orders assigned to them (via sub-select on `drivers.user_id`)
- `driver_assigned_orders_update`: driver can update orders assigned to them
- No patient/public insert policy — inserts done via admin (service-role) client in `submitOrderAction`

**`consultations`**
- `consultations_pharmacy_select`: pharmacy owner can read their consultations
- `consultations_pharmacy_update`: pharmacy owner can update their consultations

**`app_settings`**
- `settings_public_read`: anon and authenticated users can read all settings (required for public search page to read `search_radius_km`)

### Storage Buckets

| Bucket | Public | Size Limit | MIME Types |
|---|---|---|---|
| `pharmacy-logos` | ✅ public | 5 MB | jpeg, jpg, png, webp |
| `pharmacy-licenses` | ❌ private | 10 MB | pdf, jpeg, jpg, png, webp |
| `pharmacist-photos` | ✅ public | 5 MB | jpeg, jpg, png, webp |
| `prescription-uploads` | ❌ private | 20 MB | jpeg, jpg, png, webp, pdf |
| `pharmacy-hero-images` | ✅ public | 10 MB | jpeg, jpg, png, webp |
| `driver-photos` | ✅ public | 5 MB | jpeg, jpg, png, webp |
| `driver-licenses` | ❌ private | 10 MB | pdf, jpeg, jpg, png, webp |
| `delivery-proofs` | ❌ private | 20 MB | jpeg, jpg, png, webp |

**Storage RLS summary:**
- Public buckets: `public` role can SELECT; authenticated owner (first path segment = `auth.uid()`) can INSERT.
- Private buckets: owner can INSERT/SELECT their own objects. `prescription-uploads` allows pharmacy owners to SELECT files uploaded for their pharmacy (path segment[1] = pharmacy ID). `delivery-proofs` has no explicit RLS policy — accessed only via admin client.

---

## 4. User Roles & Permissions

Roles are stored in Supabase Auth's `app_metadata.role` field. This is set server-side during user creation and cannot be modified by users. Possible values: `pharmacy`, `driver`, `admin`. Regular patients do not have an auth account; they interact anonymously via public forms.

### Public (Unauthenticated) Patients

**Can do:**
- View home page, about, FAQ, privacy, terms, support pages
- Search for pharmacies by address
- View any approved pharmacy's public landing page
- Submit prescription / transfer / OTC orders to a pharmacy
- Browse and request consultations with pharmacists

**Routes:**
- `/(getmed)/*` — all public pages
- `/pharmacy/get-started` — pharmacy sign-up landing
- `/pharmacy/signup` — pharmacy registration form
- `/driver/signup` — driver registration form

**No auth required.** Order submission uses the admin (service-role) Supabase client server-side so unauthenticated patients can write to `orders`.

### Pharmacies (`app_metadata.role = "pharmacy"`)

**Can do:**
- Log in at `/pharmacy/login`
- View their dashboard at `/pharmacy/dashboard`
- View, filter, search orders for their pharmacy
- Update order status (with valid transitions — see Section 10)
- Create manual orders
- View consultation requests
- View patient list
- Edit pharmacy profile (name, address, phone, hours)
- Edit pharmacist profile
- Edit landing page customisation (hero, about, stats)
- Change password

**Auth guard:** Login action checks `pharmacy.status === "approved"` before allowing access. Rejected and suspended pharmacies cannot log in. Pending pharmacies get an informational message.

**Data access:** RLS policies restrict all DB reads/writes to their own `pharmacy_id`. The `pharmacy_id` is always derived server-side from the authenticated `user_id`.

### Drivers (`app_metadata.role = "driver"`)

**Can do:**
- Log in at `/driver/login`
- View their dashboard at `/driver/dashboard`
- See orders assigned to them with status `ready` or `dispatched`
- Mark orders as dispatched (batch action)
- Submit delivery proof (photo + signature for success; note for failure)
- View delivery history (completed + delivery_failed)
- Edit account profile and password

**Auth guard:** Login action checks `driver.status === "approved"`. Rejected and suspended drivers cannot log in.

**Data access:** RLS `driver_assigned_orders_*` policies — drivers can only read/update orders where `assigned_driver_id` matches their `drivers.id`.

### Admins (`app_metadata.role = "admin"`)

**Can do:**
- Log in at `/admin/login`
- View platform stats at `/admin/dashboard`
- View and filter all orders
- Assign/unassign a driver to any order
- View all pharmacy applications; approve or reject with reason
- View all driver applications; approve, reject, suspend, or reactivate
- View SMS status (enabled/disabled)
- Toggle SMS on/off globally
- Edit any of the 18 SMS templates
- Reset any SMS template to default
- Set search radius (5–50 km, or any integer 1–100 via action)
- Change admin password

**Auth guard:** All admin server actions call `assertAdmin()` which checks `user?.app_metadata?.role !== "admin"` and redirects to `/admin/login` if not. The admin list page (`/admin/page.tsx`) also redirects based on role. **There is no middleware** — every page must enforce this at the server component or action level.

**Data access:** Uses `createAdminClient()` (service-role key) so no RLS restrictions apply.

### How Auth is Handled

- **Session storage:** Supabase SSR with cookie-based sessions. `createClient()` (server) reads/writes session cookies on every request.
- **No middleware.ts:** There is no Next.js middleware for route protection. Each page component or action performs its own auth check.
- **Login flow:** `signInWithPassword` → check role/status → redirect to dashboard or return error.
- **Logout:** `signOut()` then redirect to login page.
- **Token refresh:** Handled automatically by `@supabase/ssr` on each server-side client creation.

---

## 5. API Routes

**There are no API route handlers in this project.** All data mutations are done via Next.js Server Actions (files named `actions.ts` with `"use server"`). All data reads are done inside Server Components using Supabase directly.

### Server Actions Inventory

#### Patient / Public

**`src/app/order/[slug]/actions.ts`**
- `submitOrderAction(fd: FormData)` — Creates an order for a pharmacy. Uploads prescription/insurance files to `prescription-uploads`. Sends SMS to patient + pharmacy. Called from `PrescriptionForm`, `TransferForm`, `OTCForm`.

**`src/app/(getmed)/consult/actions.ts`**
- (Consult booking action — inserts into `consultations` table)

#### Pharmacy

**`src/app/pharmacy/login/actions.ts`**
- `loginAction(_prev, fd)` — Signs in pharmacy user, checks `status === approved`, redirects to `/pharmacy/dashboard`.

**`src/app/pharmacy/signup/actions.ts`**
- `pharmacySignupAction(fd)` — Creates auth user (role=pharmacy), uploads logo + hero image + license, inserts `pharmacies` row (including the `price_list` JSON captured from the signup form), optionally inserts `pharmacist_profiles` row, sends SMS to pharmacy contact + admin.

**`src/app/pharmacy/dashboard/actions.ts`**
- `logoutAction()` — Signs out and redirects to `/pharmacy/login`.

**`src/app/pharmacy/dashboard/orders/actions.ts`**
- `updateOrderStatusAction(orderId, newStatus)` — Validates transition via `TRANSITIONS` map, updates order status, sends SMS to patient.

  Status transition map:
  ```
  new        → [processing, cancelled]
  processing → [ready, cancelled]
  cancelled  → [processing]
  ready      → [cancelled]
  dispatched → [] (no transitions allowed from pharmacy)
  completed  → [] (terminal)
  delivery_failed → [] (terminal)
  ```

**`src/app/pharmacy/dashboard/orders/new/actions.ts`**
- `createManualOrderAction(fd)` — Creates a manual order (`order_source = manual`, `order_type = manual`).

**`src/app/pharmacy/dashboard/settings/actions.ts`**
- `updatePharmacyDetailsAction(fd)` — Updates pharmacy contact info, address, hours.
- `updatePharmacistDetailsAction(fd)` — Updates pharmacist profile.
- `updateLandingPageAction(fd)` — Updates hero, about, stats; handles hero image upload.
- `changePasswordAction(fd)` — Updates pharmacy user password via Supabase.

#### Driver

**`src/app/driver/login/actions.ts`**
- `driverLoginAction(_prev, fd)` — Signs in driver user, checks `status === approved`, redirects to `/driver/dashboard`.

**`src/app/driver/signup/actions.ts`**
- `driverSignupAction(fd)` — Creates auth user (role=driver), uploads photo + license, inserts `drivers` row, sends SMS to driver + admin.

**`src/app/driver/dashboard/actions.ts`**
- `markDispatchedAction(orderIds[])` — Updates a batch of `ready` orders to `dispatched`. Only for orders assigned to the current driver.
- `submitDeliveryProofAction(orderId, formData)` — Validates order is `dispatched` and assigned to the driver. Uploads photo + signature to `delivery-proofs`. Sets `delivery_proof` JSONB and status to `completed` or `delivery_failed`.

**`src/app/driver/dashboard/account/actions.ts`**
- `updateDriverAccountAction(fd)` — Updates driver profile fields.
- `driverChangePasswordAction(fd)` — Updates driver password.

#### Admin

**`src/app/admin/login/actions.ts`**
- `adminLoginAction(_prev, fd)` — Signs in user, checks `app_metadata.role === admin`, redirects to `/admin/dashboard`.
- `adminLogoutAction()` — Signs out, redirects to `/admin/login`.

**`src/app/admin/dashboard/orders/actions.ts`**
- `assignDriverAction(orderId, driverId | null)` — Assigns or unassigns a driver to an order. Uses admin client. Requires admin role.

**`src/app/admin/dashboard/pharmacies/[id]/actions.ts`**
- `approvePharmacyAction(pharmacyId)` — Sets status to `approved`, sends SMS via `pharmacy_approved` template.
- `rejectPharmacyAction(pharmacyId, reason)` — Sets status to `rejected` + stores reason, sends SMS via `pharmacy_rejected` template.

**`src/app/admin/dashboard/drivers/[id]/actions.ts`**
- `approveDriverAction(driverId)` — Sets status to `approved`, sends SMS via `driver_approved`.
- `rejectDriverAction(driverId, reason)` — Sets status to `rejected`, sends SMS via `driver_rejected`.
- `suspendDriverAction(driverId)` — Sets status to `suspended`, sends SMS via `driver_suspended`.
- `reactivateDriverAction(driverId)` — Sets status to `approved`, sends SMS via `driver_reactivated`.

**`src/app/admin/dashboard/settings/actions.ts`**
- `adminChangePasswordAction(fd)` — Changes admin user password.
- `updateRadiusAction(fd)` — Upserts `search_radius_km` in `app_settings`. Redirects with `?flash=saved`.
- `toggleSmsAction(fd)` — Upserts `sms_enabled` in `app_settings`. Redirects with `?flash=saved#sms`.
- `updateSmsTemplateAction(fd)` — Upserts `sms_tpl_<templateKey>` in `app_settings`.
- `resetSmsTemplateAction(fd)` — Deletes `sms_tpl_<templateKey>` from `app_settings` (restores default).

---

## 6. Key Components

### UI Primitives (`src/components/ui/`)

**`button.tsx`**
- Exported: `Button`
- Built with `@radix-ui/react-slot` (supports `asChild` prop).
- Variants (via `class-variance-authority`): `default` (teal bg), `white` (white bg), `ghost` (transparent).
- Sizes: `default`, `sm`, `lg`.
- Props: all standard HTML button props + `variant`, `size`, `asChild`.

**`input.tsx`**
- Exported: `Input`
- Standard styled `<input>` with teal focus ring. Accepts all HTML input attributes.

**`textarea.tsx`**
- Exported: `Textarea`
- Standard styled `<textarea>` with resize disabled.

### Patient-Facing Components (`src/components/getmed/`)

**`Navbar.tsx`**
- Fixed top navigation with GetMed logo, desktop nav links (Order Prescription, Book Consultation, About, FAQs), mobile hamburger menu.
- No props; self-contained.

**`Hero.tsx`**
- Landing page hero with `AddressAutocomplete` for address entry, "Find Pharmacies" search button, testimonials strip, and hero image.
- On submit: navigates to `/search?address=...&lat=...&lng=...`.

**`AddressAutocomplete.tsx`**
- Google Places Autocomplete integration.
- Props: `value`, `onChange(val, coords?)`, `placeholder`, `className`.
- Uses `google.maps.places.AutocompleteSessionToken` for billing efficiency.
- Debounced predictions (300 ms). Keyboard navigation (↑↓Enter).
- On selection: calls `getDetails` to fetch `geometry.location` and calls `onChange` with `{ lat, lng }`.

**`GoogleMapsScript.tsx`**
- Client component that appends the Google Maps JS API script tag with `libraries=places`.
- Reads `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` env var.
- Rendered once in `(getmed)/layout.tsx`.

**`HowItWorks.tsx`** — Static 4-step explainer section. No props.

**`WhyChoose.tsx`** — Static feature highlights. No props.

**`CtaStrip.tsx`** — "Are you a pharmacy?" CTA band linking to `/pharmacy/get-started`. No props.

**`Footer.tsx`** — Footer with links to about, FAQ, privacy, terms, support. No props.

**`PharmacyCard.tsx`**
- Displays a single pharmacy in search results.
- Props: pharmacy object with `id`, `display_name`, `logo_url`, `full_address`, `city`, `province`, `opening_hours`, `service_*` flags, `url_slug`, `lat`, `lng`; plus `userLat`, `userLng` for distance calculation.
- Computes and displays distance using Haversine.
- Shows open/closed badge based on current day/time.
- Links to `/order/[url_slug]` (the take-order page) so patients can act immediately from search results.

**`PharmacyMap.tsx`**
- Google Maps display of pharmacies in search results.
- Props: `pharmacies[]`, `userLat`, `userLng`, `onMarkerClick(pharmacy)`.
- Uses `google.maps.Map` and `google.maps.marker.AdvancedMarkerElement`.

**`SearchResults.tsx`**
- Split-layout search results page: pharmacy list on left, map on right.
- Props: `pharmacies[]`, `userLat`, `userLng`, `address`.
- Manages selected pharmacy state; clicking list item or map marker highlights the card.

**`PharmacyPublicPage.tsx`**
- Full public landing page for a pharmacy, rendered at `/pharmacy/[slug]`.
- Props: `pharmacy` object (all public fields incl. `price_list`), `slug`, `consultationFee`.
- Layout: two-column hero (copy + CTAs left, image right) styled like the home page hero; falls back to `/images/pharmacy.png` when `hero_image_url` is null. Followed by an about/services/stats section, a dynamic **service price list widget** (rendered only when `price_list` has entries; numeric prices are auto-prefixed with `$`), a trust strip, and footer.
- Exactly **two CTAs**: "Order Prescription" → `/order/[slug]#prescription` and "Book Consultation" → `/consult/[slug]` (the consult CTA only shows when `service_consultation` is true). Both CTAs appear in the hero and again beneath the price list.

**`PharmacyLanding.tsx`**
- Take-order page for a pharmacy, rendered at `/order/[slug]`.
- Props: `pharmacy` object, `pharmacist` profile (nullable), `defaultAddress`.
- Renders: pharmacy header, opening hours, payment methods, and `OrderTabs` for prescription/transfer/OTC order submission.

**`OrderTabs.tsx`**
- Tab switcher between Prescription, Transfer, OTC forms.
- Props: `pharmacyId`, `pharmacyName`, `deliveryEnabled`.

**`PrescriptionForm.tsx`**
- Form for prescription orders.
- Props: `pharmacyId`, `pharmacyName`, `deliveryEnabled`.
- Fields: name, phone, email, delivery type, address, health card number, delivery instructions, prescription file upload (multiple), insurance file upload (multiple), consent checkbox.
- Submits via `submitOrderAction`.

**`TransferForm.tsx`**
- Form for transfer requests.
- Same base props as `PrescriptionForm`.
- Fields: name, phone, email, delivery type, address, current pharmacy name+phone, Rx number, medication name, doctor name, health card (optional), notes, file uploads, consent.
- Submits via `submitOrderAction`.

**`OTCForm.tsx`**
- Form for OTC orders.
- Same base props.
- Fields: name, phone, email, delivery type, address, product name, quantity, brand preference, symptoms, notes, file upload.
- Submits via `submitOrderAction`.

**`ConsultLanding.tsx`** — Static landing for consultations section. No props.

**`NearbyPharmacists.tsx`**
- Lists pharmacists available for consultation near a location.
- Props: `pharmacists[]` (pharmacy + pharmacist profile joined), `userLat`, `userLng`.

**`ConsultBookingLanding.tsx`**
- Consultation booking page for a specific pharmacist.
- Props: `pharmacy`, `pharmacist`.
- Submits via consult action to insert into `consultations`.

### Pharmacy Portal Components (`src/components/pharmacy/`)

**`LoginForm.tsx`**
- Email + password login form for pharmacy portal.
- Uses `useActionState` with `loginAction`.

**`SignupForm.tsx`**
- Multi-step signup form with these sections (in render order):
  1. `BasicInfo` — email, password, contact name, phone
  2. `PharmacyDetails` — legal name, display name, address, license number, opening hours, payment methods
  3. `LandingPage` — hero title/subtitle, about heading/description, stats, hero image upload
  4. `PriceList` — dynamic list of services with name + price + optional description (add/remove rows); persisted to `pharmacies.price_list`
  5. `Services` — online orders, delivery, consultation toggles
  6. `PharmacistDetails` — shown only if consultation enabled; full pharmacist profile
- File uploads: `LogoUpload`, `FileUpload` (license), `FileUpload` (hero image), `FileUpload` (pharmacist photo).
- Submits everything as `FormData` to `pharmacySignupAction`. The price list is sent as a JSON `priceList` field with blank rows stripped.

**`sections/PriceList.tsx`**
- Dynamic service-pricing editor used in `SignupForm`.
- Exports `PriceListValue` (`{ items: { name, price, description }[] }`) and `DEFAULT_PRICE_LIST`.
- Props: `value`, `onChange`, `step`. Supports adding/removing an arbitrary number of service rows.

**`OpeningHours.tsx`**
- Day-by-day hours editor (Mon–Sun).
- Props: `value: Record<string, {open, openTime, closeTime}>`, `onChange`.

**`PharmacyAddressField.tsx`**
- `AddressAutocomplete` wrapper that also parses the place result into city/province/postal code/lat/lng.
- Props: `onChange({ fullAddress, unit, city, province, postalCode, lat, lng })`.

**`FileUpload.tsx`**
- Generic drag-and-drop or click file upload with preview.
- Props: `label`, `accept`, `multiple`, `onChange`, `maxSize`.

**`LogoUpload.tsx`**
- Logo-specific file upload with circular preview.

**`CheckboxItem.tsx`**
- Labelled checkbox for service selection.

**`Sidebar.tsx`** (pharmacy dashboard)
- Navigation sidebar: Overview, Orders, Consultations, Patients, Settings, Logout.
- Highlights active route.

**`Overview.tsx`**
- Dashboard home with stats cards (total orders, new, processing, ready) and recent orders table.
- Props: `stats`, `recentOrders[]`, `pharmacyName`.

**`OrderStatusChanger.tsx`**
- Dropdown to change order status.
- Props: `orderId`, `currentStatus`, `deliveryType`.
- Renders only the valid next transitions based on `TRANSITIONS` map.
- Calls `updateOrderStatusAction` on change.

**`PharmacyDetailsForm.tsx`** — Edit contact info, address, opening hours. Submits via `updatePharmacyDetailsAction`.

**`PharmacistDetailsForm.tsx`** — Edit pharmacist profile fields. Submits via `updatePharmacistDetailsAction`.

**`LandingPageForm.tsx`** — Edit hero + about + stats + hero image. Submits via `updateLandingPageAction`.

**`PasswordChangeForm.tsx`** — Change pharmacy user password.

**`dashboard/orders/new/NewOrderForm.tsx`**
- Manual order creation form.
- Fields: patient name, phone, email, order type, delivery type, address, free-form details textarea.
- Submits via `createManualOrderAction`.

### Driver Components (`src/components/driver/`)

**`LoginForm.tsx`** — Email + password login with `driverLoginAction`.

**`SignupForm.tsx`**
- Multi-step driver signup:
  - Personal info: full name, phone, email, password, photo upload
  - Service area: city, province, postal code
  - Vehicle: type, make, model, year, plate
  - Driver's license: number, province, expiry date, license doc upload
  - Consent: background check consent, terms agreement
- Submits via `driverSignupAction`.

**`AssignedOrdersList.tsx`**
- Lists orders with status `ready` or `dispatched` assigned to the driver.
- Allows selecting multiple `ready` orders and marking them all dispatched.
- Shows `DeliveryProofModal` for `dispatched` orders.

**`DriverBottomNav.tsx`**
- Mobile-friendly bottom navigation: Dashboard, History, Account.
- Fixed at bottom; rendered in driver layout.

**`DeliveryProofModal.tsx`**
- Modal for submitting delivery outcome.
- On "delivered": captures photo upload + signature (canvas-based drawing).
- On "failed": text note required.
- Submits via `submitDeliveryProofAction`.

**`DriverHistory.tsx`**
- Historical completed and failed deliveries list.
- Props: `orders[]`.

**`DriverAccountForms.tsx`**
- Profile edit + password change forms for driver account page.

### Admin Components (`src/components/admin/`)

**`AdminLoginForm.tsx`**
- Dark-themed login form with shield icon.
- Uses `useActionState` with `adminLoginAction`.

**`AdminSidebar.tsx`**
- Navigation sidebar: Dashboard, Orders, Pharmacies, Drivers, Settings, Logout.
- Highlights active route.

**`AdminOrdersClient.tsx`**
- Client-side filtered orders table.
- Props: `orders[]`, `drivers[]`.
- Filters: status dropdown, search input (patient name / pharmacy name).
- Shows driver assignment dropdown per order; calls `assignDriverAction` on change.

**`ReviewActions.tsx`**
- Approve + reject buttons for a pharmacy review page.
- Reject opens a text field for rejection reason.
- Calls `approvePharmacyAction` / `rejectPharmacyAction`.

**`DriverReviewActions.tsx`**
- Approve, reject, suspend, reactivate buttons for a driver.
- Calls respective driver actions.

**`SmsTemplateEditor.tsx`**
- Text area for editing an SMS template body.
- Shows available variables.
- Save calls `updateSmsTemplateAction`; Reset calls `resetSmsTemplateAction`.
- Props: `templateKey`, `label`, `defaultBody`, `vars[]`, `currentBody`.

**`AdminPasswordChangeForm.tsx`** — Password change for admin user.

### Shared Components (`src/components/shared/`)

**`DeliveryProofSection.tsx`**
- Renders delivery proof data (outcome, note, photo, signature).
- Props: `proof: { outcome, note, photo_path, signature_path, captured_at }`, `supabaseUrl`.
- Generates signed URLs for private `delivery-proofs` bucket images.

**`RefreshButton.tsx`**
- Client component: a "Refresh" button that calls `router.refresh()`.
- Used on order detail pages to re-fetch server data.

---

## 7. State Management

This app has **no global state library** (no Zustand, Redux, Jotai, or Context providers). State is managed at three levels:

### Server State (Primary)
All data comes from Supabase fetched in Server Components on every page render. Next.js caches and revalidates via `revalidatePath()` called after mutations in Server Actions.

### Local React State
Client components use `useState` and `useReducer` for:
- Form field values (multi-step signup forms)
- UI state (modal open/close, active tab, selected items in lists)
- Address autocomplete predictions

### `useActionState` (React 19)
Used in login forms and some mutation forms to track the `{ error: string | null }` return value from Server Actions and display inline error messages.

### No Shared Client State
There are no React Context providers. Each portal (pharmacy, driver, admin) is entirely server-rendered except for interactive client components that manage their own local state.

---

## 8. Services & Integrations

### Supabase

**Purpose:** PostgreSQL database, Auth (GoTrue), and Storage.

**Clients:**
- `src/lib/supabase/client.ts` — `createBrowserClient(url, anonKey)` for client components (e.g., real-time, if ever used).
- `src/lib/supabase/server.ts` — `createServerClient(url, anonKey, cookieStore)` for Server Components and Actions. Reads/writes session cookies.
- `src/lib/supabase/admin.ts` — `createClient(url, serviceRoleKey)` with `autoRefreshToken: false, persistSession: false`. Used in all admin actions and anywhere unauthenticated writes are needed (order submission, signup).

**Auth approach:** Email + password via `signInWithPassword`. Roles are in `app_metadata` (server-set, tamper-proof). No OAuth, no magic links, no email verification in the flow (signup uses `email_confirm: true` so the user is immediately confirmed server-side by the admin client).

**Storage:** All file uploads go through the admin Supabase client (`admin.storage.from(...).upload(...)`).

### Twilio (SMS)

**File:** `src/lib/twilio.ts`

**Enable logic (dual switch):**
1. `ENABLE_SMS` env var must equal `"true"` (hard master switch).
2. `app_settings.sms_enabled` DB row must equal `"true"` (admin-toggleable).
Both must be true for any SMS to send.

**Templates:** 18 named templates stored in `SMS_TEMPLATES` constant. Each has:
- `label` — human-readable name shown in admin UI
- `body` — default message with `{{placeholder}}` variables
- `vars` — list of variable names

Admin can override any template body by upserting `sms_tpl_<key>` into `app_settings`. The `resolveBody()` function checks for a DB override before falling back to the hardcoded default.

**Template keys and triggers:**

| Key | Trigger |
|---|---|
| `order_patient` | Patient submits any order |
| `order_pharmacy` | Patient submits any order (sent to pharmacy) |
| `status_processing` | Pharmacy marks order processing |
| `status_ready_delivery` | Pharmacy marks order ready (delivery type) |
| `status_ready_pickup` | Pharmacy marks order ready (pickup type) |
| `status_completed` | Pharmacy marks order completed |
| `status_cancelled` | Pharmacy marks order cancelled |
| `pharmacy_signup` | Pharmacy submits signup form (sent to pharmacy) |
| `pharmacy_signup_admin` | Pharmacy submits signup form (sent to admin) |
| `pharmacy_approved` | Admin approves pharmacy |
| `pharmacy_rejected` | Admin rejects pharmacy |
| `driver_signup` | Driver submits signup (sent to driver) |
| `driver_signup_admin` | Driver submits signup (sent to admin) |
| `driver_approved` | Admin approves driver |
| `driver_rejected` | Admin rejects driver |
| `driver_suspended` | Admin suspends driver |
| `driver_reactivated` | Admin reactivates driver |

**Phone normalisation:** `normalizePhone()` strips non-digits. 10-digit → `+1XXXXXXXXXX`. 11-digit starting with 1 → `+1XXXXXXXXXX`. Other formats → skipped with a console warning.

**Admin phone:** The optional `ADMIN_PHONE_NUMBER` env var receives admin-alert SMS (pharmacy_signup_admin, driver_signup_admin).

### Google Maps

**Used for:**
- Address autocomplete on the home page hero (`AddressAutocomplete.tsx`)
- Pharmacy address field during signup (`PharmacyAddressField.tsx`)
- Map display in search results (`PharmacyMap.tsx`)

**Loading:** `GoogleMapsScript.tsx` injects the script asynchronously; loaded once in `(getmed)/layout.tsx`. Uses `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

**API features used:** `places` library (Autocomplete predictions, Place Details), `maps` (Map, AdvancedMarkerElement).

### Resend (Email)

**Not present.** There is no email integration in the codebase. The `resend` package is not in `package.json`. No emails are sent anywhere.

---

## 9. Auth Flow

### Pharmacy Auth Flow

1. Pharmacy fills `/pharmacy/signup` form.
2. `pharmacySignupAction` is called server-side:
   - Creates Supabase auth user with `app_metadata.role = "pharmacy"` and `email_confirm: true`.
   - Uploads files to storage.
   - Inserts `pharmacies` row with `status = pending`.
   - Sends SMS to pharmacy and admin.
3. Admin reviews at `/admin/dashboard/pharmacies/[id]` and approves/rejects.
   - On approve: `status → approved`, SMS sent.
   - On reject: `status → rejected` + reason stored, SMS sent.
4. Pharmacy visits `/pharmacy/login`, submits credentials.
5. `loginAction`:
   - `signInWithPassword`
   - Fetches `pharmacies` row by `user_id`.
   - If `status !== approved`: signs out + returns error message.
   - If `status === approved`: redirects to `/pharmacy/dashboard`.
6. Session persists via Supabase SSR cookies.
7. Logout: `logoutAction` calls `signOut()` + redirects to `/pharmacy/login`.

### Driver Auth Flow

Identical pattern to pharmacy:
1. Submit `/driver/signup` → `driverSignupAction` → `drivers` row created with `status = pending`.
2. Admin reviews at `/admin/dashboard/drivers/[id]`.
3. Login at `/driver/login` → `driverLoginAction` → check `status === approved` → redirect to `/driver/dashboard`.
4. Suspended drivers get a specific error message and cannot log in.

### Admin Auth Flow

1. Admin visits `/admin/login`.
2. `adminLoginAction`:
   - `signInWithPassword`
   - Checks `user.app_metadata.role === "admin"`.
   - If not admin: signs out + returns "Access denied" error.
   - If admin: redirects to `/admin/dashboard`.
3. Admin users must be created manually via Supabase Dashboard (or SQL) — no signup form exists.
4. Logout: `adminLogoutAction` → `signOut()` + redirect to `/admin/login`.

### Patient Auth Flow

Patients do **not** have accounts. All interactions are anonymous. Order submissions and consultation bookings use the admin Supabase client on the server so no session is required.

### Session Handling

- Sessions are stored in HTTP-only cookies managed by `@supabase/ssr`.
- The server client (`createClient()` in `src/lib/supabase/server.ts`) reads the cookie store on every server request.
- Token refresh happens automatically when the server client detects an expired access token.
- There is no explicit token-refresh middleware — handled by `@supabase/ssr` internally.

---

## 10. Business Logic

### Order Submission Flow (Patient)

1. Patient lands on a pharmacy's take-order page at `/order/[slug]` (reached via the pharmacy landing page at `/pharmacy/[slug]` or directly from a `/search` result card).
2. Selects order type via `OrderTabs` (Prescription, Transfer, OTC).
3. Fills the appropriate form (PrescriptionForm, TransferForm, OTCForm).
4. Submits → `submitOrderAction(FormData)`:
   - Validates required fields.
   - Uploads prescription + insurance files to `prescription-uploads` bucket under `pharmacyId/` prefix.
   - Inserts into `orders` with `status = new`, `order_source = online`.
   - Sends SMS to patient (`order_patient` template).
   - Sends SMS to pharmacy (`order_pharmacy` template).
5. Success message shown on page.

### Order Lifecycle (Pharmacy Side)

Pharmacy accesses `/pharmacy/dashboard/orders`. Status transitions are enforced by the `TRANSITIONS` map in `orders/actions.ts`:

```
new → processing → ready → [driver dispatches → completed/delivery_failed]
           ↓          ↓
       cancelled  cancelled
```

- Pharmacy can only move orders within the allowed transitions.
- `dispatched`, `completed`, `delivery_failed` are terminal from the pharmacy's perspective.
- Each transition (except cancelled→processing) sends an SMS to the patient.

### Driver Delivery Flow

1. Admin assigns a driver to an order at `/admin/dashboard/orders`.
   - `assignDriverAction(orderId, driverId)` sets `assigned_driver_id`.
   - Order must be in `ready` status before dispatch makes sense.
2. Driver logs in, sees assigned orders with `ready` status on dashboard.
3. Driver selects orders to pick up → taps "Mark as Dispatched".
   - `markDispatchedAction(orderIds[])` → `status → dispatched`.
4. Driver delivers, opens `DeliveryProofModal`:
   - **Success:** captures delivery photo + draws signature on canvas → `submitDeliveryProofAction` → uploads photo + sig to `delivery-proofs` → `status → completed`, `delivery_proof` stored.
   - **Failure:** enters failure reason → `status → delivery_failed`, `delivery_proof` stored with `outcome: failed`.

### Pharmacy Signup / Approval Flow

1. Pharmacy fills multi-step signup form.
2. `pharmacySignupAction` creates auth user + pharmacy row (status=pending).
3. Admin reviews the application at `/admin/dashboard/pharmacies/[id]`:
   - Views all submitted details including license URL.
   - Clicks Approve → `approvePharmacyAction` → `status → approved`, `reviewed_at` set, SMS sent.
   - Clicks Reject → enters reason → `rejectPharmacyAction` → `status → rejected`, reason stored, SMS sent.
4. Pharmacy can now log in.

### Driver Signup / Approval Flow

Identical to pharmacy approval:
1. Driver submits form.
2. Admin reviews at `/admin/dashboard/drivers/[id]`.
3. Approve / Reject / Suspend / Reactivate with SMS notifications.

### Pharmacy Search Flow

1. Patient enters address on home page hero.
2. `AddressAutocomplete` resolves to `{ lat, lng }` via Google Places Details.
3. Navigate to `/search?address=...&lat=...&lng=...`.
4. Server component in `search/page.tsx`:
   - Reads `search_radius_km` from `app_settings`.
   - Fetches all `approved` pharmacies from Supabase with non-null `lat`/`lng`.
   - Filters by Haversine distance ≤ radius.
   - Passes filtered list to `SearchResults` component.
5. `SearchResults` renders list + `PharmacyMap` side by side.

### Consultation Flow

1. Patient visits `/consult` → sees ConsultLanding.
2. Navigates to `/consult/nearby` → `NearbyPharmacists` lists pharmacies with `service_consultation = true` and a linked `pharmacist_profiles` row.
3. Patient clicks a pharmacist → `/consult/[slug]` → `ConsultBookingLanding`.
4. Fills booking form → inserts into `consultations` table.
5. Pharmacy sees consultation request in `/pharmacy/dashboard/consultations`.

### Manual Order Creation (Pharmacy)

1. Pharmacy navigates to `/pharmacy/dashboard/orders/new`.
2. Fills `NewOrderForm` (patient info, delivery type, free-form details).
3. `createManualOrderAction` inserts order with `order_type = manual`, `order_source = manual`.

---

## 11. Environment Variables

All env vars must be set in `.env.local` (not committed) for local development, or in the hosting platform's environment settings for production.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL. Used by all three Supabase clients. Public — safe to expose. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public key. Used by browser and server clients. Public. |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key. Bypasses RLS. **Server-only.** Never expose to client. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ✅ | Google Maps JavaScript API key. Needs Places + Maps APIs enabled. Public. |
| `TWILIO_ACCOUNT_SID` | ⚠️ optional | Twilio account SID. Required to send SMS. |
| `TWILIO_AUTH_TOKEN` | ⚠️ optional | Twilio auth token. Required to send SMS. |
| `TWILIO_PHONE_NUMBER` | ⚠️ optional | Twilio sender phone number (E.164 format, e.g. `+15005550006`). |
| `ENABLE_SMS` | ⚠️ optional | Master SMS switch. Must equal `"true"` to allow any SMS. If absent or `"false"`, all SMS are silently skipped even if Twilio credentials are set. |
| `ADMIN_PHONE_NUMBER` | ⚠️ optional | Phone number to receive admin-alert SMS (pharmacy_signup_admin, driver_signup_admin). If absent, admin alerts are skipped. |

---

## 12. Known Patterns & Conventions

### Naming Conventions

- **Files:** `PascalCase` for components (e.g., `PharmacyCard.tsx`), `camelCase` for utilities and actions (`actions.ts`, `utils.ts`).
- **Routes:** kebab-case folder names (`get-started`, `url-slug`).
- **DB columns:** `snake_case` throughout.
- **TypeScript:** Types inferred from Supabase responses; no separate types directory. Types are defined inline where needed.
- **CSS classes:** Tailwind utility classes only. Custom CSS only in `globals.css` for variables and animations.

### How API Calls Are Made

**No fetch/axios.** All data flow is:
- **Reads:** Supabase client called directly inside Server Components.
- **Writes/mutations:** Next.js Server Actions (`"use server"`) called from client components.
- Client components use `useActionState(action, initialState)` (React 19 API) for forms, or direct `action(args)` calls for imperative mutations (e.g., status change dropdown).

### Error Handling Patterns

- Server Actions return `{ error: string | null }`. On success, `error` is `null`. On failure, `error` is a human-readable message string.
- Client components display the error inline below the form.
- Supabase errors are propagated as-is from `error.message`.
- SMS failures are **non-fatal**: wrapped in `try/catch` or `.catch()`, logged with `console.error`, and do not block the main action.
- File upload failures for non-critical files (logo, hero image, pharmacist photo) are silently skipped; the auth user and pharmacy row are still created. License upload failure IS fatal — the auth user is deleted and an error is returned.

### CSS / Styling Patterns

- Tailwind CSS 4 (not Tailwind CSS 3 — different configuration). Config in `postcss.config.mjs`.
- CSS custom properties defined in `globals.css`:
  - `--color-primary: #2a9d8f` (teal)
  - `--color-text: #0d1f1c`
  - `--color-text-muted: #6b8280`
  - `--color-bg: #f8fffe`
  - `--color-bg-secondary: #f0f5f2`
  - `--color-border: #e2efed`
- Animations: `pulse-dot` (pulsing dot), `fade-in-up` (content reveal).
- `cn()` utility (from `src/lib/utils.ts`) merges Tailwind classes safely using `clsx` + `tailwind-merge`.

### Reusable Hooks

No custom hooks are present in the codebase. React's built-in `useState`, `useReducer`, `useActionState`, `useRouter`, `useSearchParams` are used directly in components.

### Slug Generation

URL slugs for pharmacies and drivers are generated server-side during signup:
```ts
function toSlug(displayName: string, city: string) {
  return `${displayName}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
```
Uniqueness is guaranteed by appending `-2`, `-3`, etc. until no collision is found.

### Admin Client vs Server Client

- **`createClient()`** (server.ts): Uses anon key + cookies. Subject to RLS. Used when you need the current user's session context.
- **`createAdminClient()`** (admin.ts): Uses service role key. Bypasses all RLS. Used for:
  - Creating auth users during signup
  - Inserting orders (no authenticated session for patients)
  - Admin operations
  - Driver delivery proof submission (driver auth is verified by checking `assigned_driver_id` in the query, not by RLS alone)

---

## 13. What NOT to Touch

### `supabase/schema.sql`

This file is append-only history. Do not modify or delete existing statements. Add new migrations as new blocks at the bottom with clear `-- MIGRATION:` headers. Running old statements again would fail (tables already exist) but the history matters for understanding the schema evolution.

### `src/lib/supabase/admin.ts`

The service-role client has full database access with no RLS. Any code that imports this must only be used in server-side contexts (`"use server"` actions or Server Components). Never import `createAdminClient` in a client component — the service role key would be exposed.

### `src/lib/twilio.ts` — `isSmsEnabled()` dual-switch logic

The dual switch (env var + DB setting) is intentional. The env var prevents SMS from ever firing in local/staging environments even if the DB accidentally has `sms_enabled = true`. Do not remove either check.

### `TRANSITIONS` map in `src/app/pharmacy/dashboard/orders/actions.ts`

This enforces valid order status transitions server-side. Changing it has downstream effects on the entire order workflow. `dispatched`, `completed`, and `delivery_failed` have empty arrays intentionally — pharmacies must not be able to change these terminal states.

### `app_metadata.role` in Supabase Auth

Role assignment happens only in `pharmacySignupAction` and `driverSignupAction` via the admin client. Admin users must be created manually. Do not add any client-side code that sets or reads `app_metadata` directly — it is set server-side only and is tamper-proof from the client.

### Storage bucket visibility

Public buckets (`pharmacy-logos`, `pharmacist-photos`, `pharmacy-hero-images`, `driver-photos`) serve URLs directly. Private buckets (`pharmacy-licenses`, `prescription-uploads`, `driver-licenses`, `delivery-proofs`) require signed URLs and should never be made public. The RLS policies for these are carefully scoped — do not change bucket visibility without updating all RLS policies accordingly.

### Google Maps API key scoping

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is exposed to the browser. In production this key must be HTTP-referrer restricted in the Google Cloud Console to prevent abuse.

### `next.config.ts` — 10 MB body limit

The `serverActions.bodySizeLimit: "10mb"` setting exists because signup forms include file uploads (license, logo, hero image, pharmacist photo, potentially multiple prescription files). Do not lower this limit without testing all file upload flows.
