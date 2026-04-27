import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum, json, index, uniqueIndex, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "customer",
  "airline_supplier",
  "country_manager",
  "hotel_manager",
  "transport_manager",
  "guide_manager",
  "sights_manager",
]);

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  role: userRoleEnum("role").notNull().default("customer"),
  phone: text("phone"),
  companyName: text("company_name"),
  countryCode: text("country_code"),
  transportCompanyId: varchar("transport_company_id"),
  isTourLeader: boolean("is_tour_leader").default(false),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  userIdIdx: index("user_profiles_user_id_idx").on(table.userId),
}));

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true });
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export const departureStatusEnum = pgEnum("departure_status", ["open", "closed", "sold_out", "cancelled"]);

export const tours = pgTable("tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  highlights: text("highlights"),
  inclusions: text("inclusions"),
  exclusions: text("exclusions"),
  imageUrl: text("image_url"),
  galleryUrls: text("gallery_urls").array(),
  duration: integer("duration").notNull().default(1),
  basePrice: integer("base_price").default(0),
  childPrice: integer("child_price"),
  singleSupplement: integer("single_supplement"),
  currency: text("currency").default("USD"),
  countries: text("countries").array(),
  tags: text("tags").array(),
  category: text("category"),
  pdfItineraryUrl: text("pdf_itinerary_url"),
  internalNotes: text("internal_notes"),
  isPublished: boolean("is_published").default(false),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("tours_category_idx").on(table.category),
  publishedIdx: index("tours_published_idx").on(table.isPublished),
}));

export const insertTourSchema = createInsertSchema(tours).omit({ id: true, createdAt: true });
export type InsertTour = z.infer<typeof insertTourSchema>;
export type Tour = typeof tours.$inferSelect;

export const tourDays = pgTable("tour_days", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull(),
  dayNumber: integer("day_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  countryCode: text("country_code"),
  city: text("city"),
  activities: text("activities"),
}, (table) => ({
  tourIdIdx: index("tour_days_tour_id_idx").on(table.tourId),
}));

export const insertTourDaySchema = createInsertSchema(tourDays).omit({ id: true });
export type InsertTourDay = z.infer<typeof insertTourDaySchema>;
export type TourDay = typeof tourDays.$inferSelect;

export const tourDepartures = pgTable("tour_departures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  capacityTotal: integer("capacity_total").notNull().default(20),
  capacityBooked: integer("capacity_booked").default(0),
  departureAirportId: varchar("departure_airport_id"),
  arrivalAirportId: varchar("arrival_airport_id"),
  status: departureStatusEnum("status").default("open"),
  publicJoinEnabled: boolean("public_join_enabled").default(true),
  bookingCutoffDate: text("booking_cutoff_date"),
  pricePerPerson: integer("price_per_person"),
  notes: text("notes"),
}, (table) => ({
  tourIdIdx: index("tour_departures_tour_id_idx").on(table.tourId),
  statusIdx: index("tour_departures_status_idx").on(table.status),
}));

export const insertTourDepartureSchema = createInsertSchema(tourDepartures).omit({ id: true });
export type InsertTourDeparture = z.infer<typeof insertTourDepartureSchema>;
export type TourDeparture = typeof tourDepartures.$inferSelect;

export const bookingTypeEnum = pgEnum("booking_type", [
  "leader_group",
  "join_leader_group",
  "join_public_group",
  "private_family",
  "custom_leader",
  "custom_family",
]);

