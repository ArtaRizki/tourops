import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  sendNewBookingNotification, 
  sendBookingConfirmedNotification, 
  sendAssignmentNotification,
  sendDocumentStatusNotification,
  sendPaymentStatusNotification
} from "./lib/email";
import { 
  SERVICE_WORKFLOW_STEPS 
} from "./lib/constants";
import { generateCode } from "./lib/utils";
import { setupAuth, isAuthenticated } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  insertTourSchema, insertTourDepartureSchema, insertBookingSchema,
  insertTravelerSchema, insertBookingAssignmentSchema, insertMessageSchema,
  insertDocumentSchema, insertPaymentSchema, insertTourDaySchema,
  insertCountrySchema, insertCitySchema, insertAirportSchema,
  insertSightSchema, insertTransportCompanySchema, insertAirlineAgencySchema,
  insertBusTypeSchema, insertTransportRouteSchema, insertTransportRoutePricingSchema,
  insertTransportBookingSchema, insertTransportInvoiceSchema, insertTransportPaymentSchema,
  insertHotelRateSchema, insertTransportRateSchema, insertGuideRateSchema, insertSightsRateSchema,
  insertBookingWorkflowSchema, insertWorkflowStepSchema,
} from "@shared/schema";

function getUserId(req: Request): string | undefined {
  return req.session?.userId;
}

async function getUserName(req: Request): Promise<string> {
  const userId = req.session?.userId;
  if (!userId) return "User";
  const user = await authStorage.getUser(userId);
  if (user?.firstName) return `${user.firstName} ${user.lastName || ""}`.trim();
  return user?.username || "User";
}

async function canAccessBooking(userId: string, bookingId: string) {
  const booking = await storage.getBooking(bookingId);
  if (!booking) return null;
  if (booking.customerId === userId) return booking;
  if (booking.leaderUserId === userId) return booking;
  return null;
}

async function initializeBookingWorkflows(bookingId: string) {
  const existingWfs = await storage.getWorkflows(bookingId);
  if (existingWfs && existingWfs.length > 0) return; // Prevent duplicate generation

  const services: ("airline" | "hotel" | "transport" | "guide" | "sights")[] = ["airline", "hotel", "transport"];
  
  for (const service of services) {
    const wf = await storage.createWorkflow({
      bookingId,
      serviceType: service,
      status: "not_assigned",
    });

    const steps = [
      { code: "REQ", name: `Request ${service.toUpperCase()} Choice` },
      { code: "CONF", name: "Booking Confirmed with Supplier" },
      { code: "DOC", name: "Issuing Document/Voucher" },
    ];

    for (let i = 0; i < steps.length; i++) {
      await storage.createWorkflowStep({
        workflowId: wf.id,
        stepOrder: i + 1,
        stepCode: steps[i].code,
        stepName: steps[i].name,
        status: "pending",
      });
    }
  }
}

