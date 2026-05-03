/**
 * AirlineService provides tools for searching and generating airline ticket prices.
 */
export class AirlineService {
  /**
   * Searches for the lowest flight prices based on parameters.
   */
  async searchFlights(params: {
    origin: string;
    destination: string;
    date: string;
    passengers?: number;
    cabinClass?: "economy" | "business" | "first";
  }) {
    const { origin, destination, date, passengers = 1, cabinClass = "economy" } = params;

    // Simulating flight search results from different airlines
    const airlines = [
      { name: "Global Airways", code: "GA", baseMultiplier: 1.0 },
      { name: "SkyLink Airlines", code: "SL", baseMultiplier: 1.2 },
      { name: "SwiftJet", code: "SJ", baseMultiplier: 0.8 },
      { name: "Oceanic Air", code: "OA", baseMultiplier: 1.5 },
    ];

    const cabinMultipliers = {
      economy: 1.0,
      business: 2.5,
      first: 5.0,
    };

    // Deterministic random price based on string hash of origin+dest+date
    const getHash = (s: string) => s.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    const baseSeed = Math.abs(getHash(origin + destination + date)) % 500 + 200;

    const flights = airlines.map(airline => {
      const pricePerPerson = Math.floor(baseSeed * airline.baseMultiplier * cabinMultipliers[cabinClass]);
      const durationHours = 2 + (Math.abs(getHash(airline.code)) % 10);
      
      return {
        id: `FL-${airline.code}-${Math.abs(getHash(date)).toString().slice(0, 4)}`,
        airlineName: airline.name,
        airlineCode: airline.code,
        flightNumber: `${airline.code}${Math.floor(Math.random() * 900) + 100}`,
        origin,
        destination,
        departureTime: `${date}T${10 + (Math.abs(getHash(airline.name)) % 10)}:00:00`,
        arrivalTime: `${date}T${10 + (Math.abs(getHash(airline.name)) % 10) + durationHours}:00:00`,
        duration: `${durationHours}h 00m`,
        price: pricePerPerson * passengers,
        pricePerPerson,
        currency: "USD",
        cabinClass,
        seatsAvailable: 5 + (Math.abs(getHash(airline.name + date)) % 50),
      };
    });

    // Sort by price (lowest first)
    return flights.sort((a, b) => a.price - b.price);
  }
}

export const airlineService = new AirlineService();
