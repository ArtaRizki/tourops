# TourOps Platform — Feature Status Report
**Date:** April 05, 2026

---

## PART 1: WORKING FEATURES

### Authentication & User Management
- Admin login portal (`/admin/login`) with username/password
- Staff/Supplier login portal (`/staff/login`)
- Customer login embedded in the landing page (`/`)
- Session-based authentication with 7-day session TTL (PostgreSQL session store)
- Role-based access control across all pages and API routes
- 8 user roles: admin, customer, airline_supplier, country_manager, hotel_manager, transport_manager, guide_manager, sights_manager
- Admin can create staff accounts and reset passwords
- Default admin seeded on startup (username: admin, password: admin123)
- User active/inactive status management

---

### Admin Portal

#### Dashboard (`/admin`)
- Summary statistics: total bookings, pending bookings, active tours, total revenue
- Recent activity overview

#### Tour Management (`/admin/tours`)
- Create, edit, and delete tours
- Tour fields: title, destination, duration (days/nights), base price, max capacity, description, status (draft/published/archived)
- Multi-day itinerary builder (add/edit/remove tour days with title and description)
- Tour status management (publish/unpublish)

#### Departure Management (`/admin/departures`)
- Schedule specific departure dates for tours
- Fields: start date, end date, available seats, price override, status
- Departure statuses: Open, Closed, Sold Out
- Filter departures by tour

#### Booking Management (`/admin/bookings`)
- View all bookings across all customers
- Filter bookings by status, tour, booking type
- Booking types supported: Leader Group, Join Public Group, Private Family
- Booking statuses: pending, confirmed, cancelled, completed

#### Booking Detail (`/admin/bookings/:id`)
- Full booking overview (traveler list, service assignments, payment summary)
- Add/edit/delete travelers with full passport details
- Internal messaging system (admin ↔ customer, with visibility control)
- View attached documents
- Payment history per booking
- Service fulfillment status per booking

#### Service Assignments & Workflows
- Assign services to bookings: Airline, Hotel, Transport, Guide, Sights
- Each assignment creates a workflow with predefined steps
- Workflow step statuses: pending, done, blocked, skipped
- Workflow detail view with step-by-step progress tracking
- Supplier/ops staff can update workflow step status

#### User Management (`/admin/users`)
- List all platform users
- Create new staff accounts with specific roles
- Reset user passwords
- Set user active/inactive status
- Link transport managers to transport companies

#### Master Data (`/admin/master-data`)
- **Countries**: Add, edit, delete, bulk CSV import
- **Cities**: Add, edit, delete, bulk CSV import (auto-resolves country name to ID)
- **Airports**: Add, edit, delete, bulk CSV import (with IATA code, city/country resolution)
- **Sights / Attractions**: Add, edit, delete, bulk CSV import
  - Auto-creates missing cities during import
  - Category normalization (Cultural → landmark, Natural → nature, etc.)
  - Detailed description field with 60-word live counter
- **Transport Companies**: Add, edit, delete, bulk CSV import
- **Airline Agencies**: Add, edit, delete, bulk CSV import
- All bulk imports skip duplicates (conflict-safe) and return imported/skipped counts

#### Rate Cards (`/admin/rate-cards`)
- 4 rate types: Hotel, Transport, Guide, Sights
- Manual add/edit rates with full field forms
- Status management: draft → active → archived
- Bulk upload via Excel (.xlsx) file
- Client-side Excel parsing before upload

#### Payments (`/admin/payments`)
- View all payments across bookings
- Payment status tracking

#### Documents (`/admin/documents`)
- View all uploaded documents across bookings
- Document types: traveler ID, passport scan, visa, confirmation voucher

#### Messages (`/admin/messages`)
- View all booking messages
- Internal vs customer-visible message filtering

---

### Customer Portal

#### Landing Page (`/`)
- Public-facing tour showcase
- Quick login form
- Tour category highlights

#### Browse Tours (`/customer/browse`)
- Browse all published tours
- Search by destination name
- Tour cards with pricing, duration, destination

#### Tour Detail (`/customer/tour/:id`)
- Full tour description and itinerary
- Available departures with dates and pricing
- Booking form supporting all booking types
- Group size and special notes entry

#### My Bookings (`/customer/bookings`)
- List of all customer's bookings with status
- Quick access to booking details

#### Booking Detail (`/customer/bookings/:id`) — 6-tab interface
- **Overview**: booking summary, departure info, status
- **Travelers**: add/edit/remove travelers with passport details
- **Fulfillment**: view service workflow progress
- **Messages**: communicate with admin (customer-visible messages)
- **Documents**: upload and view booking documents
- **Payments**: view payment history and amounts

#### Leader Dashboard (`/customer/leader`)
- Group leader overview: all groups managed
- Participant counts per booking
- Payment collection summary
- Alerts for pending actions