async function requireRole(req: Request, res: Response, roles: string[]): Promise<boolean> {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return false; }
  const profile = await storage.getOrCreateProfile(userId);
  if (!roles.includes(profile.role)) {
    res.status(403).json({ message: "Forbidden: insufficient role" });
    return false;
  }
  return true;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // ---- User Profiles ----
  app.get("/api/user-profile", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getOrCreateProfile(userId);
      res.json(profile);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/user-profiles", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getAllProfiles());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/user-profiles/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const updateSchema = z.object({ role: z.string().optional(), phone: z.string().optional(), companyName: z.string().optional(), countryCode: z.string().optional(), isTourLeader: z.boolean().optional(), isActive: z.boolean().optional() });
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.updateProfile(req.params.id, parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/admin/users", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const createSchema = z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(4),
        firstName: z.string().min(1),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        role: z.string(),
        phone: z.string().optional(),
        companyName: z.string().optional(),
        countryCode: z.string().optional(),
      });
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

      const existing = await authStorage.getUserByUsername(parsed.data.username);
      if (existing) return res.status(409).json({ message: "Username already exists" });

      const passwordHash = await bcrypt.hash(parsed.data.password, 10);
      const user = await authStorage.upsertUser({
        username: parsed.data.username,
        passwordHash,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName || null,
        email: parsed.data.email || null,
      });

      await storage.getOrCreateProfile(user.id);
      const profile = await storage.getProfileByUserId(user.id);
      if (profile) {
        await storage.updateProfile(profile.id, {
          role: parsed.data.role as any,
          phone: parsed.data.phone || null,
          companyName: parsed.data.companyName || null,
          countryCode: parsed.data.countryCode || null,
        });
      }

      res.json({ user: { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, email: user.email }, profile });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/admin/users/:id/password", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const pwSchema = z.object({ password: z.string().min(4) });
      const parsed = pwSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      const passwordHash = await bcrypt.hash(parsed.data.password, 10);
      const user = await authStorage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      await authStorage.upsertUser({ ...user, passwordHash, updatedAt: new Date() });
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Tours ----
  app.get("/api/tours", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getAllTours());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/tours/public", async (_req, res) => {
    try { res.json(await storage.getPublishedTours()); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/tours/:id", async (req, res) => {
    try {
      const tour = await storage.getTour(req.params.id);
      if (!tour) return res.status(404).json({ message: "Tour not found" });
      res.json(tour);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/tours", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const userId = getUserId(req);
      const parsed = insertTourSchema.safeParse({ ...req.body, createdBy: userId });
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createTour(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/tours/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.updateTour(req.params.id, req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.delete("/api/tours/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      await storage.deleteTour(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Tour Days ----
  app.get("/api/tours/:id/days", async (req, res) => {
    try { res.json(await storage.getTourDays(req.params.id)); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/tours/:id/days", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertTourDaySchema.safeParse({ ...req.body, tourId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createTourDay(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/tour-days/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.updateTourDay(req.params.id, req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.delete("/api/tour-days/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      await storage.deleteTourDay(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Departures ----
  app.get("/api/departures", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getAllDepartures());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/tours/:id/departures", async (req, res) => {
    try { res.json(await storage.getDeparturesByTour(req.params.id)); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/departures", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertTourDepartureSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createDeparture(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/departures/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.updateDeparture(req.params.id, req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Bookings ----
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getAllBookings());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      res.json(booking);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const bookingCode = `BK-${generateCode(8)}`;
      const joinCode = req.body.bookingType === "leader_group" ? generateCode(6) : undefined;
      const leaderUserId = (req.body.bookingType === "leader_group" || req.body.bookingType === "private_family") ? userId : undefined;
      const booking = await storage.createBooking({
        ...req.body, customerId: userId, bookingCode, joinCode, leaderUserId,
        status: "submitted" as const, fulfillmentStatus: "pending" as const,
      });

      // Notify Admins
      try {
        const allProfiles = await storage.getAllProfiles();
        const admins = allProfiles.filter(p => p.role === "admin" && p.user?.email);
        const customerProfile = await storage.getProfileByUserIdWithEmail(userId);
        const customerName = customerProfile?.user?.firstName ? `${customerProfile.user.firstName} ${customerProfile.user.lastName || ""}` : (customerProfile?.user?.username || "Pelanggan");
        
        for (const admin of admins) {
          if (admin.user?.email) {
            await sendNewBookingNotification(admin.user.email, booking, customerName);
          }
        }
      } catch (err) {
        console.error("Failed to send admin notifications:", err);
      }

      res.json(booking);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const oldBooking = await storage.getBooking(req.params.id);
      const updated = await storage.updateBooking(req.params.id, req.body);
      
      // Auto-initialize workflows and manage capacity if status changed to confirmed
      if (req.body.status === "confirmed" && oldBooking?.status !== "confirmed") {
        await initializeBookingWorkflows(req.params.id);
        
        // Auto capacity management (deduct seats)
        if (oldBooking && oldBooking.departureId) {
          const departure = await storage.getDeparture(oldBooking.departureId);
          if (departure && departure.availableSeats !== null) {
            const newSeats = Math.max(0, departure.availableSeats - oldBooking.partySizeExpected);
            const newStatus = newSeats === 0 ? "sold_out" : departure.status;
            await storage.updateDeparture(departure.id, {
              availableSeats: newSeats,
              status: newStatus
            });
          }
        }
      } else if ((req.body.status === "cancelled" || req.body.status === "rejected") && oldBooking?.status === "confirmed") {
        // Restore capacity if confirmed booking is cancelled/rejected
        if (oldBooking && oldBooking.departureId) {
          const departure = await storage.getDeparture(oldBooking.departureId);
          if (departure && departure.availableSeats !== null) {
            const newSeats = departure.availableSeats + oldBooking.partySizeExpected;
            const newStatus = departure.status === "sold_out" ? "open" : departure.status;
            await storage.updateDeparture(departure.id, {
              availableSeats: newSeats,
              status: newStatus
            });
          }
        }
      }
      
      res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/bookings/join", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const joinSchema = z.object({ joinCode: z.string().min(1) });
      const parsed = joinSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Join code required" });
      const original = await storage.getBookingByJoinCode(parsed.data.joinCode);
      if (!original) return res.status(404).json({ message: "Invalid join code" });
      const bookingCode = `BK-${generateCode(8)}`;
      const booking = await storage.createBooking({
        tourId: original.tourId, departureId: original.departureId,
        customerId: userId, bookingType: "join_leader_group", bookingCode,
        groupName: original.groupName, leaderUserId: original.customerId,
        partySizeExpected: 1, status: "submitted", fulfillmentStatus: "pending",
      });
      res.json(booking);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Customer booking routes ----
  app.get("/api/my-bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      res.json(await storage.getBookingsByCustomer(userId));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/my-bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.customerId !== userId) return res.status(403).json({ message: "Not your booking" });
      res.json(booking);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/my-bookings/:id/travelers", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.customerId !== userId && booking.leaderUserId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(await storage.getTravelers(req.params.id));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/my-bookings/:id/workflows", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await storage.getBooking(req.params.id);
      if (!booking || booking.customerId !== userId) return res.status(403).json({ message: "Forbidden" });
      res.json(await storage.getWorkflows(req.params.id));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/my-bookings/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await storage.getBooking(req.params.id);
      if (!booking || booking.customerId !== userId) return res.status(403).json({ message: "Forbidden" });
      const msgs = await storage.getMessages(req.params.id);
      res.json(msgs.filter(m => m.visibility === "customer_visible"));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Customer Documents ----
  app.get("/api/my-bookings/:id/documents", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await canAccessBooking(userId, req.params.id);
      if (!booking) return res.status(403).json({ message: "Forbidden" });
      res.json(await storage.getDocuments(req.params.id));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/my-bookings/:id/documents", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await canAccessBooking(userId, req.params.id);
      if (!booking) return res.status(403).json({ message: "Forbidden" });
      const parsed = insertDocumentSchema.safeParse({ ...req.body, bookingId: req.params.id, uploadedBy: userId });
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createDocument(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Customer Payments ----
  app.get("/api/my-bookings/:id/payments", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await canAccessBooking(userId, req.params.id);
      if (!booking) return res.status(403).json({ message: "Forbidden" });
      res.json(await storage.getPayments(req.params.id));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/my-bookings/:id/payments/:paymentId", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await canAccessBooking(userId, req.params.id);
      if (!booking) return res.status(403).json({ message: "Forbidden" });
      
      const payments = await storage.getPayments(req.params.id);
      const targetPayment = payments.find(p => p.id === req.params.paymentId);
      if (!targetPayment) return res.status(404).json({ message: "Payment not found" });

      const updated = await storage.updatePayment(req.params.paymentId, {
        receiptUrl: req.body.receiptUrl,
        notes: req.body.notes,
      });

      res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Leader Group Participants ----
  app.get("/api/my-bookings/:id/participants", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.customerId !== userId || booking.bookingType !== "leader_group") {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(await storage.getGroupParticipants(req.params.id));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/my-bookings/:id/participants/:participantBookingId/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.customerId !== userId || booking.bookingType !== "leader_group") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const participant = await storage.getBooking(req.params.participantBookingId);
      if (!participant) return res.status(404).json({ message: "Participant booking not found" });
      if (participant.leaderUserId !== userId) {
        return res.status(403).json({ message: "Forbidden: not your participant" });
      }
      const updated = await storage.updateBooking(req.params.participantBookingId, { status: "cancelled" });
      res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Leader Dashboard ----
  app.get("/api/leader/dashboard", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const leaderBookings = await storage.getBookingsByLeader(userId);
      const ownBookings = await storage.getBookingsByCustomer(userId);
      const allBookings = [...ownBookings];
      for (const lb of leaderBookings) {
        if (!allBookings.find(b => b.id === lb.id)) {
          allBookings.push(lb);
        }
      }
      let missingDocs = 0;
      let pendingPayments = 0;
      let unreadMessages = 0;
      for (const b of allBookings) {
        const docs = await storage.getDocuments(b.id);
        const travelersList = await storage.getTravelers(b.id);
        if (travelersList.length > 0 && docs.length === 0) missingDocs++;
        const pays = await storage.getPayments(b.id);
        pendingPayments += pays.filter(p => p.status === "pending").length;
        const msgs = await storage.getMessages(b.id);
        unreadMessages += msgs.filter(m => m.visibility === "customer_visible").length;
      }
      res.json({
        bookings: allBookings,
        alerts: { missingDocs, pendingPayments, unreadMessages },
      });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Leader Payments Report ----
  app.get("/api/leader/payments", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const leaderBookings = await storage.getBookingsByLeader(userId);
      const ownBookings = await storage.getBookingsByCustomer(userId);
      const allBookings = [...ownBookings];
      for (const lb of leaderBookings) {
        if (!allBookings.find(b => b.id === lb.id)) allBookings.push(lb);
      }
      const result: any[] = [];
      for (const b of allBookings) {
        const pays = await storage.getPayments(b.id);
        const travelersList = await storage.getTravelers(b.id);
        const isLeaderBooking = b.customerId === userId;
        const customerProfile = await storage.getOrCreateProfile(b.customerId);
        for (const p of pays) {
          result.push({
            ...p,
            bookingCode: b.bookingCode,
            groupName: b.groupName,
            bookingType: b.bookingType,
            travelers: travelersList.map(t => `${t.firstName} ${t.lastName}`),
            paidBy: isLeaderBooking ? "Leader" : (customerProfile?.displayName || customerProfile?.username || "Participant"),
            isLeaderPayment: isLeaderBooking,
          });
        }
      }
      res.json(result);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Travelers ----
  app.get("/api/bookings/:id/travelers", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getTravelers(req.params.id));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/bookings/:id/travelers", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      const profile = await storage.getOrCreateProfile(userId);
      const isOwner = booking.customerId === userId;
      const isAdmin = profile.role === "admin";
      const isLeaderOfGroup = booking.leaderUserId === userId;
      if (!isOwner && !isAdmin && !isLeaderOfGroup) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const parsed = insertTravelerSchema.safeParse({ ...req.body, bookingId: req.params.id });
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createTraveler(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/bookings/:id/travelers/bulk", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      const profile = await storage.getOrCreateProfile(userId);
      const isOwner = booking.customerId === userId;
      const isAdmin = profile.role === "admin";
      const isLeaderOfGroup = booking.leaderUserId === userId;
      if (!isOwner && !isAdmin && !isLeaderOfGroup) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const travelers = req.body.travelers;
      if (!Array.isArray(travelers)) {
        return res.status(400).json({ message: "Expected an array of travelers" });
      }

      const results = [];
      for (const tData of travelers) {
        const parsed = insertTravelerSchema.safeParse({ ...tData, bookingId: req.params.id });
        if (parsed.success) {
          results.push(await storage.createTraveler(parsed.data));
        }
      }
      res.json({ success: true, inserted: results.length });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/travelers/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.updateTraveler(req.params.id, req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.delete("/api/travelers/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      await storage.deleteTraveler(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/my-travelers/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const traveler = await storage.getTraveler(req.params.id);
      if (!traveler) return res.status(404).json({ message: "Traveler not found" });
      const booking = await storage.getBooking(traveler.bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.customerId !== userId && booking.leaderUserId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(await storage.updateTraveler(req.params.id, req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.delete("/api/my-travelers/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const traveler = await storage.getTraveler(req.params.id);
      if (!traveler) return res.status(404).json({ message: "Traveler not found" });
      const booking = await storage.getBooking(traveler.bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.customerId !== userId && booking.leaderUserId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteTraveler(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Assignments ----
  app.get("/api/assignments", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getAllAssignments());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/bookings/:id/assignments", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getAssignments(req.params.id));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/bookings/:id/assignments", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const userId = getUserId(req);
      const assignData = { ...req.body, bookingId: req.params.id, assignedBy: userId };
      const assignment = await storage.createAssignment(assignData);

      const wf = await storage.createWorkflow({
        bookingId: req.params.id, countryCode: req.body.countryCode,
        serviceType: req.body.serviceType, assignedUserId: req.body.assignedUserId,
        status: "assigned",
      });

      const steps = SERVICE_WORKFLOW_STEPS[req.body.serviceType] || [];
      for (let i = 0; i < steps.length; i++) {
        await storage.createWorkflowStep({
          workflowId: wf.id, stepOrder: i + 1,
          stepCode: steps[i].code, stepName: steps[i].name, status: "pending",
        });
      }
      if (steps.length > 0) {
        await storage.updateWorkflow(wf.id, { currentStep: steps[0].name });
      }

      res.json({ success: true, message: "Booking confirmed and workflows initialized" });

      // Run notifications in background (don't wait for res)
      (async () => {
        try {
          const booking = await storage.getBooking(req.params.id);
          if (!booking) return;
          // Notify Customer
          const customerProfile = await storage.getProfileByUserIdWithEmail(booking.customerId);
          if (customerProfile?.user?.email) {
            await sendBookingConfirmedNotification(customerProfile.user.email, booking);
          }

          // Notify Assigned Staff
          // We need latest workflows and assignments created in the route
          const workflows = await storage.getWorkflows(req.params.id);
          for (const wf of workflows) {
            if (wf.assignedUserId) {
              const staffProfile = await storage.getProfileByUserIdWithEmail(wf.assignedUserId);
              if (staffProfile?.user?.email) {
                await sendAssignmentNotification(
                  staffProfile.user.email, 
                  wf.serviceType, 
                  booking.bookingCode, 
                  wf.id
                );
              }
            }
          }
        } catch (err) {
          console.error("Post-confirmation background notifications failed:", err);
        }
      })();
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/assignments/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.updateAssignment(req.params.id, req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.delete("/api/assignments/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      await storage.deleteAssignment(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Workflows ----
  app.get("/api/workflows", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getAllWorkflows());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/bookings/:id/workflows", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getWorkflows(req.params.id));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/workflows/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const wf = await storage.getWorkflow(req.params.id);
      if (!wf) return res.status(404).json({ message: "Workflow not found" });
      res.json(wf);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/workflows/:id/steps", isAuthenticated, async (req, res) => {
    try { res.json(await storage.getWorkflowSteps(req.params.id)); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/workflows/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getOrCreateProfile(userId);
      const wf = await storage.getWorkflow(req.params.id);
      if (!wf) return res.status(404).json({ message: "Workflow not found" });
      if (profile.role === "admin" || wf.assignedUserId === userId) {
        res.json(await storage.updateWorkflow(req.params.id, req.body));
      } else {
        res.status(403).json({ message: "Forbidden" });
      }
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/workflow-steps/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      res.json(await storage.updateWorkflowStep(req.params.id, { ...req.body, updatedBy: userId }));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Documents ----
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getAllDocuments());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/bookings/:id/documents", isAuthenticated, async (req, res) => {
    try { res.json(await storage.getDocuments(req.params.id)); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/bookings/:id/documents", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const parsed = insertDocumentSchema.safeParse({ ...req.body, bookingId: req.params.id, uploadedBy: userId });
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createDocument(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const userId = getUserId(req);
      const updated = await storage.updateDocument(req.params.id, { ...req.body, reviewedBy: userId });
      
      // Notify customer about document status update
      try {
        const booking = await storage.getBooking(updated.bookingId);
        if (booking) {
          const customer = await authStorage.getUser(booking.customerId);
          if (customer?.email) {
            await sendDocumentStatusNotification(
              customer.email,
              booking.bookingCode,
              updated.docType,
              updated.status || "updated",
              updated.reviewNotes || undefined
            );
          }
        }
      } catch (err) {
        console.error("Failed to send document status notification:", err);
      }

      res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Messages ----
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getAllMessages());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/bookings/:id/messages", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getMessages(req.params.id));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/bookings/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const msgSchema = z.object({ messageText: z.string().min(1), visibility: z.string().optional() });
      const parsed = msgSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createMessage({
        ...parsed.data, bookingId: req.params.id,
        senderUserId: userId, senderName: await getUserName(req),
        visibility: (parsed.data.visibility as any) || "customer_visible",
      }));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Payments ----
  app.get("/api/payments", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getAllPayments());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/bookings/:id/payments", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.getPayments(req.params.id));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/bookings/:id/payments", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const userId = getUserId(req);
      const parsed = insertPaymentSchema.safeParse({ ...req.body, bookingId: req.params.id, createdBy: userId });
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createPayment(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/payments/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const updated = await storage.updatePayment(req.params.id, req.body);
      
      // Notify customer if payment is confirmed as paid
      if (req.body.status === "paid") {
        try {
          const booking = await storage.getBooking(updated.bookingId);
          if (booking) {
            const customer = await authStorage.getUser(booking.customerId);
            if (customer?.email) {
              await sendPaymentStatusNotification(
                customer.email,
                booking.bookingCode,
                updated.amount.toString(),
                updated.currency || "USD"
              );
            }
          }
        } catch (err) {
          console.error("Failed to send payment status notification:", err);
        }
      }

      res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Supplier/Ops ----
  const SUPPLIER_ROLES = ["airline_supplier", "hotel_manager", "transport_manager", "guide_manager", "sights_manager", "admin"];

  app.get("/api/supplier/workflows", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getOrCreateProfile(userId);
      if (!SUPPLIER_ROLES.includes(profile.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(await storage.getWorkflowsByUser(userId));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/supplier/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getOrCreateProfile(userId);
      if (!SUPPLIER_ROLES.includes(profile.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });

      // Verify supplier is assigned to at least one workflow for this booking
      const workflows = await storage.getWorkflows(req.params.id);
      const isAssigned = workflows.some(w => w.assignedUserId === userId);
      if (!isAssigned && profile.role !== "admin") {
        return res.status(403).json({ message: "Access denied to this booking" });
      }

      const travelers = await storage.getTravelers(req.params.id);
      const allDocuments = await storage.getDocuments(req.params.id);
      // Filter documents: supplier sees their own uploads or all if admin
      const documents = profile.role === "admin" 
        ? allDocuments 
        : allDocuments.filter(d => d.uploadedBy === userId);
      
      res.json({ ...booking, travelers, documents });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/supplier/bookings/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getOrCreateProfile(userId);
      if (!SUPPLIER_ROLES.includes(profile.role)) return res.status(403).json({ message: "Forbidden" });

      const workflows = await storage.getWorkflows(req.params.id);
      const isAssigned = workflows.some(w => w.assignedUserId === userId);
      if (!isAssigned && profile.role !== "admin") return res.status(403).json({ message: "Access denied" });

      const allMessages = await storage.getMessages(req.params.id);
      res.json(allMessages.filter(m => m.visibility === "internal_only" || m.senderUserId === userId));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/supplier/bookings/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getOrCreateProfile(userId);
      if (!SUPPLIER_ROLES.includes(profile.role)) return res.status(403).json({ message: "Forbidden" });

      const workflows = await storage.getWorkflows(req.params.id);
      const isAssigned = workflows.some(w => w.assignedUserId === userId);
      if (!isAssigned && profile.role !== "admin") return res.status(403).json({ message: "Access denied" });

      const { messageText } = req.body;
      const message = await storage.createMessage({
        bookingId: req.params.id,
        senderUserId: userId,
        senderName: await getUserName(req),
        messageText,
        visibility: "internal_only",
      });
      res.json(message);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/supplier/workflows/:id/documents", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getOrCreateProfile(userId);
      if (!SUPPLIER_ROLES.includes(profile.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const wf = await storage.getWorkflow(req.params.id);
      if (!wf) return res.status(404).json({ message: "Workflow not found" });
      if (wf.assignedUserId !== userId && profile.role !== "admin") {
        return res.status(403).json({ message: "Not assigned to this workflow" });
      }

      const { fileName, fileUrl, docType } = req.body;
      const document = await storage.createDocument({
        bookingId: wf.bookingId || "",
        travelerId: null,
        workflowStepId: null,
        docType: docType || "other",
        fileName,
        fileUrl,
        uploadedBy: userId,
        status: "uploaded"
      });

      res.json(document);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/ops/workflows", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getOrCreateProfile(userId);
      const opsRoles = ["country_manager", "hotel_manager", "transport_manager", "guide_manager", "sights_manager", "admin"];
      if (!opsRoles.includes(profile.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(await storage.getWorkflowsByUser(userId));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Master Data: Countries ----
  app.get("/api/master/countries", isAuthenticated, async (_req, res) => {
    try { res.json(await storage.getAllCountries()); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/master/countries", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertCountrySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createCountry(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/master/countries/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertCountrySchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.updateCountry(req.params.id, parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/master/countries/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      await storage.deleteCountry(req.params.id);
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  function coerceBooleans(rows: any[], boolFields: string[]) {
    return rows.map(row => {
      const r = { ...row };
      for (const f of boolFields) {
        if (f in r && typeof r[f] === "string") {
          r[f] = r[f] === "true" || r[f] === "1" || r[f].toLowerCase() === "active";
        }
      }
      return r;
    });
  }

  app.post("/api/master/countries/import", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const data = coerceBooleans(req.body, ["isActive"]);
      const rows = z.array(insertCountrySchema).safeParse(data);
      if (!rows.success) return res.status(400).json({ message: rows.error.message });
      res.json(await storage.bulkCreateCountries(rows.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Master Data: Cities ----
  app.get("/api/master/cities", isAuthenticated, async (_req, res) => {
    try { res.json(await storage.getAllCities()); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/master/cities", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertCitySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createCity(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/master/cities/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertCitySchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.updateCity(req.params.id, parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/master/cities/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      await storage.deleteCity(req.params.id);
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/master/cities/import", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const allCountries = await storage.getAllCountries();
      const countryNameMap = new Map<string, string>();
      for (const c of allCountries) countryNameMap.set(c.name.toLowerCase(), c.id);

      const rawData = coerceBooleans(req.body, ["isActive", "isAirportCity"]);
      const resolved = [];
      const skipped: string[] = [];
      for (const row of rawData) {
        if (row.countryName) {
          const cid = countryNameMap.get(row.countryName.toLowerCase());
          if (cid) {
            const { countryName, ...rest } = row;
            resolved.push({ ...rest, countryId: cid });
          } else {
            skipped.push(row.countryName);
          }
        } else if (row.countryId) {
          resolved.push(row);
        } else {
          skipped.push(row.name || "unknown");
        }
      }
      if (resolved.length === 0) {
        return res.status(400).json({ message: `No cities could be matched to existing countries. Make sure countries are imported first. Unmatched: ${[...new Set(skipped)].slice(0, 10).join(", ")}${skipped.length > 10 ? "..." : ""}` });
      }
      const rows = z.array(insertCitySchema).safeParse(resolved);
      if (!rows.success) return res.status(400).json({ message: rows.error.message });
      const result = await storage.bulkCreateCities(rows.data);
      const response: any = Array.isArray(result) ? result : [result];
      if (skipped.length > 0) {
        return res.json({ imported: response.length, skipped: skipped.length, skippedSample: [...new Set(skipped)].slice(0, 10) });
      }
      res.json(response);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Master Data: Airports ----
  app.get("/api/master/airports", isAuthenticated, async (_req, res) => {
    try { res.json(await storage.getAllAirports()); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/master/airports", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertAirportSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createAirport(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/master/airports/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertAirportSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.updateAirport(req.params.id, parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/master/airports/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      await storage.deleteAirport(req.params.id);
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/master/airports/import", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const allCities = await storage.getAllCities();
      const cityNameMap = new Map<string, string>();
      for (const c of allCities) cityNameMap.set(c.name.toLowerCase(), c.id);

      const rawData = coerceBooleans(req.body, ["isActive"]);
      const resolved = [];
      const skipped: string[] = [];
      for (const row of rawData) {
        if (row.cityId && cityNameMap.has("_")) {
          resolved.push(row);
        } else if (row.cityName) {
          const cid = cityNameMap.get(row.cityName.toLowerCase());
          if (cid) {
            const { cityName, ...rest } = row;
            resolved.push({ ...rest, cityId: cid });
          } else {
            skipped.push(row.cityName);
          }
        } else if (row.cityId) {
          resolved.push(row);
        } else {
          skipped.push(row.code || "unknown");
        }
      }
      if (resolved.length === 0) {
        return res.status(400).json({ message: `No airports could be matched to existing cities. Make sure cities are imported first. Unmatched: ${[...new Set(skipped)].slice(0, 10).join(", ")}${skipped.length > 10 ? "..." : ""}` });
      }
      const rows = z.array(insertAirportSchema).safeParse(resolved);
      if (!rows.success) return res.status(400).json({ message: rows.error.message });
      const result = await storage.bulkCreateAirports(rows.data);
      const response: any = Array.isArray(result) ? result : [result];
      if (skipped.length > 0) {
        return res.json({ imported: response.length, skipped: skipped.length, skippedSample: [...new Set(skipped)].slice(0, 10) });
      }
      res.json(response);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Master Data: Sights ----
  app.get("/api/master/sights", isAuthenticated, async (_req, res) => {
    try { res.json(await storage.getAllSights()); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/master/sights", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertSightSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createSight(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/master/sights/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertSightSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.updateSight(req.params.id, parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/master/sights/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      await storage.deleteSight(req.params.id);
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/master/sights/import", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const validCategories = ["museum", "landmark", "park", "religious", "entertainment", "nature", "historical", "other"];
      const categoryMap: Record<string, string> = {
        "cultural": "landmark", "historical": "historical", "religious": "religious",
        "natural": "nature", "nature": "nature", "museum": "museum", "landmark": "landmark",
        "park": "park", "entertainment": "entertainment", "other": "other",
      };

      const allCities = await storage.getAllCities();
      const cityNameMap = new Map<string, string>();
      for (const c of allCities) cityNameMap.set(c.name.toLowerCase(), c.id);

      const allCountries = await storage.getAllCountries();
      const countryNameMap = new Map<string, string>();
      for (const co of allCountries) countryNameMap.set(co.name.toLowerCase(), co.id);

      const rawData = coerceBooleans(req.body, ["isActive", "ticketRequired"]);
      const resolved = [];
      const skipped: string[] = [];
      const createdCities: string[] = [];
      for (const row of rawData) {
        if (row.category) {
          const mapped = categoryMap[row.category.toLowerCase()];
          row.category = mapped || "other";
        }
        let cityId = row.cityId;
        if (row.cityName) {
          const cid = cityNameMap.get(row.cityName.toLowerCase());
          if (cid) {
            cityId = cid;
          } else {
            const countryName = row.countryName || row.country;
            const countryId = countryName ? countryNameMap.get(countryName.toLowerCase()) : (allCountries.length === 1 ? allCountries[0].id : null);
            if (!countryId) {
              const defaultCountry = countryNameMap.get("jordan") || (allCountries.length > 0 ? allCountries[0].id : null);
              if (defaultCountry) {
                const newCity = await storage.createCity({ name: row.cityName, countryId: defaultCountry, isActive: true });
                cityNameMap.set(row.cityName.toLowerCase(), newCity.id);
                cityId = newCity.id;
                createdCities.push(row.cityName);
              } else {
                skipped.push(`${row.name || "unknown"} (city: ${row.cityName})`);
                continue;
              }
            } else {
              const newCity = await storage.createCity({ name: row.cityName, countryId, isActive: true });
              cityNameMap.set(row.cityName.toLowerCase(), newCity.id);
              cityId = newCity.id;
              createdCities.push(row.cityName);
            }
          }
          delete row.cityName;
          delete row.countryName;
          delete row.country;
        }
        if (!cityId) {
          skipped.push(row.name || "unknown");
          continue;
        }
        row.cityId = cityId;
        resolved.push(row);
      }
      if (resolved.length === 0) {
        return res.status(400).json({ message: `No sights could be imported. Check your CSV format.` });
      }
      const rows = z.array(insertSightSchema).safeParse(resolved);
      if (!rows.success) return res.status(400).json({ message: rows.error.message });
      const result = await storage.bulkCreateSights(rows.data);
      const response: any = Array.isArray(result) ? result : [result];
      const result2: any = { imported: response.length };
      if (createdCities.length > 0) result2.citiesCreated = createdCities.length;
      if (skipped.length > 0) { result2.skipped = skipped.length; result2.skippedSample = [...new Set(skipped)].slice(0, 10); }
      res.json(result2);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Master Data: Transport Companies ----
  app.get("/api/master/transport-companies", isAuthenticated, async (_req, res) => {
    try { res.json(await storage.getAllTransportCompanies()); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/master/transport-companies", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertTransportCompanySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createTransportCompany(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/master/transport-companies/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertTransportCompanySchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.updateTransportCompany(req.params.id, parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/master/transport-companies/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      await storage.deleteTransportCompany(req.params.id);
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/master/transport-companies/import", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const data = coerceBooleans(req.body, ["isActive"]);
      const rows = z.array(insertTransportCompanySchema).safeParse(data);
      if (!rows.success) return res.status(400).json({ message: rows.error.message });
      res.json(await storage.bulkCreateTransportCompanies(rows.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Master Data: Airline Agencies ----
  app.get("/api/master/airline-agencies", isAuthenticated, async (_req, res) => {
    try { res.json(await storage.getAllAirlineAgencies()); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/master/airline-agencies", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertAirlineAgencySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createAirlineAgency(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/master/airline-agencies/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertAirlineAgencySchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.updateAirlineAgency(req.params.id, parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/master/airline-agencies/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      await storage.deleteAirlineAgency(req.params.id);
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/master/airline-agencies/import", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const data = coerceBooleans(req.body, ["isActive"]);
      const rows = z.array(insertAirlineAgencySchema).safeParse(data);
      if (!rows.success) return res.status(400).json({ message: rows.error.message });
      res.json(await storage.bulkCreateAirlineAgencies(rows.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Helper: get transport manager's company ID (returns null for admin, enforces scope for transport_manager)
  async function getTransportScope(req: Request, res: Response): Promise<{ companyId: string | undefined; isAdmin: boolean } | null> {
    const userId = (req as any).user?.id;
    if (!userId) { res.status(401).json({ message: "Unauthorized" }); return null; }
    const profile = await storage.getProfileByUserId(userId);
    if (!profile) { res.status(403).json({ message: "No profile" }); return null; }
    if (profile.role === "admin") return { companyId: req.query.companyId as string | undefined, isAdmin: true };
    if (profile.role === "transport_manager") {
      if (!profile.transportCompanyId) { res.status(403).json({ message: "Not linked to a transport company" }); return null; }
      return { companyId: profile.transportCompanyId, isAdmin: false };
    }
    res.status(403).json({ message: "Forbidden" }); return null;
  }

  // ---- Transport: Bus Types ----
  app.get("/api/transport/bus-types", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      if (scope.companyId) res.json(await storage.getBusTypes(scope.companyId));
      else if (scope.isAdmin) res.json(await storage.getAllBusTypes());
      else res.json([]);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/transport/bus-types", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      const parsed = insertBusTypeSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      if (!scope.isAdmin && parsed.data.companyId !== scope.companyId) return res.status(403).json({ message: "Cannot create for another company" });
      res.json(await storage.createBusType(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/transport/bus-types/:id", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      res.json(await storage.updateBusType(req.params.id, req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/transport/bus-types/:id", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      await storage.deleteBusType(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Transport: Routes ----
  app.get("/api/transport/routes", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      if (scope.companyId) res.json(await storage.getTransportRoutes(scope.companyId));
      else if (scope.isAdmin) res.json(await storage.getAllTransportRoutes());
      else res.json([]);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/transport/routes", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      const parsed = insertTransportRouteSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      if (!scope.isAdmin && parsed.data.companyId !== scope.companyId) return res.status(403).json({ message: "Cannot create for another company" });
      res.json(await storage.createTransportRoute(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/transport/routes/:id", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      res.json(await storage.updateTransportRoute(req.params.id, req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/transport/routes/:id", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      await storage.deleteTransportRoute(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Transport: Route Pricing ----
  app.get("/api/transport/route-pricing", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      const routeId = req.query.routeId as string | undefined;
      if (routeId) res.json(await storage.getRoutePricing(routeId));
      else if (scope.isAdmin) res.json(await storage.getAllRoutePricing());
      else res.json([]);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/transport/route-pricing", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      const parsed = insertTransportRoutePricingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createRoutePricing(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/transport/route-pricing/:id", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      res.json(await storage.updateRoutePricing(req.params.id, req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/transport/route-pricing/:id", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      await storage.deleteRoutePricing(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Transport: Bookings ----
  app.get("/api/transport/bookings", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      res.json(await storage.getTransportBookings(scope.companyId));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.get("/api/transport/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      const tb = await storage.getTransportBooking(req.params.id);
      if (!tb) return res.status(404).json({ message: "Not found" });
      if (!scope.isAdmin && tb.companyId !== scope.companyId) return res.status(403).json({ message: "Forbidden" });
      res.json(tb);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/transport/bookings", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      const parsed = insertTransportBookingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      if (!scope.isAdmin && parsed.data.companyId !== scope.companyId) return res.status(403).json({ message: "Cannot create for another company" });
      res.json(await storage.createTransportBooking(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/transport/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      const existing = await storage.getTransportBooking(req.params.id);
      if (!existing) return res.status(404).json({ message: "Not found" });
      if (!scope.isAdmin && existing.companyId !== scope.companyId) return res.status(403).json({ message: "Forbidden" });
      const data = { ...req.body };
      if (data.status === "confirmed" && !data.confirmedAt) {
        data.confirmedAt = new Date();
      }
      res.json(await storage.updateTransportBooking(req.params.id, data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Transport: Invoices ----
  app.get("/api/transport/invoices", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      res.json(await storage.getTransportInvoices(scope.companyId));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/transport/invoices", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      const parsed = insertTransportInvoiceSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      if (!scope.isAdmin && parsed.data.companyId !== scope.companyId) return res.status(403).json({ message: "Cannot create for another company" });
      res.json(await storage.createTransportInvoice(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/transport/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const data = { ...req.body };
      if (data.status === "approved" && !data.approvedAt) {
        data.approvedAt = new Date();
      }
      res.json(await storage.updateTransportInvoice(req.params.id, data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Transport: Payments ----
  app.get("/api/transport/payments", isAuthenticated, async (req, res) => {
    try {
      const scope = await getTransportScope(req, res);
      if (!scope) return;
      res.json(await storage.getTransportPayments(scope.companyId));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/transport/payments", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      const parsed = insertTransportPaymentSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createTransportPayment(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/transport/payments/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin"])) return;
      res.json(await storage.updateTransportPayment(req.params.id, req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  const validRateStatuses = ["draft", "active", "archived"] as const;
  function sanitizeRateUpdate(body: any) {
    const { id, createdAt, ...rest } = body;
    if (rest.status && !validRateStatuses.includes(rest.status)) {
      return null;
    }
    return rest;
  }

  // ---- Rate Cards: Hotel Rates ----
  app.get("/api/rates/hotel", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      res.json(await storage.getHotelRates());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/rates/hotel", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const parsed = insertHotelRateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createHotelRate(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/rates/hotel/bulk", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const rows = z.array(insertHotelRateSchema).safeParse(req.body);
      if (!rows.success) return res.status(400).json({ message: rows.error.message });
      res.json(await storage.bulkCreateHotelRates(rows.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/rates/hotel/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const data = sanitizeRateUpdate(req.body);
      if (!data) return res.status(400).json({ message: "Invalid status value" });
      res.json(await storage.updateHotelRate(req.params.id, data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/rates/hotel/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      await storage.deleteHotelRate(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Rate Cards: Transport Rates ----
  app.get("/api/rates/transport", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      res.json(await storage.getTransportRates());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/rates/transport", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const parsed = insertTransportRateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createTransportRate(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/rates/transport/bulk", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const rows = z.array(insertTransportRateSchema).safeParse(req.body);
      if (!rows.success) return res.status(400).json({ message: rows.error.message });
      res.json(await storage.bulkCreateTransportRates(rows.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/rates/transport/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const data = sanitizeRateUpdate(req.body);
      if (!data) return res.status(400).json({ message: "Invalid status value" });
      res.json(await storage.updateTransportRate(req.params.id, data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/rates/transport/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      await storage.deleteTransportRate(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Rate Cards: Guide Rates ----
  app.get("/api/rates/guide", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      res.json(await storage.getGuideRates());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/rates/guide", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const parsed = insertGuideRateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createGuideRate(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/rates/guide/bulk", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const rows = z.array(insertGuideRateSchema).safeParse(req.body);
      if (!rows.success) return res.status(400).json({ message: rows.error.message });
      res.json(await storage.bulkCreateGuideRates(rows.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/rates/guide/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const data = sanitizeRateUpdate(req.body);
      if (!data) return res.status(400).json({ message: "Invalid status value" });
      res.json(await storage.updateGuideRate(req.params.id, data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/rates/guide/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      await storage.deleteGuideRate(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- Rate Cards: Sights Rates ----
  app.get("/api/rates/sights", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      res.json(await storage.getSightsRates());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/rates/sights", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const parsed = insertSightsRateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      res.json(await storage.createSightsRate(parsed.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/rates/sights/bulk", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const rows = z.array(insertSightsRateSchema).safeParse(req.body);
      if (!rows.success) return res.status(400).json({ message: rows.error.message });
      res.json(await storage.bulkCreateSightsRates(rows.data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/rates/sights/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      const data = sanitizeRateUpdate(req.body);
      if (!data) return res.status(400).json({ message: "Invalid status value" });
      res.json(await storage.updateSightsRate(req.params.id, data));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/rates/sights/:id", isAuthenticated, async (req, res) => {
    try {
      if (!await requireRole(req, res, ["admin", "country_manager"])) return;
      await storage.deleteSightsRate(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Seed default admin user if none exists
  try {
    const existingAdmin = await authStorage.getUserByUsername("admin");
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("admin123", 10);
      const adminUser = await authStorage.upsertUser({
        username: "admin",
        passwordHash,
        firstName: "System",
        lastName: "Admin",
        email: "admin@tourops.com",
      });
      const profile = await storage.getOrCreateProfile(adminUser.id);
      if (profile.role !== "admin") {
        await storage.updateProfile(profile.id, { role: "admin" });
      }
      console.log("Default admin user created: username=admin, password=admin123");
    }
  } catch (e) {
    console.error("Error seeding admin:", e);
  }

  // ---- Notification Counts ----
  app.get("/api/notifications/counts", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getProfileByUserId(userId);
      const role = profile?.role;

      if (role === "admin") {
        const allDocs = await storage.getAllDocuments();
        const allPayments = await storage.getAllPayments();
        const allWorkflows = await storage.getAllWorkflows();

        res.json({
          documents: allDocs.filter(d => d.status === "uploaded").length,
          payments: allPayments.filter(p => p.status === "pending").length,
          workflows: allWorkflows.filter(w => w.status === "blocked").length,
        });
      } else {
        const myBookings = await storage.getBookingsByCustomer(userId);
        let docsCount = 0;
        let paymentsCount = 0;
        
        for (const b of myBookings) {
          const docs = await storage.getDocuments(b.id);
          docsCount += docs.filter(d => d.status === "rejected").length;
          const pays = await storage.getPayments(b.id);
          paymentsCount += pays.filter(p => p.status === "pending").length;
        }

        res.json({
          documents: docsCount,
          payments: paymentsCount,
        });
      }
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  return httpServer;
}