export const bookingStatusEnum = pgEnum("booking_status", ["draft", "submitted", "confirmed", "cancelled", "completed"]);
export const fulfillmentStatusEnum = pgEnum("fulfillment_status", ["pending", "in_progress", "blocked", "completed"]);

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingCode: text("booking_code").notNull().unique(),
  tourId: varchar("tour_id"),
  departureId: varchar("departure_id"),
  customerId: varchar("customer_id").notNull(),
  bookingType: bookingTypeEnum("booking_type").notNull(),
  groupName: text("group_name"),
  leaderUserId: varchar("leader_user_id"),
  joinCode: text("join_code").unique(),
  partySizeExpected: integer("party_size_expected").default(1),
  status: bookingStatusEnum("status").default("submitted"),
  fulfillmentStatus: fulfillmentStatusEnum("fulfillment_status").default("pending"),
  totalPrice: integer("total_price"),
  currency: text("currency").default("USD"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  isUrgent: boolean("is_urgent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  customerIdIdx: index("bookings_customer_id_idx").on(table.customerId),
  tourIdIdx: index("bookings_tour_id_idx").on(table.tourId),
  departureIdIdx: index("bookings_departure_id_idx").on(table.departureId),
  codeIdx: index("bookings_code_idx").on(table.bookingCode),
  statusIdx: index("bookings_status_idx").on(table.status),
}));

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export const travelers = pgTable("travelers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: text("dob"),
  nationality: text("nationality"),
  passportNumber: text("passport_number"),
  passportExpiry: text("passport_expiry"),
  gender: text("gender"),
  specialNeeds: text("special_needs"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  bookingIdIdx: index("travelers_booking_id_idx").on(table.bookingId),
}));

export const insertTravelerSchema = createInsertSchema(travelers).omit({ id: true, createdAt: true });
export type InsertTraveler = z.infer<typeof insertTravelerSchema>;
export type Traveler = typeof travelers.$inferSelect;

export const serviceTypeEnum = pgEnum("service_type", ["airline", "hotel", "transport", "guide", "sights"]);
export const assignmentStatusEnum = pgEnum("assignment_status", ["assigned", "reassigned", "unassigned"]);

export const bookingAssignments = pgTable("booking_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull(),
  countryCode: text("country_code"),
  serviceType: serviceTypeEnum("service_type").notNull(),
  assignedUserId: varchar("assigned_user_id"),
  assignedBy: varchar("assigned_by"),
  status: assignmentStatusEnum("assignment_status").default("assigned"),
  assignedAt: timestamp("assigned_at").defaultNow(),
}, (table) => ({
  bookingIdIdx: index("booking_assignments_booking_id_idx").on(table.bookingId),
  assignedUserIdx: index("booking_assignments_assigned_user_id_idx").on(table.assignedUserId),
}));

export const insertBookingAssignmentSchema = createInsertSchema(bookingAssignments).omit({ id: true, assignedAt: true });
export type InsertBookingAssignment = z.infer<typeof insertBookingAssignmentSchema>;
export type BookingAssignment = typeof bookingAssignments.$inferSelect;

export const workflowStatusEnum = pgEnum("workflow_status", ["not_assigned", "assigned", "in_progress", "blocked", "completed", "cancelled"]);

export const bookingWorkflows = pgTable("booking_workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull(),
  countryCode: text("country_code"),
  serviceType: serviceTypeEnum("service_type").notNull(),
  assignedUserId: varchar("assigned_user_id"),
  status: workflowStatusEnum("workflow_status").default("not_assigned"),
  currentStep: text("current_step"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  bookingIdIdx: index("booking_workflows_booking_id_idx").on(table.bookingId),
  assignedUserIdx: index("booking_workflows_assigned_user_id_idx").on(table.assignedUserId),
  statusIdx: index("booking_workflows_status_idx").on(table.status),
}));

export const insertBookingWorkflowSchema = createInsertSchema(bookingWorkflows).omit({ id: true, updatedAt: true });
export type InsertBookingWorkflow = z.infer<typeof insertBookingWorkflowSchema>;
export type BookingWorkflow = typeof bookingWorkflows.$inferSelect;

export const stepStatusEnum = pgEnum("step_status", ["pending", "done", "skipped", "blocked"]);