#### Manage Passengers (`/customer/bookings/:id/passengers`)
- Leader can add/edit/remove participants in their group
- Passport data, nationality, special needs per traveler

#### Tour Brochure (`/customer/tours/:id/brochure`)
- Printable/shareable tour brochure
- Day-by-day itinerary
- Pricing and booking info

---

### Supplier Portal

#### Airline Supplier Dashboard (`/supplier`)
- View only workflows assigned to this supplier
- Update workflow step statuses (pending → done/blocked/skipped)
- Filtered to show only airline-type service tasks

---

### Operations (Ops) Portal

#### Ops Dashboard (`/ops`)
- View workflows assigned to this ops staff member
- Filter by service type (hotel, transport, guide, sights)

#### Transport Management (`/ops/transport`) — 5-tab interface
- **Company Profile**: view and edit own company details
- **Bus Types**: manage vehicle types (capacity, amenities, pricing)
- **Routes & Pricing**: manage origin/destination routes with per-bus-type pricing
- **Bookings**: view transport bookings assigned to this company
- **Invoices**: view invoices from transport bookings

---

### Transportation Management System (Admin)

Full 6-tab interface at `/admin/transport`:
- **Companies**: manage all transport companies
- **Bus Types**: manage vehicle types per company
- **Routes**: manage city-to-city routes
- **Pricing**: per-bus-type pricing per route
- **Bookings**: manage all transport bookings across all companies
- **Invoices & Payments**: full financial management with payment recording

---

## PART 2: FEATURES NOT FINISHED / INCOMPLETE

### Booking System Gaps
- **Public group joining**: A customer can create a "Join Public" booking but there is no UI for browsing open public groups to join by tour/departure — only leader groups with a join code are joinable
- **Join code flow**: Leader can see their group code in the leader dashboard but the "join by code" UI on the customer side is not fully polished
- **Booking confirmation by admin**: The admin can view bookings but there is no single-click "Confirm Booking" button with automated workflow creation — assignments must be done manually one at a time

### Payment System
- **Payment recording by admin**: Admin can view payments but the form to manually record a new payment (amount, method, reference) is limited and not linked to an invoicing workflow
- **Online payment gateway**: No integration with any payment processor (Stripe, PayPal, etc.) — all payments are manually tracked
- **Customer payment upload**: Customers cannot upload payment receipts from their portal
- **Automated invoice generation**: No PDF invoice generation for customers or suppliers

### Document Management
- **Document download**: Documents can be uploaded but there is no in-app preview or download link for uploaded files
- **Document types per booking**: No enforcement of which document types are required before a booking can proceed

### Notification System
- **Email notifications**: No email is sent on booking creation, confirmation, or status change
- **SMS/WhatsApp notifications**: Not implemented
- **In-app notification bell**: No real-time notification system

### Tour Builder
- **Tour images/gallery**: Tours have no image upload — no hero photo or day-by-day gallery
- **Inclusions/Exclusions list**: No structured field for what is included or excluded in the tour price
- **Pricing tiers**: Only a single base price — no child pricing, single supplement, or room-type pricing
- **Tour categories/tags**: No category or tag system for filtering tours by type (adventure, cultural, etc.)

### Customer Experience
- **Tour search & filter**: Only destination text search — no filter by date range, price range, duration, or category
- **Tour reviews/ratings**: No review or rating system
- **Wishlist / Saved tours**: Customers cannot save or favourite tours
- **Booking cancellation by customer**: Customers cannot cancel their own booking from the portal

### Operations
- **Ops workflow notifications**: Ops staff are not notified when a new workflow is assigned to them
- **Supplier portal scope**: Only airline suppliers have a portal — hotel, guide, sights, and transport suppliers do not have dedicated portals (transport managers do via `/ops/transport`)
- **Workflow SLA tracking**: No due dates or SLA timers on workflow steps
- **Bulk assignment**: Admin must assign services one by one — no bulk assignment from the booking list

### Reports & Analytics
- **Admin reports**: No exportable reports (bookings by period, revenue by tour, occupancy rates)
- **Financial dashboard**: Rate cards exist but no cost vs. selling price margin calculation
- **Departure capacity dashboard**: No visual calendar or heatmap of departure fill rates

### Master Data
- **Airport linking to departures**: Airports table exists but airports are not yet linked to tour departure routing
- **Guide profiles**: Guide rates exist but there is no guide staff profile or assignment portal

### Technical / Infrastructure
- **File storage**: Uploaded documents are stored in the database as references but there is no cloud storage integration (S3, Cloudinary, etc.) — large files may cause issues
- **API rate limiting**: No rate limiting on public APIs
- **Audit log**: No audit trail of who changed what and when
- **Multi-language / i18n**: English only — no localisation support

---

*This report was generated automatically based on the current state of the codebase as of April 05, 2026.*
