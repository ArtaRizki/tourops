import { db } from "./db";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { users } from "@shared/models/auth";
import {
  userProfiles, tours, tourDays, tourDepartures,
  bookings, travelers, bookingAssignments,
  bookingWorkflows, workflowSteps, documents, messages, payments,
  countries, cities, airports, sights, transportCompanies, airlineAgencies,
  busTypes, transportRoutes, transportRoutePricing,
  transportBookings, transportInvoices, transportPayments,
  auditLogs,
  type UserProfile, type InsertUserProfile,
  type Tour, type InsertTour,
  type TourDay, type InsertTourDay,
  type TourDeparture, type InsertTourDeparture,
  type Booking, type InsertBooking,
  type Traveler, type InsertTraveler,
  type BookingAssignment, type InsertBookingAssignment,
  type BookingWorkflow, type InsertBookingWorkflow,
  type WorkflowStep, type InsertWorkflowStep,
  type Document, type InsertDocument,
  type Message, type InsertMessage,
  type Payment, type InsertPayment,
  type Country, type InsertCountry,
  type City, type InsertCity,
  type Airport, type InsertAirport,
  type Sight, type InsertSight,
  type TransportCompany, type InsertTransportCompany,
  type AirlineAgency, type InsertAirlineAgency,
  type BusType, type InsertBusType,
  type TransportRoute, type InsertTransportRoute,
  type TransportRoutePricing, type InsertTransportRoutePricing,
  type TransportBooking, type InsertTransportBooking,
  type TransportInvoice, type InsertTransportInvoice,
  type TransportPayment, type InsertTransportPayment,
  hotelRates, transportRates, guideRates, sightsRates,
  type HotelRate, type InsertHotelRate,
  type TransportRate, type InsertTransportRate,
  type GuideRate, type InsertGuideRate,
  type SightsRate, type InsertSightsRate,
  type AuditLog, type InsertAuditLog,
} from "@shared/schema";

export interface IStorage {
  getOrCreateProfile(userId: string): Promise<UserProfile>;
  getProfile(id: string): Promise<UserProfile | undefined>;
  getProfileByUserId(userId: string): Promise<UserProfile | undefined>;
  getProfileByUserIdWithEmail(userId: string): Promise<(UserProfile & { user?: { email: string | null; firstName: string | null; lastName: string | null; username: string | null } }) | undefined>;
  getAllProfiles(): Promise<(UserProfile & { user?: { email: string | null; firstName: string | null; lastName: string | null; username: string | null } })[]>;

  getAllTours(): Promise<Tour[]>;
  getPublishedTours(): Promise<Tour[]>;
  getTour(id: string): Promise<Tour | undefined>;
  createTour(data: InsertTour): Promise<Tour>;
  updateTour(id: string, data: Partial<Tour>): Promise<Tour>;
  deleteTour(id: string): Promise<void>;

  getTourDays(tourId: string): Promise<TourDay[]>;
  createTourDay(data: InsertTourDay): Promise<TourDay>;
  updateTourDay(id: string, data: Partial<TourDay>): Promise<TourDay>;
  deleteTourDay(id: string): Promise<void>;

  getAllDepartures(): Promise<TourDeparture[]>;
  getDeparturesByTour(tourId: string): Promise<TourDeparture[]>;
  getDeparture(id: string): Promise<TourDeparture | undefined>;
  createDeparture(data: InsertTourDeparture): Promise<TourDeparture>;
  updateDeparture(id: string, data: Partial<TourDeparture>): Promise<TourDeparture>;

  getAllBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByCustomer(customerId: string): Promise<Booking[]>;
  getBookingByJoinCode(code: string): Promise<Booking | undefined>;
  createBooking(data: InsertBooking): Promise<Booking>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking>;

  getTraveler(id: string): Promise<Traveler | undefined>;
  getTravelers(bookingId: string): Promise<Traveler[]>;
  createTraveler(data: InsertTraveler): Promise<Traveler>;
  updateTraveler(id: string, data: Partial<Traveler>): Promise<Traveler>;
  deleteTraveler(id: string): Promise<void>;

  getAllAssignments(): Promise<BookingAssignment[]>;
  getAssignments(bookingId: string): Promise<BookingAssignment[]>;
  createAssignment(data: InsertBookingAssignment): Promise<BookingAssignment>;
  updateAssignment(id: string, data: Partial<BookingAssignment>): Promise<BookingAssignment>;
  deleteAssignment(id: string): Promise<void>;