export const workflowSteps = pgTable("workflow_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull(),
  stepOrder: integer("step_order").notNull(),
  stepCode: text("step_code").notNull(),
  stepName: text("step_name").notNull(),
  status: stepStatusEnum("step_status").default("pending"),
  updatedBy: varchar("updated_by"),
  notes: text("notes"),
  dueDate: text("due_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  workflowIdIdx: index("workflow_steps_workflow_id_idx").on(table.workflowId),
  statusIdx: index("workflow_steps_status_idx").on(table.status),
}));

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // e.g. 'booking', 'workflow', 'payment'
  entityId: varchar("entity_id").notNull(),
  action: text("action").notNull(), // e.g. 'status_changed', 'created', 'updated'
  changedBy: varchar("changed_by"),
  changedByName: text("changed_by_name"),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  entityTypeIdx: index("audit_logs_entity_type_idx").on(table.entityType),
  entityIdIdx: index("audit_logs_entity_id_idx").on(table.entityId),
}));
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export const insertWorkflowStepSchema = createInsertSchema(workflowSteps).omit({ id: true, updatedAt: true });
export type InsertWorkflowStep = z.infer<typeof insertWorkflowStepSchema>;
export type WorkflowStep = typeof workflowSteps.$inferSelect;

export const docTypeEnum = pgEnum("doc_type", [
  "passport", "id_doc", "visa",
  "eticket", "pnr", "hotel_confirm", "voucher",
  "transport_confirm", "guide_confirm", "sight_ticket",
  "quote", "receipt", "other",
]);

export const docStatusEnum = pgEnum("doc_status", ["uploaded", "approved", "rejected"]);

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull(),
  travelerId: varchar("traveler_id"),
  workflowStepId: varchar("workflow_step_id"),
  docType: docTypeEnum("doc_type").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url"),
  uploadedBy: varchar("uploaded_by"),
  status: docStatusEnum("doc_status").default("uploaded"),
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export const messageVisibilityEnum = pgEnum("message_visibility", ["customer_visible", "internal_only"]);

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull(),
  workflowId: varchar("workflow_id"),
  senderUserId: varchar("sender_user_id").notNull(),
  senderName: text("sender_name"),
  visibility: messageVisibilityEnum("message_visibility").default("customer_visible"),
  messageText: text("message_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["bank_transfer", "card", "cash", "other"]);

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull(),
  invoiceId: varchar("invoice_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").default("USD"),
  method: paymentMethodEnum("payment_method").default("bank_transfer"),
  status: paymentStatusEnum("payment_status").default("pending"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export const countries = pgTable("countries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  region: text("region"),
  currency: text("currency"),
  timezone: text("timezone"),
  isActive: boolean("is_active").default(true),
});
export const insertCountrySchema = createInsertSchema(countries).omit({ id: true });
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countries.$inferSelect;

export const cities = pgTable("cities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  countryId: varchar("country_id").notNull(),
  isAirportCity: boolean("is_airport_city").default(false),
  isActive: boolean("is_active").default(true),
});
export const insertCitySchema = createInsertSchema(cities).omit({ id: true });
export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

export const airports = pgTable("airports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  cityId: varchar("city_id").notNull(),
  isActive: boolean("is_active").default(true),
});
export const insertAirportSchema = createInsertSchema(airports).omit({ id: true });
export type InsertAirport = z.infer<typeof insertAirportSchema>;
export type Airport = typeof airports.$inferSelect;

export const sightCategoryEnum = pgEnum("sight_category", ["museum", "landmark", "park", "religious", "entertainment", "nature", "historical", "other"]);

export const sights = pgTable("sights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cityId: varchar("city_id").notNull(),
  description: text("description"),
  longDescription: text("long_description"),
  category: sightCategoryEnum("sight_category").default("other"),
  ticketRequired: boolean("ticket_required").default(false),
  individualTicketCost: numeric("individual_ticket_cost"),
  groupTicketCost: numeric("group_ticket_cost"),
  estimatedDuration: text("estimated_duration"),
  isActive: boolean("is_active").default(true),
});
export const insertSightSchema = createInsertSchema(sights).omit({ id: true });
export type InsertSight = z.infer<typeof insertSightSchema>;
export type Sight = typeof sights.$inferSelect;

export const transportCompanies = pgTable("transport_companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  countryId: varchar("country_id"),
  vehicleTypes: text("vehicle_types").array(),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankSwift: text("bank_swift"),
  bankIban: text("bank_iban"),
  taxId: text("tax_id"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
});
export const insertTransportCompanySchema = createInsertSchema(transportCompanies).omit({ id: true });
export type InsertTransportCompany = z.infer<typeof insertTransportCompanySchema>;
export type TransportCompany = typeof transportCompanies.$inferSelect;

