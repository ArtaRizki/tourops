import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';

// Reuse a single Redis connection for all queues
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Required by BullMQ
});

// Define queues
export const queues = {
  countryImport: new Queue('country-import', { connection }),
  cityImport: new Queue('city-import', { connection }),
  sightDiscovery: new Queue('sight-discovery', { connection }),
  sightEnrichment: new Queue('sight-enrichment', { connection }),
  imageProcessing: new Queue('image-processing', { connection }),
  hotelPrice: new Queue('hotel-price', { connection }),
  flightPrice: new Queue('flight-price', { connection }),
  tourAi: new Queue('tour-ai', { connection }),
  dataQuality: new Queue('data-quality', { connection }),
};

// Start workers (usually you would run these in a separate process, but for demo we export an init function)
export function startWorkers() {
  console.log('[Workers] Starting background workers...');

  // 1. Country Import Worker
  new Worker('country-import', async (job: Job) => {
    const { scraperService } = await import('../scrapers');
    const { storage } = await import('../../storage');
    console.log(`[Worker] Starting country import job ${job.id}`);
    const countries = await scraperService.scrapeCountries();
    const result = await storage.bulkCreateCountries(countries);
    return { count: result.length };
  }, { connection });

  // 2. City Import Worker
  new Worker('city-import', async (job: Job) => {
    const { scraperService } = await import('../scrapers');
    const { storage } = await import('../../storage');
    const { countryCode, countryId } = job.data;
    console.log(`[Worker] Starting city import job ${job.id} for ${countryCode}`);
    const cities = await scraperService.scrapeCities(countryCode, countryId);
    const result = await storage.bulkCreateCities(cities);
    return { count: result.length };
  }, { connection });

  // 3. Sight Discovery Worker
  new Worker('sight-discovery', async (job: Job) => {
    const { scraperService } = await import('../scrapers');
    const { storage } = await import('../../storage');
    const { cityId, cityName, osmId } = job.data;
    console.log(`[Worker] Starting sight discovery job ${job.id} for ${cityName}`);
    const sights = await scraperService.scrapeSights(cityId, cityName, osmId);
    const result = await storage.bulkCreateSights(sights);
    return { count: result.length };
  }, { connection });

  // 4. Sight Enrichment Worker
  new Worker('sight-enrichment', async (job: Job) => {
    const { scraperService } = await import('../scrapers');
    const { storage } = await import('../../storage');
    const { sightId, sightName } = job.data;
    console.log(`[Worker] Processing sight-enrichment job ${job.id} for sight ${sightName}`);
    const enrichment = await scraperService.enrichSightData(sightName);
    const result = await storage.updateSight(sightId, enrichment);
    return { success: true };
  }, { connection });

  // (Other workers can be defined here similarly)
  
  // Setup generic event logging
  Object.keys(queues).forEach(queueName => {
    const events = new QueueEvents(queueName, { connection });
    events.on('completed', ({ jobId }) => {
      console.log(`[Worker] ${queueName} job ${jobId} completed`);
    });
    events.on('failed', ({ jobId, failedReason }) => {
      console.error(`[Worker] ${queueName} job ${jobId} failed: ${failedReason}`);
    });
  });
}