  getAllWorkflows(): Promise<BookingWorkflow[]>;
  getWorkflows(bookingId: string): Promise<BookingWorkflow[]>;
  getWorkflowsByUser(userId: string): Promise<BookingWorkflow[]>;
  getWorkflow(id: string): Promise<BookingWorkflow | undefined>;
  createWorkflow(data: InsertBookingWorkflow): Promise<BookingWorkflow>;
  updateWorkflow(id: string, data: Partial<BookingWorkflow>): Promise<BookingWorkflow>;

  getWorkflowSteps(workflowId: string): Promise<WorkflowStep[]>;
  createWorkflowStep(data: InsertWorkflowStep): Promise<WorkflowStep>;
  updateWorkflowStep(id: string, data: Partial<WorkflowStep>): Promise<WorkflowStep>;

  getAllDocuments(): Promise<Document[]>;
  getDocuments(bookingId: string): Promise<Document[]>;
  createDocument(data: InsertDocument): Promise<Document>;
  updateDocument(id: string, data: Partial<Document>): Promise<Document>;

  getAllMessages(): Promise<Message[]>;
  getMessages(bookingId: string): Promise<Message[]>;
  createMessage(data: InsertMessage): Promise<Message>;

  getAllPayments(): Promise<Payment[]>;
  getPayments(bookingId: string): Promise<Payment[]>;
  createPayment(data: InsertPayment): Promise<Payment>;
  updatePayment(id: string, data: Partial<Payment>): Promise<Payment>;

  getGroupParticipants(leaderBookingId: string): Promise<Booking[]>;
  getBookingsByLeader(leaderUserId: string): Promise<Booking[]>;

  getAllCountries(): Promise<Country[]>;
  getCountry(id: string): Promise<Country | undefined>;
  createCountry(data: InsertCountry): Promise<Country>;
  updateCountry(id: string, data: Partial<Country>): Promise<Country>;
  deleteCountry(id: string): Promise<void>;
  bulkCreateCountries(data: InsertCountry[]): Promise<Country[]>;

  getAllCities(): Promise<City[]>;
  getCity(id: string): Promise<City | undefined>;
  createCity(data: InsertCity): Promise<City>;
  updateCity(id: string, data: Partial<City>): Promise<City>;
  deleteCity(id: string): Promise<void>;
  bulkCreateCities(data: InsertCity[]): Promise<City[]>;

  getAllAirports(): Promise<Airport[]>;
  getAirport(id: string): Promise<Airport | undefined>;
  createAirport(data: InsertAirport): Promise<Airport>;
  updateAirport(id: string, data: Partial<Airport>): Promise<Airport>;
  deleteAirport(id: string): Promise<void>;
  bulkCreateAirports(data: InsertAirport[]): Promise<Airport[]>;

  getAllSights(): Promise<Sight[]>;
  getSight(id: string): Promise<Sight | undefined>;
  createSight(data: InsertSight): Promise<Sight>;
  updateSight(id: string, data: Partial<Sight>): Promise<Sight>;
  deleteSight(id: string): Promise<void>;
  bulkCreateSights(data: InsertSight[]): Promise<Sight[]>;

  getAllTransportCompanies(): Promise<TransportCompany[]>;
  getTransportCompany(id: string): Promise<TransportCompany | undefined>;
  createTransportCompany(data: InsertTransportCompany): Promise<TransportCompany>;
  updateTransportCompany(id: string, data: Partial<TransportCompany>): Promise<TransportCompany>;
  deleteTransportCompany(id: string): Promise<void>;
  bulkCreateTransportCompanies(data: InsertTransportCompany[]): Promise<TransportCompany[]>;

  getAllAirlineAgencies(): Promise<AirlineAgency[]>;
  getAirlineAgency(id: string): Promise<AirlineAgency | undefined>;
  createAirlineAgency(data: InsertAirlineAgency): Promise<AirlineAgency>;
  updateAirlineAgency(id: string, data: Partial<AirlineAgency>): Promise<AirlineAgency>;
  deleteAirlineAgency(id: string): Promise<void>;
  bulkCreateAirlineAgencies(data: InsertAirlineAgency[]): Promise<AirlineAgency[]>;

  getBusTypes(companyId: string): Promise<BusType[]>;
  getAllBusTypes(): Promise<BusType[]>;
  createBusType(data: InsertBusType): Promise<BusType>;
  updateBusType(id: string, data: Partial<BusType>): Promise<BusType>;
  deleteBusType(id: string): Promise<void>;

  getTransportRoutes(companyId: string): Promise<TransportRoute[]>;
  getAllTransportRoutes(): Promise<TransportRoute[]>;
  createTransportRoute(data: InsertTransportRoute): Promise<TransportRoute>;
  updateTransportRoute(id: string, data: Partial<TransportRoute>): Promise<TransportRoute>;
  deleteTransportRoute(id: string): Promise<void>;

