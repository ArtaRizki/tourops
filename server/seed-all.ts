import { db } from "./db";
import { users } from "../shared/models/auth";
import {
  userProfiles, tours, tourDays, tourDepartures,
  bookings, travelers, bookingAssignments, bookingWorkflows, workflowSteps,
  documents, messages, payments,
  countries, cities, sights, hotels,
  transportCompanies, airlineAgencies,
} from "../shared/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

function genCode(len: number) { return crypto.randomBytes(len).toString("hex").toUpperCase().slice(0, len); }
function bookingCode() { return `BK-${genCode(8)}`; }

async function seedAll() {
  console.log("🌱 Starting FULL seeder (all entities)...\n");

  // ===== 1. Countries =====
  console.log("📍 Seeding Countries...");
  const countryData = [
    { code: "ID", iso3: "IDN", name: "Indonesia", capitalCity: "Jakarta", continent: "Asia", region: "South-Eastern Asia" },
    { code: "JP", iso3: "JPN", name: "Japan", capitalCity: "Tokyo", continent: "Asia", region: "Eastern Asia" },
    { code: "TR", iso3: "TUR", name: "Turkey", capitalCity: "Ankara", continent: "Asia", region: "Western Asia" },
    { code: "SA", iso3: "SAU", name: "Saudi Arabia", capitalCity: "Riyadh", continent: "Asia", region: "Western Asia" },
    { code: "EG", iso3: "EGY", name: "Egypt", capitalCity: "Cairo", continent: "Africa", region: "Northern Africa" },
  ];
  const insertedCountries: any[] = [];
  for (const c of countryData) {
    const existing = await db.select().from(countries).where(eq(countries.code, c.code));
    if (existing.length === 0) {
      const [inserted] = await db.insert(countries).values(c).returning();
      insertedCountries.push(inserted);
    } else {
      insertedCountries.push(existing[0]);
    }
  }
  console.log(`  ✓ ${insertedCountries.length} countries ready`);

  // ===== 2. Cities =====
  console.log("🏙️ Seeding Cities...");
  const cityData = [
    { name: "Denpasar", countryId: insertedCountries[0].id },
    { name: "Ubud", countryId: insertedCountries[0].id },
    { name: "Tokyo", countryId: insertedCountries[1].id },
    { name: "Kyoto", countryId: insertedCountries[1].id },
    { name: "Istanbul", countryId: insertedCountries[2].id },
    { name: "Mecca", countryId: insertedCountries[3].id },
    { name: "Medina", countryId: insertedCountries[3].id },
    { name: "Cairo", countryId: insertedCountries[4].id },
  ];
  const insertedCities: any[] = [];
  for (const c of cityData) {
    const existing = await db.select().from(cities).where(and(eq(cities.name, c.name), eq(cities.countryId, c.countryId)));
    if (existing.length === 0) {
      const [inserted] = await db.insert(cities).values(c).returning();
      insertedCities.push(inserted);
    } else {
      insertedCities.push(existing[0]);
    }
  }
  console.log(`  ✓ ${insertedCities.length} cities ready`);

  // ===== 3. Sights =====
  console.log("🏛️ Seeding Sights...");
  const sightData = [
    { name: "Uluwatu Temple", cityId: insertedCities[0].id, description: "Iconic clifftop temple", category: "religious" as const },
    { name: "Tegallalang Rice Terrace", cityId: insertedCities[1].id, description: "Famous rice paddies", category: "nature" as const },
    { name: "Senso-ji Temple", cityId: insertedCities[2].id, description: "Tokyo's oldest temple", category: "religious" as const },
    { name: "Fushimi Inari Shrine", cityId: insertedCities[3].id, description: "Thousands of red torii gates", category: "religious" as const },
    { name: "Hagia Sophia", cityId: insertedCities[4].id, description: "Historic mosque and museum", category: "historical" as const },
    { name: "Masjid al-Haram", cityId: insertedCities[5].id, description: "The Sacred Mosque", category: "religious" as const },
    { name: "Masjid an-Nabawi", cityId: insertedCities[6].id, description: "The Prophet's Mosque", category: "religious" as const },
    { name: "Great Pyramids of Giza", cityId: insertedCities[7].id, description: "Ancient wonder of the world", category: "landmark" as const },
  ];
  for (const s of sightData) {
    const existing = await db.select().from(sights).where(and(eq(sights.name, s.name), eq(sights.cityId, s.cityId)));
    if (existing.length === 0) await db.insert(sights).values(s);
  }
  console.log(`  ✓ ${sightData.length} sights ready`);

  // ===== 4. Hotels =====
  console.log("🏨 Seeding Hotels...");
  const hotelData = [
    { name: "Ayana Resort Bali", cityId: insertedCities[0].id, starRating: 5, address: "Jl. Karang Mas Sejahtera" },
    { name: "Ubud Hanging Gardens", cityId: insertedCities[1].id, starRating: 5, address: "Payangan, Ubud" },
    { name: "Park Hyatt Tokyo", cityId: insertedCities[2].id, starRating: 5, address: "Nishi-Shinjuku" },
    { name: "Kyoto Granbell Hotel", cityId: insertedCities[3].id, starRating: 4, address: "Higashiyama-ku" },
    { name: "Four Seasons Istanbul", cityId: insertedCities[4].id, starRating: 5, address: "Sultanahmet" },
    { name: "Swissotel Al Maqam Makkah", cityId: insertedCities[5].id, starRating: 5, address: "Near Masjid al-Haram" },
    { name: "The Oberoi Medina", cityId: insertedCities[6].id, starRating: 5, address: "Near Masjid an-Nabawi" },
    { name: "Marriott Mena House Cairo", cityId: insertedCities[7].id, starRating: 5, address: "6 Pyramids Road, Giza" },
  ];
  for (const h of hotelData) {
    const existing = await db.select().from(hotels).where(and(eq(hotels.name, h.name), eq(hotels.cityId, h.cityId)));
    if (existing.length === 0) await db.insert(hotels).values(h);
  }
  console.log(`  ✓ ${hotelData.length} hotels ready`);

  // ===== 5. Transport Companies =====
  console.log("🚌 Seeding Transport Companies...");
  const transportData = [
    { name: "Bali Golden Tour Transport", contactPhone: "+628123456789", email: "transport@baligolden.com" },
    { name: "Japan Express Bus", contactPhone: "+81901234567", email: "bus@japanexpress.jp" },
  ];
  for (const t of transportData) {
    const existing = await db.select().from(transportCompanies).where(eq(transportCompanies.name, t.name));
    if (existing.length === 0) await db.insert(transportCompanies).values(t);
  }
  console.log(`  ✓ ${transportData.length} transport companies ready`);

  // ===== 6. Airline Agencies =====
  console.log("✈️ Seeding Airline Agencies...");
  const airlineData = [
    { name: "Garuda Indonesia Agent", iataCode: "GA", contactPhone: "+62211234567", email: "garuda@agent.com" },
    { name: "Emirates Partner", iataCode: "EK", contactPhone: "+97141234567", email: "emirates@partner.com" },
  ];
  for (const a of airlineData) {
    const existing = await db.select().from(airlineAgencies).where(eq(airlineAgencies.name, a.name));
    if (existing.length === 0) await db.insert(airlineAgencies).values(a);
  }
  console.log(`  ✓ ${airlineData.length} airline agencies ready`);

  // ===== 7. Tours =====
  console.log("🗺️ Seeding Tours...");
  const tourData = [
    {
      title: "Bali Immerse: Cultural and Leisure Discovery",
      slug: "bali-immerse-cultural-and-leisure-discovery",
      description: "Explore the rich cultural heritage and serene beauty of Bali.",
      highlights: "Uluwatu Temple Sunset\nUbud Monkey Forest\nTegallalang Rice Terrace\nTanah Lot",
      inclusions: "- 4 Nights accommodation\n- Daily breakfast\n- Private airport transfers",
      exclusions: "- International flights\n- Personal expenses",
      imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200",
      duration: 5, basePrice: "450", childPrice: "300", isPublished: true, category: "Cultural",
      countries: ["Indonesia"], tags: ["culture", "leisure", "beach"]
    },
    {
      title: "Japan Sakura Blossom",
      slug: "japan-sakura-blossom",
      description: "Experience the magic of cherry blossom season in Japan.",
      highlights: "Tokyo Skytree\nMount Fuji\nKyoto Temples\nOsaka Castle",
      inclusions: "- 7 Nights accommodation\n- JR Pass (7 days)\n- Welcome dinner",
      exclusions: "- Flights\n- Meals not specified",
      imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200",
      duration: 8, basePrice: "1200", childPrice: "850", isPublished: true, category: "Nature",
      countries: ["Japan"], tags: ["spring", "nature", "photography"]
    },
    {
      title: "Umrah Premium Package",
      slug: "umrah-premium-package",
      description: "A premium 12-day Umrah journey through Mecca and Medina.",
      highlights: "Masjid al-Haram\nMasjid an-Nabawi\nJabal Uhud\nCity tour Medina",
      inclusions: "- 5-star hotel\n- Visa processing\n- All transfers\n- Full board meals",
      exclusions: "- Personal shopping\n- Tips",
      imageUrl: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1200",
      duration: 12, basePrice: "3500", childPrice: "2800", isPublished: true, category: "Religious",
      countries: ["Saudi Arabia"], tags: ["umrah", "religious", "pilgrimage"]
    },
    {
      title: "Turkey Explorer: Istanbul to Cappadocia",
      slug: "turkey-explorer-istanbul-cappadocia",
      description: "Discover the wonders of Turkey from Istanbul to the fairy chimneys of Cappadocia.",
      highlights: "Hagia Sophia\nBlue Mosque\nCappadocia Hot Air Balloon\nEphesus",
      inclusions: "- 6 Nights hotel\n- Domestic flights\n- English-speaking guide",
      exclusions: "- International flights\n- Optional activities",
      imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=1200",
      duration: 7, basePrice: "900", childPrice: "650", isPublished: true, category: "Adventure",
      countries: ["Turkey"], tags: ["history", "adventure", "culture"]
    },
  ];
  const insertedTours: any[] = [];
  for (const t of tourData) {
    const existing = await db.select().from(tours).where(eq(tours.slug, t.slug));
    if (existing.length === 0) {
      const [inserted] = await db.insert(tours).values(t).returning();
      insertedTours.push(inserted);
    } else {
      insertedTours.push(existing[0]);
    }
  }
  console.log(`  ✓ ${insertedTours.length} tours ready`);

  // ===== 8. Tour Days =====
  console.log("📅 Seeding Tour Days...");
  for (const tour of insertedTours) {
    const existingDays = await db.select().from(tourDays).where(eq(tourDays.tourId, tour.id));
    if (existingDays.length === 0) {
      const numDays = tour.duration || 3;
      for (let d = 1; d <= Math.min(numDays, 5); d++) {
        await db.insert(tourDays).values({
          tourId: tour.id, dayNumber: d,
          title: `Day ${d} - ${tour.title}`,
          description: `Activities for day ${d} of the tour.`,
        });
      }
    }
  }
  console.log(`  ✓ Tour days ready`);

  // ===== 9. Tour Departures =====
  console.log("🚀 Seeding Tour Departures...");
  const insertedDepartures: any[] = [];
  for (const tour of insertedTours) {
    const existing = await db.select().from(tourDepartures).where(eq(tourDepartures.tourId, tour.id));
    if (existing.length > 0) {
      insertedDepartures.push(...existing);
      continue;
    }
    const dates = [
      { start: "2026-07-15", end: "2026-07-22" },
      { start: "2026-09-01", end: "2026-09-08" },
    ];
    for (const d of dates) {
      const [dep] = await db.insert(tourDepartures).values({
        tourId: tour.id, startDate: d.start, endDate: d.end,
        capacityTotal: 25, capacityBooked: 0,
        pricePerPerson: parseInt(tour.basePrice || "500"),
        status: "open", publicJoinEnabled: true,
      }).returning();
      insertedDepartures.push(dep);
    }
  }
  console.log(`  ✓ ${insertedDepartures.length} departures ready`);

  // ===== 10. Bookings for EVERY user =====
  console.log("📋 Seeding Bookings for ALL users...");
  const allUsers = await db.select().from(users);
  const allProfiles = await db.select().from(userProfiles);

  // Separate customer-type users and staff users
  const customerProfiles = allProfiles.filter(p => p.role === "customer");
  const staffProfiles = allProfiles.filter(p => p.role !== "customer");

  // Create a leader group booking for the first customer (or admin)
  const leaderUserId = customerProfiles.length > 0 ? customerProfiles[0].userId : allUsers[0]?.id;
  const leaderUser = allUsers.find(u => u.id === leaderUserId);

  if (!leaderUser) {
    console.log("  ⚠ No users found, skipping bookings");
  } else {
    const dep0 = insertedDepartures[0];
    const tour0 = insertedTours.find((t: any) => t.id === dep0?.tourId) || insertedTours[0];
    const joinCodeVal = genCode(6);

    // Leader booking
    let leaderBooking: any;
    const existingLeader = await db.select().from(bookings).where(
      and(eq(bookings.customerId, leaderUser.id), eq(bookings.bookingType, "leader_group"))
    );
    if (existingLeader.length === 0) {
      [leaderBooking] = await db.insert(bookings).values({
        bookingCode: bookingCode(), tourId: tour0.id, departureId: dep0?.id,
        customerId: leaderUser.id, bookingType: "leader_group",
        groupName: `${leaderUser.username}'s Travel Group`,
        leaderUserId: leaderUser.id, joinCode: joinCodeVal,
        partySizeExpected: 5, status: "confirmed", fulfillmentStatus: "in_progress",
        totalPrice: parseInt(tour0.basePrice || "0") * 5,
      }).returning();
      console.log(`  ✓ Leader booking: ${leaderBooking.bookingCode} (joinCode: ${joinCodeVal})`);
    } else {
      leaderBooking = existingLeader[0];
      console.log(`  ✓ Leader booking already exists: ${leaderBooking.bookingCode}`);
    }

    // Add travelers for leader
    const existingLeaderTravelers = await db.select().from(travelers).where(eq(travelers.bookingId, leaderBooking.id));
    if (existingLeaderTravelers.length === 0) {
      await db.insert(travelers).values([
        { bookingId: leaderBooking.id, firstName: leaderUser.username || "Leader", lastName: "Primary", nationality: "ID", gender: "male" },
        { bookingId: leaderBooking.id, firstName: "Companion", lastName: "One", nationality: "ID", gender: "female" },
      ]);
    }

    // Add payment for leader booking
    const existingPayments = await db.select().from(payments).where(eq(payments.bookingId, leaderBooking.id));
    if (existingPayments.length === 0) {
      await db.insert(payments).values({
        bookingId: leaderBooking.id, amount: parseInt(tour0.basePrice || "500"),
        currency: "USD", method: "bank_transfer", status: "paid",
        notes: "Initial deposit", createdBy: leaderUser.id,
      });
      await db.insert(payments).values({
        bookingId: leaderBooking.id, amount: parseInt(tour0.basePrice || "500") * 4,
        currency: "USD", method: "bank_transfer", status: "pending",
        notes: "Remaining balance", createdBy: leaderUser.id,
      });
    }

    // Add messages for leader booking
    const existingMsgs = await db.select().from(messages).where(eq(messages.bookingId, leaderBooking.id));
    if (existingMsgs.length === 0) {
      await db.insert(messages).values([
        { bookingId: leaderBooking.id, senderUserId: leaderUser.id, senderName: leaderUser.username || "Customer", messageText: "Hi, I have 5 people in my group. Looking forward to the trip!", visibility: "customer_visible" as const },
        { bookingId: leaderBooking.id, senderUserId: "system", senderName: "Admin", messageText: "Welcome! Your booking has been confirmed. We will start preparing your itinerary.", visibility: "customer_visible" as const },
      ]);
    }

    // Add documents for leader booking
    const existingDocs = await db.select().from(documents).where(eq(documents.bookingId, leaderBooking.id));
    if (existingDocs.length === 0) {
      await db.insert(documents).values({
        bookingId: leaderBooking.id, docType: "passport" as const,
        fileName: "passport_scan.pdf", fileUrl: "/uploads/passport_scan.pdf",
        uploadedBy: leaderUser.id, status: "approved" as const,
      });
    }

    // Add workflow assignments (to staff users)
    const existingAssignments = await db.select().from(bookingAssignments).where(eq(bookingAssignments.bookingId, leaderBooking.id));
    if (existingAssignments.length === 0) {
      const serviceTypes = ["airline", "hotel", "transport", "guide", "sights"] as const;
      const roleToService: Record<string, typeof serviceTypes[number]> = {
        "airline_supplier": "airline",
        "hotel_manager": "hotel",
        "transport_manager": "transport",
        "guide_manager": "guide",
        "sights_manager": "sights",
      };
      for (const sp of staffProfiles) {
        const svc = roleToService[sp.role];
        if (svc) {
          await db.insert(bookingAssignments).values({
            bookingId: leaderBooking.id, serviceType: svc,
            assignedUserId: sp.userId, status: "assigned",
            countryCode: "ID",
          });

          // Also create a workflow for this assignment
          const [wf] = await db.insert(bookingWorkflows).values({
            bookingId: leaderBooking.id, serviceType: svc,
            assignedUserId: sp.userId, status: "assigned",
            countryCode: "ID", currentStep: "Step 1",
          }).returning();

          // Add workflow steps
          const steps = [
            { stepOrder: 1, stepCode: "request_sent", stepName: "Request Sent", status: "done" as const },
            { stepOrder: 2, stepCode: "confirmation", stepName: "Confirmation Received", status: "pending" as const },
            { stepOrder: 3, stepCode: "completed", stepName: "Completed", status: "pending" as const },
          ];
          for (const s of steps) {
            await db.insert(workflowSteps).values({ workflowId: wf.id, ...s });
          }
          console.log(`    → Assigned ${svc} to ${sp.role} (${sp.userId})`);
        }
      }
    }

    // Create participant bookings for other customers
    const otherCustomers = allUsers.filter(u => u.id !== leaderUser.id);
    let participantCount = 0;
    for (const pUser of otherCustomers.slice(0, 8)) {
      const existing = await db.select().from(bookings).where(
        and(eq(bookings.customerId, pUser.id), eq(bookings.bookingType, "join_leader_group"))
      );
      if (existing.length > 0) continue;

      const [pBooking] = await db.insert(bookings).values({
        bookingCode: bookingCode(), tourId: tour0.id, departureId: dep0?.id,
        customerId: pUser.id, bookingType: "join_leader_group",
        groupName: `${leaderUser.username}'s Travel Group`,
        leaderUserId: leaderUser.id,
        partySizeExpected: 1, status: "confirmed", fulfillmentStatus: "pending",
        totalPrice: parseInt(tour0.basePrice || "0"),
      }).returning();

      // Add traveler for this participant
      await db.insert(travelers).values({
        bookingId: pBooking.id,
        firstName: pUser.username || pUser.firstName || "Traveler",
        lastName: pUser.lastName || "Guest",
        nationality: "ID", gender: "male",
      });

      participantCount++;
    }
    console.log(`  ✓ ${participantCount} participant bookings created`);

    // Create a second "private_family" booking for variety
    const dep1 = insertedDepartures[1] || insertedDepartures[0];
    const tour1 = insertedTours.find((t: any) => t.id === dep1?.tourId) || insertedTours[1] || insertedTours[0];
    
    const existingFamily = await db.select().from(bookings).where(
      and(eq(bookings.customerId, leaderUser.id), eq(bookings.bookingType, "private_family"))
    );
    if (existingFamily.length === 0) {
      const [familyBooking] = await db.insert(bookings).values({
        bookingCode: bookingCode(), tourId: tour1.id, departureId: dep1?.id,
        customerId: leaderUser.id, bookingType: "private_family",
        groupName: `${leaderUser.username}'s Family Trip`,
        leaderUserId: leaderUser.id,
        partySizeExpected: 3, status: "submitted", fulfillmentStatus: "pending",
        totalPrice: parseInt(tour1.basePrice || "0") * 3,
      }).returning();

      await db.insert(travelers).values([
        { bookingId: familyBooking.id, firstName: "Parent", lastName: "One", nationality: "ID", gender: "male" },
        { bookingId: familyBooking.id, firstName: "Child", lastName: "One", nationality: "ID", gender: "female", dob: "2015-03-10" },
        { bookingId: familyBooking.id, firstName: "Child", lastName: "Two", nationality: "ID", gender: "male", dob: "2018-07-25" },
      ]);
      console.log(`  ✓ Family booking created: ${familyBooking.bookingCode}`);
    }
  }

  console.log("\n✅ FULL seeding complete! All entities populated.");
  process.exit(0);
}

seedAll().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
