import { 
  InsertCountry, InsertCity, InsertSight, InsertHotel 
} from "@shared/schema";

/**
 * ScraperService provides methods to fetch geographic and touristic data.
 * In a real-world scenario, these would use Puppeteer, Cheerio, or external APIs.
 */
export class ScraperService {
  /**
   * Scrapes a list of countries.
   * Currently uses REST Countries API as a source.
   */
  async scrapeCountries(): Promise<InsertCountry[]> {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,region,currencies,timezones");
      if (!response.ok) throw new Error("Failed to fetch countries");
      const data = await response.json() as any[];
      
      return data.map(c => ({
        code: c.cca2,
        name: c.name.common,
        region: c.region,
        currency: Object.keys(c.currencies || {})[0] || "USD",
        timezone: c.timezones?.[0] || "UTC",
        isActive: true
      }));
    } catch (error) {
      console.error("Scraping countries failed:", error);
      // Fallback to minimal mock data if API is down
      return [
        { code: "ID", name: "Indonesia", region: "Asia", currency: "IDR", timezone: "WIB", isActive: true },
        { code: "US", name: "United States", region: "Americas", currency: "USD", timezone: "EST", isActive: true },
      ];
    }
  }

  /**
   * Scrapes cities for a specific country.
   */
  async scrapeCities(countryCode: string, countryId: string): Promise<InsertCity[]> {
    // This would typically use a Geonames API or similar.
    // Simulating city data for common countries.
    const cityData: Record<string, string[]> = {
      "ID": ["Jakarta", "Bali", "Surabaya", "Yogyakarta", "Bandung"],
      "US": ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami"],
      "FR": ["Paris", "Lyon", "Marseille", "Bordeaux", "Nice"],
      "JP": ["Tokyo", "Osaka", "Kyoto", "Hiroshima", "Sapporo"],
    };

    const cities = cityData[countryCode] || ["Capital City", "Major City 1", "Major City 2"];
    
    return cities.map(name => ({
      name,
      countryId,
      isAirportCity: name.includes("Jakarta") || name.includes("New York") || name.includes("Paris") || name.includes("Tokyo"),
      isActive: true
    }));
  }

  /**
   * Scrapes sights for a specific city.
   */
  async scrapeSights(cityId: string, cityName: string): Promise<InsertSight[]> {
    // Simulating sight scraping with images and info.
    const sightTemplates: Record<string, any[]> = {
      "Jakarta": [
        { name: "Monas (National Monument)", category: "historical", description: "The iconic monument of Indonesia's independence.", cost: "15000", hours: "08:00 - 16:00" },
        { name: "Old Town (Kota Tua)", category: "historical", description: "Historical area with Dutch colonial architecture.", cost: "0", hours: "24 Hours" },
      ],
      "Paris": [
        { name: "Eiffel Tower", category: "landmark", description: "World-famous iron lattice tower on the Champ de Mars.", cost: "25", hours: "09:00 - 00:00" },
        { name: "Louvre Museum", category: "museum", description: "The world's largest art museum and a historic monument.", cost: "17", hours: "09:00 - 18:00" },
      ]
    };

    const templates = sightTemplates[cityName] || [
      { name: `${cityName} Landmark`, category: "landmark", description: `A must-see landmark in ${cityName}.`, cost: "10", hours: "09:00 - 17:00" },
      { name: `${cityName} Museum`, category: "museum", description: `Explore the history and culture of ${cityName}.`, cost: "5", hours: "10:00 - 18:00" },
    ];

    return templates.map(t => ({
      name: t.name,
      cityId,
      description: t.description,
      longDescription: `${t.description} This site attracts thousands of visitors annually and is considered a key destination for anyone visiting ${cityName}.`,
      category: t.category,
      ticketRequired: t.cost !== "0",
      individualTicketCost: t.cost,
      groupTicketCost: (parseFloat(t.cost) * 0.8).toString(),
      estimatedDuration: "2-4 hours",
      imageUrl: `https://images.unsplash.com/photo-1500000000000?q=80&w=1000&auto=format&fit=crop`, // Placeholder
      openingHours: t.hours,
      address: `Main Street, ${cityName}`,
      isActive: true
    }));
  }

  /**
   * Scrapes hotels for a specific city.
   */
  async scrapeHotels(cityId: string, cityName: string): Promise<InsertHotel[]> {
    const hotelNames = ["Grand Palace Hotel", "Skyline View Resort", "City Center Inn", "Harmony Suites"];
    
    return hotelNames.map((name, index) => ({
      name: `${name} ${cityName}`,
      cityId,
      address: `${123 + index} Luxury Ave, ${cityName}`,
      description: `A premium hotel offering world-class amenities and exceptional service in the heart of ${cityName}.`,
      starRating: 3 + (index % 3),
      basePrice: (50 + Math.floor(Math.random() * 200)).toString(),
      currency: "USD",
      imageUrl: `https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop`,
      contactPhone: "+1234567890",
      contactEmail: `info@${name.toLowerCase().replace(/ /g, "")}.com`,
      website: `https://www.${name.toLowerCase().replace(/ /g, "")}.com`,
      isActive: true
    }));
  }
}

export const scraperService = new ScraperService();