  getRoutePricing(routeId: string): Promise<TransportRoutePricing[]>;
  getAllRoutePricing(): Promise<TransportRoutePricing[]>;
  createRoutePricing(data: InsertTransportRoutePricing): Promise<TransportRoutePricing>;
  updateRoutePricing(id: string, data: Partial<TransportRoutePricing>): Promise<TransportRoutePricing>;
  deleteRoutePricing(id: string): Promise<void>;

  getTransportBookings(companyId?: string): Promise<TransportBooking[]>;
  getTransportBooking(id: string): Promise<TransportBooking | undefined>;
  createTransportBooking(data: InsertTransportBooking): Promise<TransportBooking>;
  updateTransportBooking(id: string, data: Partial<TransportBooking>): Promise<TransportBooking>;

  getTransportInvoices(companyId?: string): Promise<TransportInvoice[]>;
  getTransportInvoice(id: string): Promise<TransportInvoice | undefined>;
  createTransportInvoice(data: InsertTransportInvoice): Promise<TransportInvoice>;
  updateTransportInvoice(id: string, data: Partial<TransportInvoice>): Promise<TransportInvoice>;

  getTransportPayments(companyId?: string): Promise<TransportPayment[]>;
  createTransportPayment(data: InsertTransportPayment): Promise<TransportPayment>;
  updateTransportPayment(id: string, data: Partial<TransportPayment>): Promise<TransportPayment>;

  getHotelRates(): Promise<HotelRate[]>;
  createHotelRate(data: InsertHotelRate): Promise<HotelRate>;
  bulkCreateHotelRates(data: InsertHotelRate[]): Promise<HotelRate[]>;
  updateHotelRate(id: string, data: Partial<HotelRate>): Promise<HotelRate>;
  deleteHotelRate(id: string): Promise<void>;

  getTransportRates(): Promise<TransportRate[]>;
  createTransportRate(data: InsertTransportRate): Promise<TransportRate>;
  bulkCreateTransportRates(data: InsertTransportRate[]): Promise<TransportRate[]>;
  updateTransportRate(id: string, data: Partial<TransportRate>): Promise<TransportRate>;
  deleteTransportRate(id: string): Promise<void>;

  getGuideRates(): Promise<GuideRate[]>;
  createGuideRate(data: InsertGuideRate): Promise<GuideRate>;
  bulkCreateGuideRates(data: InsertGuideRate[]): Promise<GuideRate[]>;
  updateGuideRate(id: string, data: Partial<GuideRate>): Promise<GuideRate>;
  deleteGuideRate(id: string): Promise<void>;

  getSightsRates(): Promise<SightsRate[]>;
  createSightsRate(data: InsertSightsRate): Promise<SightsRate>;
  bulkCreateSightsRates(data: InsertSightsRate[]): Promise<SightsRate[]>;
  updateSightsRate(id: string, data: Partial<SightsRate>): Promise<SightsRate>;
  deleteSightsRate(id: string): Promise<void>;

  getAuditLogs(entityType: string, entityId: string): Promise<AuditLog[]>;
  createAuditLog(data: InsertAuditLog): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  async getOrCreateProfile(userId: string): Promise<UserProfile> {
    const existing = await this.getProfileByUserId(userId);
    if (existing) return existing;
    const allProfiles = await db.select().from(userProfiles);
    const hasRealAdmin = allProfiles.some(p => p.role === "admin" && !p.userId.startsWith("test-") && !p.userId.endsWith("-e2e-002"));
    const role = hasRealAdmin ? "customer" : "admin";
    const [profile] = await db.insert(userProfiles).values({ userId, role }).returning();
    return profile;
  }

  async getProfile(id: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
    return profile;
  }

  async getProfileByUserId(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async getProfileByUserIdWithEmail(userId: string): Promise<(UserProfile & { user?: { email: string | null; firstName: string | null; lastName: string | null; username: string | null } }) | undefined> {
    const [row] = await db.select({
      profile: userProfiles,
      user: { email: users.email, firstName: users.firstName, lastName: users.lastName, username: users.username },
    }).from(userProfiles).where(eq(userProfiles.userId, userId)).leftJoin(users, eq(userProfiles.userId, users.id));
    if (!row) return undefined;
    return { ...row.profile, user: row.user || undefined };
  }

  async getAllProfiles(): Promise<(UserProfile & { user?: { email: string | null; firstName: string | null; lastName: string | null; username: string | null } })[]> {
    const rows = await db.select({
      profile: userProfiles,
      user: { email: users.email, firstName: users.firstName, lastName: users.lastName, username: users.username },
    }).from(userProfiles).leftJoin(users, eq(userProfiles.userId, users.id));
    return rows.map(r => ({ ...r.profile, user: r.user || undefined }));
  }

  async updateProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const [profile] = await db.update(userProfiles).set(data).where(eq(userProfiles.id, id)).returning();
    return profile;
  }