export const busTypes = pgTable("bus_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: text("name").notNull(),
  seats: integer("seats").notNull(),
  costPerDay: numeric("cost_per_day"),
  costPerMile: numeric("cost_per_mile"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
});
export const insertBusTypeSchema = createInsertSchema(busTypes).omit({ id: true });
export type InsertBusType = z.infer<typeof insertBusTypeSchema>;
export type BusType = typeof busTypes.$inferSelect;

export const transportRoutes = pgTable("transport_routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  fromCity: text("from_city"),
  toCity: text("to_city"),
  distanceMiles: numeric("distance_miles"),
  isActive: boolean("is_active").default(true),
});
export const insertTransportRouteSchema = createInsertSchema(transportRoutes).omit({ id: true });
export type InsertTransportRoute = z.infer<typeof insertTransportRouteSchema>;
export type TransportRoute = typeof transportRoutes.$inferSelect;

export const transportRoutePricing = pgTable("transport_route_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  routeId: varchar("route_id").notNull(),
  busTypeId: varchar("bus_type_id").notNull(),
  costPerTrip: numeric("cost_per_trip").notNull(),
  notes: text("notes"),
});
export const insertTransportRoutePricingSchema = createInsertSchema(transportRoutePricing).omit({ id: true });
export type InsertTransportRoutePricing = z.infer<typeof insertTransportRoutePricingSchema>;
export type TransportRoutePricing = typeof transportRoutePricing.$inferSelect;

export const transportBookingStatusEnum = pgEnum("transport_booking_status", ["requested", "confirmed", "cancelled", "completed"]);

