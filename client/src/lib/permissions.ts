/**
 * Client-side Role-Based Access Control (RBAC) Configuration
 * 
 * This mirrors the server-side permission checks in routes.ts.
 * Used to conditionally show/hide Create/Edit/Delete buttons in the UI
 * so users don't encounter 403 Forbidden errors.
 */

const ALL_STAFF_ROLES = [
  "admin", "country_manager", "hotel_manager", "transport_manager",
  "guide_manager", "sights_manager", "airline_supplier", "operations",
  "tour_builder", "content_editor",
] as const;

/** Role display labels (Indonesian) */
const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  country_manager: "Country Manager",
  city_manager: "City Manager",
  hotel_manager: "Hotel Manager",
  transport_manager: "Transport Manager",
  guide_manager: "Guide Manager",
  sights_manager: "Sights Manager",
  airline_supplier: "Airline Supplier",
  flight_agent: "Flight Agent",
  tour_builder: "Tour Builder",
  content_editor: "Content Editor",
  supplier: "Supplier",
  travel_agent: "Travel Agent",
  customer: "Customer",
};

/**
 * Permission map: each feature maps to which roles can read / write.
 * "write" means create, edit, or delete.
 */
export const ROLE_PERMISSIONS: Record<string, { read: string[]; write: string[] }> = {
  tours:              { read: ["admin", "country_manager"], write: ["admin", "country_manager"] },
  tourDays:           { read: ["admin", "country_manager"], write: ["admin"] },
  departures:         { read: ["admin"], write: ["admin"] },
  bookings:           { read: [...ALL_STAFF_ROLES], write: ["admin"] },
  bookingAssignments: { read: [...ALL_STAFF_ROLES], write: ["admin"] },
  users:              { read: ["admin"], write: ["admin"] },
  userProfiles:       { read: [...ALL_STAFF_ROLES], write: ["admin"] },
  transport:          { read: ["admin", "transport_manager"], write: ["admin", "transport_manager"] },
  transportCompanies: { read: [...ALL_STAFF_ROLES], write: ["admin", "country_manager"] },
  masterData:         { read: [...ALL_STAFF_ROLES], write: ["admin", "country_manager"] },
  rateCards:          { read: ["admin", "country_manager"], write: ["admin", "country_manager"] },
  payments:           { read: ["admin"], write: ["admin"] },
  transportPayments:  { read: ["admin", "transport_manager"], write: ["admin"] },
  transportInvoices:  { read: ["admin", "transport_manager"], write: ["admin"] },
  documents:          { read: [...ALL_STAFF_ROLES], write: ["admin"] },
  messages:           { read: ["admin"], write: ["admin"] },
  pricing:            { read: ["admin"], write: ["admin"] },
  affiliates:         { read: ["admin"], write: ["admin"] },
  reports:            { read: ["admin", "country_manager"], write: ["admin"] },
  analytics:          { read: ["admin"], write: ["admin"] },
  scraping:           { read: ["admin", "country_manager"], write: ["admin", "country_manager"] },
  aiTourGenerator:    { read: [...ALL_STAFF_ROLES], write: [...ALL_STAFF_ROLES] },
  aiConsultant:       { read: ["admin"], write: ["admin"] },
  auditLogs:          { read: ["admin"], write: ["admin"] },
  stats:              { read: ["admin", "country_manager"], write: ["admin"] },
};

/** Check if a role can perform write actions (create/edit/delete) on a feature */
export function canWrite(role: string | undefined, feature: string): boolean {
  if (!role) return false;
  const perm = ROLE_PERMISSIONS[feature];
  if (!perm) return false;
  return perm.write.includes(role);
}

/** Check if a role can read a feature */
export function canRead(role: string | undefined, feature: string): boolean {
  if (!role) return false;
  const perm = ROLE_PERMISSIONS[feature];
  if (!perm) return false;
  return perm.read.includes(role);
}

/** Get display label for a role */
export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role.replace(/_/g, " ");
}

/** Get a human-readable list of roles that can write to a feature */
export function getWriteRolesLabel(feature: string): string {
  const perm = ROLE_PERMISSIONS[feature];
  if (!perm) return "";
  return perm.write.map(r => getRoleLabel(r)).join(", ");
}

/** Get a human-readable list of roles that can read a feature */
export function getReadRolesLabel(feature: string): string {
  const perm = ROLE_PERMISSIONS[feature];
  if (!perm) return "";
  return perm.read.map(r => getRoleLabel(r)).join(", ");
}