  async getAllTours(): Promise<Tour[]> {
    return db.select().from(tours).orderBy(desc(tours.createdAt));
  }

  async getPublishedTours(): Promise<Tour[]> {
    return db.select().from(tours).where(eq(tours.isPublished, true)).orderBy(desc(tours.createdAt));
  }

  async getTour(id: string): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour;
  }

  async createTour(data: InsertTour): Promise<Tour> {
    const [tour] = await db.insert(tours).values(data).returning();
    return tour;
  }

  async updateTour(id: string, data: Partial<Tour>): Promise<Tour> {
    const [tour] = await db.update(tours).set(data).where(eq(tours.id, id)).returning();
    return tour;
  }

  async deleteTour(id: string): Promise<void> {
    await db.delete(tours).where(eq(tours.id, id));
  }

  async getTourDays(tourId: string): Promise<TourDay[]> {
    return db.select().from(tourDays).where(eq(tourDays.tourId, tourId));
  }

  async createTourDay(data: InsertTourDay): Promise<TourDay> {
    const [day] = await db.insert(tourDays).values(data).returning();
    return day;
  }

  async updateTourDay(id: string, data: Partial<TourDay>): Promise<TourDay> {
    const [day] = await db.update(tourDays).set(data).where(eq(tourDays.id, id)).returning();
    return day;
  }

  async deleteTourDay(id: string): Promise<void> {
    await db.delete(tourDays).where(eq(tourDays.id, id));
  }

  async getAllDepartures(): Promise<TourDeparture[]> {
    return db.select().from(tourDepartures);
  }

  async getDeparturesByTour(tourId: string): Promise<TourDeparture[]> {
    return db.select().from(tourDepartures).where(eq(tourDepartures.tourId, tourId));
  }

  async getDeparture(id: string): Promise<TourDeparture | undefined> {
    const [dep] = await db.select().from(tourDepartures).where(eq(tourDepartures.id, id));
    return dep;
  }

  async createDeparture(data: InsertTourDeparture): Promise<TourDeparture> {
    const [dep] = await db.insert(tourDepartures).values(data).returning();
    return dep;
  }

  async updateDeparture(id: string, data: Partial<TourDeparture>): Promise<TourDeparture> {
    const [dep] = await db.update(tourDepartures).set(data).where(eq(tourDepartures.id, id)).returning();
    return dep;
  }

  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.customerId, customerId)).orderBy(desc(bookings.createdAt));
  }

  async getBookingByJoinCode(code: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.joinCode, code));
    return booking;
  }

  async createBooking(data: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(data).returning();
    return booking;
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    const [booking] = await db.update(bookings).set(data).where(eq(bookings.id, id)).returning();
    return booking;
  }

  async getTraveler(id: string): Promise<Traveler | undefined> {
    const [traveler] = await db.select().from(travelers).where(eq(travelers.id, id));
    return traveler;
  }

  async getTravelers(bookingId: string): Promise<Traveler[]> {
    return db.select().from(travelers).where(eq(travelers.bookingId, bookingId));
  }

  async createTraveler(data: InsertTraveler): Promise<Traveler> {
    const [traveler] = await db.insert(travelers).values(data).returning();
    return traveler;
  }

  async updateTraveler(id: string, data: Partial<Traveler>): Promise<Traveler> {
    const [traveler] = await db.update(travelers).set(data).where(eq(travelers.id, id)).returning();
    return traveler;
  }

  async deleteTraveler(id: string): Promise<void> {
    await db.delete(travelers).where(eq(travelers.id, id));
  }

  async getAllAssignments(): Promise<BookingAssignment[]> {
    return db.select().from(bookingAssignments).orderBy(desc(bookingAssignments.assignedAt));
  }

  async getAssignments(bookingId: string): Promise<BookingAssignment[]> {
    return db.select().from(bookingAssignments).where(eq(bookingAssignments.bookingId, bookingId));
  }

  async createAssignment(data: InsertBookingAssignment): Promise<BookingAssignment> {
    const [assignment] = await db.insert(bookingAssignments).values(data).returning();
    return assignment;
  }

  async updateAssignment(id: string, data: Partial<BookingAssignment>): Promise<BookingAssignment> {
    const [assignment] = await db.update(bookingAssignments).set(data).where(eq(bookingAssignments.id, id)).returning();
    return assignment;
  }

  async deleteAssignment(id: string): Promise<void> {
    await db.delete(bookingAssignments).where(eq(bookingAssignments.id, id));
  }

  async getAllWorkflows(): Promise<BookingWorkflow[]> {
    return db.select().from(bookingWorkflows).orderBy(desc(bookingWorkflows.updatedAt));
  }

  async getWorkflows(bookingId: string): Promise<BookingWorkflow[]> {
    return db.select().from(bookingWorkflows).where(eq(bookingWorkflows.bookingId, bookingId));
  }

  async getWorkflowsByUser(userId: string): Promise<BookingWorkflow[]> {
    return db.select().from(bookingWorkflows).where(eq(bookingWorkflows.assignedUserId, userId));
  }

  async getWorkflow(id: string): Promise<BookingWorkflow | undefined> {
    const [wf] = await db.select().from(bookingWorkflows).where(eq(bookingWorkflows.id, id));
    return wf;
  }

  async createWorkflow(data: InsertBookingWorkflow): Promise<BookingWorkflow> {
    const [wf] = await db.insert(bookingWorkflows).values(data).returning();
    return wf;
  }

  async updateWorkflow(id: string, data: Partial<BookingWorkflow>): Promise<BookingWorkflow> {
    const [wf] = await db.update(bookingWorkflows).set({ ...data, updatedAt: new Date() }).where(eq(bookingWorkflows.id, id)).returning();
    return wf;
  }

  async getWorkflowSteps(workflowId: string): Promise<WorkflowStep[]> {
    return db.select().from(workflowSteps).where(eq(workflowSteps.workflowId, workflowId));
  }

  async createWorkflowStep(data: InsertWorkflowStep): Promise<WorkflowStep> {
    const [step] = await db.insert(workflowSteps).values(data).returning();
    return step;
  }

  async updateWorkflowStep(id: string, data: Partial<WorkflowStep>): Promise<WorkflowStep> {
    const [step] = await db.update(workflowSteps).set({ ...data, updatedAt: new Date() }).where(eq(workflowSteps.id, id)).returning();
    return step;
  }

  async getAllDocuments(): Promise<Document[]> {
    return db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocuments(bookingId: string): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.bookingId, bookingId));
  }

  async createDocument(data: InsertDocument): Promise<Document> {
    const [doc] = await db.insert(documents).values(data).returning();
    return doc;
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    const [doc] = await db.update(documents).set(data).where(eq(documents.id, id)).returning();
    return doc;
  }

  async getAllMessages(): Promise<Message[]> {
    return db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async getMessages(bookingId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.bookingId, bookingId)).orderBy(desc(messages.createdAt));
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const [msg] = await db.insert(messages).values(data).returning();
    return msg;
  }

  async getAllPayments(): Promise<Payment[]> {
    return db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPayments(bookingId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.bookingId, bookingId));
  }

  async createPayment(data: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    const [payment] = await db.update(payments).set(data).where(eq(payments.id, id)).returning();
    return payment;
  }

  async getGroupParticipants(leaderBookingId: string): Promise<Booking[]> {
    const leaderBooking = await this.getBooking(leaderBookingId);
    if (!leaderBooking) return [];
    return db.select().from(bookings)
      .where(and(
        eq(bookings.bookingType, "join_leader_group"),
        eq(bookings.leaderUserId, leaderBooking.customerId)
      ))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByLeader(leaderUserId: string): Promise<Booking[]> {
    return db.select().from(bookings)
      .where(eq(bookings.leaderUserId, leaderUserId))
      .orderBy(desc(bookings.createdAt));
  }

  // Countries
  async getAllCountries(): Promise<Country[]> {
    return db.select().from(countries);
  }

  async getCountry(id: string): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.id, id));
    return country;
  }

  async createCountry(data: InsertCountry): Promise<Country> {
    const [country] = await db.insert(countries).values(data).returning();
    return country;
  }

  async updateCountry(id: string, data: Partial<Country>): Promise<Country> {
    const [country] = await db.update(countries).set(data).where(eq(countries.id, id)).returning();
    return country;
  }

  async deleteCountry(id: string): Promise<void> {
    await db.delete(countries).where(eq(countries.id, id));
  }

  async bulkCreateCountries(data: InsertCountry[]): Promise<Country[]> {
    return db.insert(countries).values(data).onConflictDoNothing().returning();
  }

  // Cities
  async getAllCities(): Promise<City[]> {
    return db.select().from(cities);
  }

  async getCity(id: string): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.id, id));
    return city;
  }

  async createCity(data: InsertCity): Promise<City> {
    const [city] = await db.insert(cities).values(data).returning();
    return city;
  }

  async updateCity(id: string, data: Partial<City>): Promise<City> {
    const [city] = await db.update(cities).set(data).where(eq(cities.id, id)).returning();
    return city;
  }

  async deleteCity(id: string): Promise<void> {
    await db.delete(cities).where(eq(cities.id, id));
  }

  async bulkCreateCities(data: InsertCity[]): Promise<City[]> {
    return db.insert(cities).values(data).onConflictDoNothing().returning();
  }

  // Airports
  async getAllAirports(): Promise<Airport[]> {
    return db.select().from(airports);
  }

  async getAirport(id: string): Promise<Airport | undefined> {
    const [airport] = await db.select().from(airports).where(eq(airports.id, id));
    return airport;
  }

  async createAirport(data: InsertAirport): Promise<Airport> {
    const [airport] = await db.insert(airports).values(data).returning();
    return airport;
  }

  async updateAirport(id: string, data: Partial<Airport>): Promise<Airport> {
    const [airport] = await db.update(airports).set(data).where(eq(airports.id, id)).returning();
    return airport;
  }

  async deleteAirport(id: string): Promise<void> {
    await db.delete(airports).where(eq(airports.id, id));
  }

  async bulkCreateAirports(data: InsertAirport[]): Promise<Airport[]> {
    return db.insert(airports).values(data).onConflictDoNothing().returning();
  }

  // Sights
  async getAllSights(): Promise<Sight[]> {
    return db.select().from(sights);
  }

  async getSight(id: string): Promise<Sight | undefined> {
    const [sight] = await db.select().from(sights).where(eq(sights.id, id));
    return sight;
  }

  async createSight(data: InsertSight): Promise<Sight> {
    const [sight] = await db.insert(sights).values(data).returning();
    return sight;
  }

  async updateSight(id: string, data: Partial<Sight>): Promise<Sight> {
    const [sight] = await db.update(sights).set(data).where(eq(sights.id, id)).returning();
    return sight;
  }

  async deleteSight(id: string): Promise<void> {
    await db.delete(sights).where(eq(sights.id, id));
  }

  async bulkCreateSights(data: InsertSight[]): Promise<Sight[]> {
    return db.insert(sights).values(data).onConflictDoNothing().returning();
  }

  // Transport Companies
  async getAllTransportCompanies(): Promise<TransportCompany[]> {
    return db.select().from(transportCompanies);
  }

  async getTransportCompany(id: string): Promise<TransportCompany | undefined> {
    const [company] = await db.select().from(transportCompanies).where(eq(transportCompanies.id, id));
    return company;
  }

  async createTransportCompany(data: InsertTransportCompany): Promise<TransportCompany> {
    const [company] = await db.insert(transportCompanies).values(data).returning();
    return company;
  }

  async updateTransportCompany(id: string, data: Partial<TransportCompany>): Promise<TransportCompany> {
    const [company] = await db.update(transportCompanies).set(data).where(eq(transportCompanies.id, id)).returning();
    return company;
  }

  async deleteTransportCompany(id: string): Promise<void> {
    await db.delete(transportCompanies).where(eq(transportCompanies.id, id));
  }

  async bulkCreateTransportCompanies(data: InsertTransportCompany[]): Promise<TransportCompany[]> {
    return db.insert(transportCompanies).values(data).returning();
  }

  // Airline Agencies
  async getAllAirlineAgencies(): Promise<AirlineAgency[]> {
    return db.select().from(airlineAgencies);
  }

  async getAirlineAgency(id: string): Promise<AirlineAgency | undefined> {
    const [agency] = await db.select().from(airlineAgencies).where(eq(airlineAgencies.id, id));
    return agency;
  }

  async createAirlineAgency(data: InsertAirlineAgency): Promise<AirlineAgency> {
    const [agency] = await db.insert(airlineAgencies).values(data).returning();
    return agency;
  }

  async updateAirlineAgency(id: string, data: Partial<AirlineAgency>): Promise<AirlineAgency> {
    const [agency] = await db.update(airlineAgencies).set(data).where(eq(airlineAgencies.id, id)).returning();
    return agency;
  }

  async deleteAirlineAgency(id: string): Promise<void> {
    await db.delete(airlineAgencies).where(eq(airlineAgencies.id, id));
  }

  async bulkCreateAirlineAgencies(data: InsertAirlineAgency[]): Promise<AirlineAgency[]> {
    return db.insert(airlineAgencies).values(data).returning();
  }

  // Bus Types
  async getBusTypes(companyId: string): Promise<BusType[]> {
    return db.select().from(busTypes).where(eq(busTypes.companyId, companyId));
  }
  async getAllBusTypes(): Promise<BusType[]> {
    return db.select().from(busTypes);
  }
  async createBusType(data: InsertBusType): Promise<BusType> {
    const [bt] = await db.insert(busTypes).values(data).returning();
    return bt;
  }
  async updateBusType(id: string, data: Partial<BusType>): Promise<BusType> {
    const [bt] = await db.update(busTypes).set(data).where(eq(busTypes.id, id)).returning();
    return bt;
  }
  async deleteBusType(id: string): Promise<void> {
    await db.delete(busTypes).where(eq(busTypes.id, id));
  }

  // Transport Routes
  async getTransportRoutes(companyId: string): Promise<TransportRoute[]> {
    return db.select().from(transportRoutes).where(eq(transportRoutes.companyId, companyId));
  }
  async getAllTransportRoutes(): Promise<TransportRoute[]> {
    return db.select().from(transportRoutes);
  }
  async createTransportRoute(data: InsertTransportRoute): Promise<TransportRoute> {
    const [route] = await db.insert(transportRoutes).values(data).returning();
    return route;
  }
  async updateTransportRoute(id: string, data: Partial<TransportRoute>): Promise<TransportRoute> {
    const [route] = await db.update(transportRoutes).set(data).where(eq(transportRoutes.id, id)).returning();
    return route;
  }
  async deleteTransportRoute(id: string): Promise<void> {
    await db.delete(transportRoutes).where(eq(transportRoutes.id, id));
  }

  // Transport Route Pricing
  async getRoutePricing(routeId: string): Promise<TransportRoutePricing[]> {
    return db.select().from(transportRoutePricing).where(eq(transportRoutePricing.routeId, routeId));
  }
  async getAllRoutePricing(): Promise<TransportRoutePricing[]> {
    return db.select().from(transportRoutePricing);
  }
  async createRoutePricing(data: InsertTransportRoutePricing): Promise<TransportRoutePricing> {
    const [pricing] = await db.insert(transportRoutePricing).values(data).returning();
    return pricing;
  }
  async updateRoutePricing(id: string, data: Partial<TransportRoutePricing>): Promise<TransportRoutePricing> {
    const [pricing] = await db.update(transportRoutePricing).set(data).where(eq(transportRoutePricing.id, id)).returning();
    return pricing;
  }
  async deleteRoutePricing(id: string): Promise<void> {
    await db.delete(transportRoutePricing).where(eq(transportRoutePricing.id, id));
  }

  // Transport Bookings
  async getTransportBookings(companyId?: string): Promise<TransportBooking[]> {
    if (companyId) return db.select().from(transportBookings).where(eq(transportBookings.companyId, companyId)).orderBy(desc(transportBookings.createdAt));
    return db.select().from(transportBookings).orderBy(desc(transportBookings.createdAt));
  }
  async getTransportBooking(id: string): Promise<TransportBooking | undefined> {
    const [tb] = await db.select().from(transportBookings).where(eq(transportBookings.id, id));
    return tb;
  }
  async createTransportBooking(data: InsertTransportBooking): Promise<TransportBooking> {
    const [tb] = await db.insert(transportBookings).values(data).returning();
    return tb;
  }
  async updateTransportBooking(id: string, data: Partial<TransportBooking>): Promise<TransportBooking> {
    const [tb] = await db.update(transportBookings).set(data).where(eq(transportBookings.id, id)).returning();
    return tb;
  }

  // Transport Invoices
  async getTransportInvoices(companyId?: string): Promise<TransportInvoice[]> {
    if (companyId) return db.select().from(transportInvoices).where(eq(transportInvoices.companyId, companyId)).orderBy(desc(transportInvoices.submittedAt));
    return db.select().from(transportInvoices).orderBy(desc(transportInvoices.submittedAt));
  }
  async getTransportInvoice(id: string): Promise<TransportInvoice | undefined> {
    const [inv] = await db.select().from(transportInvoices).where(eq(transportInvoices.id, id));
    return inv;
  }
  async createTransportInvoice(data: InsertTransportInvoice): Promise<TransportInvoice> {
    const [inv] = await db.insert(transportInvoices).values(data).returning();
    return inv;
  }
  async updateTransportInvoice(id: string, data: Partial<TransportInvoice>): Promise<TransportInvoice> {
    const [inv] = await db.update(transportInvoices).set(data).where(eq(transportInvoices.id, id)).returning();
    return inv;
  }

  // Transport Payments
  async getTransportPayments(companyId?: string): Promise<TransportPayment[]> {
    if (companyId) return db.select().from(transportPayments).where(eq(transportPayments.companyId, companyId)).orderBy(desc(transportPayments.createdAt));
    return db.select().from(transportPayments).orderBy(desc(transportPayments.createdAt));
  }
  async createTransportPayment(data: InsertTransportPayment): Promise<TransportPayment> {
    const [pmt] = await db.insert(transportPayments).values(data).returning();
    return pmt;
  }
  async updateTransportPayment(id: string, data: Partial<TransportPayment>): Promise<TransportPayment> {
    const [pmt] = await db.update(transportPayments).set(data).where(eq(transportPayments.id, id)).returning();
    return pmt;
  }

  // Hotel Rates
  async getHotelRates(): Promise<HotelRate[]> {
    return db.select().from(hotelRates).orderBy(desc(hotelRates.createdAt));
  }
  async createHotelRate(data: InsertHotelRate): Promise<HotelRate> {
    const [r] = await db.insert(hotelRates).values({ ...data, status: "draft" }).returning();
    return r;
  }
  async bulkCreateHotelRates(data: InsertHotelRate[]): Promise<HotelRate[]> {
    if (!data.length) return [];
    return db.insert(hotelRates).values(data.map(d => ({ ...d, status: "draft" as const }))).returning();
  }
  async updateHotelRate(id: string, data: Partial<HotelRate>): Promise<HotelRate> {
    const [r] = await db.update(hotelRates).set(data).where(eq(hotelRates.id, id)).returning();
    return r;
  }
  async deleteHotelRate(id: string): Promise<void> {
    await db.delete(hotelRates).where(eq(hotelRates.id, id));
  }

  // Transport Rates
  async getTransportRates(): Promise<TransportRate[]> {
    return db.select().from(transportRates).orderBy(desc(transportRates.createdAt));
  }
  async createTransportRate(data: InsertTransportRate): Promise<TransportRate> {
    const [r] = await db.insert(transportRates).values({ ...data, status: "draft" }).returning();
    return r;
  }
  async bulkCreateTransportRates(data: InsertTransportRate[]): Promise<TransportRate[]> {
    if (!data.length) return [];
    return db.insert(transportRates).values(data.map(d => ({ ...d, status: "draft" as const }))).returning();
  }
  async updateTransportRate(id: string, data: Partial<TransportRate>): Promise<TransportRate> {
    const [r] = await db.update(transportRates).set(data).where(eq(transportRates.id, id)).returning();
    return r;
  }
  async deleteTransportRate(id: string): Promise<void> {
    await db.delete(transportRates).where(eq(transportRates.id, id));
  }

  // Guide Rates
  async getGuideRates(): Promise<GuideRate[]> {
    return db.select().from(guideRates).orderBy(desc(guideRates.createdAt));
  }
  async createGuideRate(data: InsertGuideRate): Promise<GuideRate> {
    const [r] = await db.insert(guideRates).values({ ...data, status: "draft" }).returning();
    return r;
  }
  async bulkCreateGuideRates(data: InsertGuideRate[]): Promise<GuideRate[]> {
    if (!data.length) return [];
    return db.insert(guideRates).values(data.map(d => ({ ...d, status: "draft" as const }))).returning();
  }
  async updateGuideRate(id: string, data: Partial<GuideRate>): Promise<GuideRate> {
    const [r] = await db.update(guideRates).set(data).where(eq(guideRates.id, id)).returning();
    return r;
  }
  async deleteGuideRate(id: string): Promise<void> {
    await db.delete(guideRates).where(eq(guideRates.id, id));
  }

  // Sights Rates
  async getSightsRates(): Promise<SightsRate[]> {
    return db.select().from(sightsRates).orderBy(desc(sightsRates.createdAt));
  }
  async createSightsRate(data: InsertSightsRate): Promise<SightsRate> {
    const [r] = await db.insert(sightsRates).values({ ...data, status: "draft" }).returning();
    return r;
  }
  async bulkCreateSightsRates(data: InsertSightsRate[]): Promise<SightsRate[]> {
    if (!data.length) return [];
    return db.insert(sightsRates).values(data.map(d => ({ ...d, status: "draft" as const }))).returning();
  }
  async updateSightsRate(id: string, data: Partial<SightsRate>): Promise<SightsRate> {
    const [r] = await db.update(sightsRates).set(data).where(eq(sightsRates.id, id)).returning();
    return r;
  }
  async deleteSightsRate(id: string): Promise<void> {
    await db.delete(sightsRates).where(eq(sightsRates.id, id));
  }

  // Audit Logs
  async getAuditLogs(entityType: string, entityId: string): Promise<AuditLog[]> {
    return db.select().from(auditLogs)
      .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
      .orderBy(desc(auditLogs.createdAt));
  }
  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(data).returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