export const transportBookings = pgTable("transport_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id"),
  tourId: varchar("tour_id"),
  companyId: varchar("company_id").notNull(),
  routeId: varchar("route_id"),
  busTypeId: varchar("bus_type_id"),
  serviceDate: text("service_date"),
  serviceEndDate: text("service_end_date"),
  status: transportBookingStatusEnum("status").default("requested"),
  costQuoted: numeric("cost_quoted"),
  confirmedAt: timestamp("confirmed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertTransportBookingSchema = createInsertSchema(transportBookings).omit({ id: true, createdAt: true, confirmedAt: true });
export type InsertTransportBooking = z.infer<typeof insertTransportBookingSchema>;
export type TransportBooking = typeof transportBookings.$inferSelect;

export const transportInvoiceStatusEnum = pgEnum("transport_invoice_status", ["submitted", "approved", "paid", "rejected"]);

export const transportInvoices = pgTable("transport_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  transportBookingId: varchar("transport_booking_id"),
  invoiceNumber: text("invoice_number").notNull(),
  serviceDetails: text("service_details"),
  amount: numeric("amount").notNull(),
  status: transportInvoiceStatusEnum("status").default("submitted"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
});
export const insertTransportInvoiceSchema = createInsertSchema(transportInvoices).omit({ id: true, submittedAt: true, approvedAt: true });
export type InsertTransportInvoice = z.infer<typeof insertTransportInvoiceSchema>;
export type TransportInvoice = typeof transportInvoices.$inferSelect;

export const transportPayments = pgTable("transport_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  invoiceId: varchar("invoice_id"),
  tourId: varchar("tour_id"),
  amount: numeric("amount").notNull(),
  paymentDate: text("payment_date"),
  paymentMethod: text("payment_method"),
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertTransportPaymentSchema = createInsertSchema(transportPayments).omit({ id: true, createdAt: true });
export type InsertTransportPayment = z.infer<typeof insertTransportPaymentSchema>;
export type TransportPayment = typeof transportPayments.$inferSelect;

export const airlineAgencies = pgTable("airline_agencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  countryIds: text("country_ids").array(),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  specializations: text("specializations").array(),
  isActive: boolean("is_active").default(true),
});
export const insertAirlineAgencySchema = createInsertSchema(airlineAgencies).omit({ id: true });
export type InsertAirlineAgency = z.infer<typeof insertAirlineAgencySchema>;
export type AirlineAgency = typeof airlineAgencies.$inferSelect;

export const rateStatusEnum = pgEnum("rate_status", ["draft", "active", "archived"]);

export const hotelRates = pgTable("hotel_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: text("country_code"),
  city: text("city"),
  hotelName: text("hotel_name").notNull(),
  hotelCode: text("hotel_code"),
  roomType: text("room_type"),
  mealPlan: text("meal_plan"),
  currency: text("currency").default("USD"),
  validFrom: text("valid_from"),
  validTo: text("valid_to"),
  pricePerRoomPerNight: numeric("price_per_room_per_night"),
  taxIncluded: boolean("tax_included").default(false),
  minNights: integer("min_nights"),
  blackoutDates: text("blackout_dates"),
  notes: text("notes"),
  status: rateStatusEnum("status").default("draft"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertHotelRateSchema = createInsertSchema(hotelRates).omit({ id: true, createdAt: true });
export type InsertHotelRate = z.infer<typeof insertHotelRateSchema>;
export type HotelRate = typeof hotelRates.$inferSelect;

export const transportRates = pgTable("transport_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: text("country_code"),
  cityBase: text("city_base"),
  vendorName: text("vendor_name").notNull(),
  vendorCode: text("vendor_code"),
  vehicleType: text("vehicle_type"),
  seatCapacity: integer("seat_capacity"),
  rateMode: text("rate_mode"),
  currency: text("currency").default("USD"),
  validFrom: text("valid_from"),
  validTo: text("valid_to"),
  basePrice: numeric("base_price"),
  includedHours: integer("included_hours"),
  includedKm: integer("included_km"),
  overtimePerHour: numeric("overtime_per_hour"),
  extraPerKm: numeric("extra_per_km"),
  routeFromCity: text("route_from_city"),
  routeToCity: text("route_to_city"),
  notes: text("notes"),
  status: rateStatusEnum("status").default("draft"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertTransportRateSchema = createInsertSchema(transportRates).omit({ id: true, createdAt: true });
export type InsertTransportRate = z.infer<typeof insertTransportRateSchema>;
export type TransportRate = typeof transportRates.$inferSelect;

export const guideRates = pgTable("guide_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: text("country_code"),
  cityBase: text("city_base"),
  guideName: text("guide_name").notNull(),
  guideCode: text("guide_code"),
  language: text("language"),
  rateUnit: text("rate_unit"),
  currency: text("currency").default("USD"),
  validFrom: text("valid_from"),
  validTo: text("valid_to"),
  price: numeric("price"),
  licenseLevel: text("license_level"),
  notes: text("notes"),
  status: rateStatusEnum("status").default("draft"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertGuideRateSchema = createInsertSchema(guideRates).omit({ id: true, createdAt: true });
export type InsertGuideRate = z.infer<typeof insertGuideRateSchema>;
export type GuideRate = typeof guideRates.$inferSelect;

export const sightsRates = pgTable("sights_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: text("country_code"),
  city: text("city"),
  attractionName: text("attraction_name").notNull(),
  attractionCode: text("attraction_code"),
  ticketType: text("ticket_type"),
  currency: text("currency").default("USD"),
  validFrom: text("valid_from"),
  validTo: text("valid_to"),
  pricePerPerson: numeric("price_per_person"),
  requiresTimeslot: boolean("requires_timeslot").default(false),
  notes: text("notes"),
  status: rateStatusEnum("status").default("draft"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertSightsRateSchema = createInsertSchema(sightsRates).omit({ id: true, createdAt: true });
export type InsertSightsRate = z.infer<typeof insertSightsRateSchema>;
export type SightsRate = typeof sightsRates.$inferSelect;

export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "sent", "paid", "cancelled"]);

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("USD"),
  status: invoiceStatusEnum("status").default("draft"),
  dueDate: text("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'booking_update', 'payment_received', 'document_action', 'system'
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
