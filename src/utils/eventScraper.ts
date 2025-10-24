// Event Scraper Utility
// This utility provides functions to scrape events from various platforms
// In production, this would run as a Supabase Edge Function or backend service

interface ScrapedEvent {
  title: string;
  organizer: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  city: string;
  state: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  eligibility: string;
  prizes: string;
  prizeAmount?: number;
  website: string;
  tags: string[];
  imageUrl: string;
  source: string;
  scrapedFrom: 'devfolio' | 'unstop' | 'manual';
}

/**
 * Scrape events from Devfolio
 * In production, this would make API calls or scrape the Devfolio website
 */
export async function scrapeDevfolio(): Promise<ScrapedEvent[]> {
  try {
    // In production, you would:
    // 1. Make API calls to Devfolio's public API (if available)
    // 2. Or use a web scraper (Puppeteer, Cheerio, etc.) on the server side
    // 3. Parse the HTML and extract event data
    
    // For now, return mock data structure
    // This shows the expected format from Devfolio
    
    const response = await fetch('https://devfolio.co/api/hackathons', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    }).catch(() => null);

    if (!response || !response.ok) {
      console.log('Devfolio API not available, using mock data');
      return [];
    }

    // Parse Devfolio response
    // const data = await response.json();
    // return data.map(transformDevfolioEvent);
    
    return [];
  } catch (error) {
    console.error('Error scraping Devfolio:', error);
    return [];
  }
}

/**
 * Scrape events from Unstop
 * In production, this would make API calls or scrape the Unstop website
 */
export async function scrapeUnstop(): Promise<ScrapedEvent[]> {
  try {
    // In production, you would:
    // 1. Use Unstop's API endpoints
    // 2. Or scrape their public listings
    // 3. Parse and transform the data
    
    const response = await fetch('https://unstop.com/api/public/opportunity/search-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({
        opportunity: 'hackathons',
        page: 1,
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      console.log('Unstop API not available, using mock data');
      return [];
    }

    // Parse Unstop response
    // const data = await response.json();
    // return data.data.map(transformUnstopEvent);
    
    return [];
  } catch (error) {
    console.error('Error scraping Unstop:', error);
    return [];
  }
}

/**
 * Scrape events from MLH (Major League Hacking)
 */
export async function scrapeMLH(): Promise<ScrapedEvent[]> {
  try {
    const response = await fetch('https://mlh.io/seasons/2025/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    }).catch(() => null);

    if (!response || !response.ok) {
      return [];
    }

    // Parse MLH events
    return [];
  } catch (error) {
    console.error('Error scraping MLH:', error);
    return [];
  }
}

/**
 * Scrape events from HackerEarth
 */
export async function scrapeHackerEarth(): Promise<ScrapedEvent[]> {
  try {
    const response = await fetch('https://www.hackerearth.com/challenges/', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    }).catch(() => null);

    if (!response || !response.ok) {
      return [];
    }

    // Parse HackerEarth challenges
    return [];
  } catch (error) {
    console.error('Error scraping HackerEarth:', error);
    return [];
  }
}

/**
 * Transform Devfolio event data to our format
 */
function transformDevfolioEvent(devfolioEvent: any): ScrapedEvent {
  return {
    title: devfolioEvent.name,
    organizer: devfolioEvent.organizer,
    description: devfolioEvent.description,
    category: 'Hackathon',
    startDate: devfolioEvent.start_date,
    endDate: devfolioEvent.end_date,
    registrationDeadline: devfolioEvent.registration_deadline,
    location: devfolioEvent.is_online ? 'Online' : devfolioEvent.location,
    city: devfolioEvent.city || 'Online',
    state: devfolioEvent.state || 'Online',
    mode: devfolioEvent.is_online ? 'Online' : 'Offline',
    eligibility: devfolioEvent.eligibility || 'All students',
    prizes: devfolioEvent.prizes_description || 'Check website for details',
    prizeAmount: parsePrizeAmount(devfolioEvent.total_prizes),
    website: devfolioEvent.url,
    tags: devfolioEvent.themes || [],
    imageUrl: devfolioEvent.cover_image || '',
    source: devfolioEvent.organizer,
    scrapedFrom: 'devfolio',
  };
}

/**
 * Transform Unstop event data to our format
 */
function transformUnstopEvent(unstopEvent: any): ScrapedEvent {
  return {
    title: unstopEvent.title,
    organizer: unstopEvent.organisation?.name || 'Unknown',
    description: unstopEvent.description,
    category: unstopEvent.type || 'Competition',
    startDate: unstopEvent.start_date,
    endDate: unstopEvent.end_date,
    registrationDeadline: unstopEvent.registration_end_date,
    location: unstopEvent.opportunity_type === 'online' ? 'Online' : unstopEvent.city,
    city: unstopEvent.city || 'Online',
    state: unstopEvent.state || 'Online',
    mode: unstopEvent.opportunity_type === 'online' ? 'Online' : 'Offline',
    eligibility: unstopEvent.eligibility || 'All students',
    prizes: unstopEvent.prizes_worth || 'Check website for details',
    prizeAmount: parsePrizeAmount(unstopEvent.prizes_worth),
    website: `https://unstop.com/${unstopEvent.public_url}`,
    tags: unstopEvent.tags || [],
    imageUrl: unstopEvent.cover_image || '',
    source: unstopEvent.organisation?.name || 'Unstop',
    scrapedFrom: 'unstop',
  };
}

/**
 * Parse prize amount from text
 */
function parsePrizeAmount(prizeText: string | number): number {
  if (typeof prizeText === 'number') return prizeText;
  if (!prizeText) return 0;

  // Remove currency symbols and convert to number
  const cleaned = prizeText.replace(/[₹,$,]/g, '').trim();
  
  // Handle lakhs and crores
  if (cleaned.includes('lakh')) {
    return parseFloat(cleaned) * 100000;
  }
  if (cleaned.includes('crore')) {
    return parseFloat(cleaned) * 10000000;
  }
  if (cleaned.includes('L')) {
    return parseFloat(cleaned) * 100000;
  }
  if (cleaned.includes('Cr')) {
    return parseFloat(cleaned) * 10000000;
  }
  if (cleaned.includes('K')) {
    return parseFloat(cleaned) * 1000;
  }
  
  return parseFloat(cleaned) || 0;
}

/**
 * Aggregate events from all sources
 */
export async function scrapeAllEvents(): Promise<ScrapedEvent[]> {
  try {
    const [devfolioEvents, unstopEvents, mlhEvents, hackerEarthEvents] = await Promise.all([
      scrapeDevfolio(),
      scrapeUnstop(),
      scrapeMLH(),
      scrapeHackerEarth(),
    ]);

    const allEvents = [
      ...devfolioEvents,
      ...unstopEvents,
      ...mlhEvents,
      ...hackerEarthEvents,
    ];

    // Remove duplicates based on title and organizer
    const uniqueEvents = allEvents.filter((event, index, self) =>
      index === self.findIndex((e) => e.title === event.title && e.organizer === event.organizer)
    );

    return uniqueEvents;
  } catch (error) {
    console.error('Error aggregating events:', error);
    return [];
  }
}

/**
 * Filter events by department relevance
 */
export function filterEventsByDepartment(events: ScrapedEvent[], department: string): ScrapedEvent[] {
  // This would use ML/AI to match event tags/description with department
  // For now, using simple keyword matching
  
  const departmentKeywords: Record<string, string[]> = {
    'Computer Science & Engineering': ['web', 'app', 'software', 'coding', 'programming', 'ai', 'ml', 'blockchain'],
    'Artificial Intelligence & Data Science': ['ai', 'ml', 'data', 'analytics', 'deep learning', 'nlp'],
    'Artificial Intelligence & Machine Learning': ['ai', 'ml', 'deep learning', 'neural', 'computer vision'],
    'Information Technology': ['web', 'app', 'software', 'cloud', 'devops', 'database'],
    'Mechanical': ['cad', 'design', 'manufacturing', 'robotics', 'automation'],
    'Civil': ['construction', 'infrastructure', 'sustainable', 'urban'],
    'Electrical': ['circuit', 'embedded', 'iot', 'electronics', 'robotics'],
    'Agricultural': ['agri', 'farming', 'agriculture', 'rural'],
  };

  const keywords = departmentKeywords[department] || [];
  
  return events.filter(event => {
    const searchText = `${event.title} ${event.description} ${event.tags.join(' ')}`.toLowerCase();
    return keywords.some(keyword => searchText.includes(keyword));
  });
}

/**
 * Get recommended events based on user preferences
 */
export function getRecommendedEvents(
  events: ScrapedEvent[],
  preferences: {
    department?: string;
    savedTags?: string[];
    location?: string;
    mode?: 'Online' | 'Offline' | 'Hybrid';
  }
): ScrapedEvent[] {
  let filtered = [...events];

  if (preferences.department) {
    filtered = filterEventsByDepartment(filtered, preferences.department);
  }

  if (preferences.savedTags && preferences.savedTags.length > 0) {
    filtered = filtered.filter(event =>
      event.tags.some(tag => preferences.savedTags!.includes(tag))
    );
  }

  if (preferences.location) {
    filtered = filtered.filter(event =>
      event.city === preferences.location || event.state === preferences.location
    );
  }

  if (preferences.mode) {
    filtered = filtered.filter(event => event.mode === preferences.mode);
  }

  return filtered;
}

/**
 * Check for new events since last sync
 */
export function getNewEventsSinceLastSync(
  currentEvents: ScrapedEvent[],
  lastSyncTimestamp: string
): ScrapedEvent[] {
  const lastSync = new Date(lastSyncTimestamp);
  
  // In production, this would check event creation/update timestamps
  // For now, return events that weren't in the previous sync
  return currentEvents.filter(event => {
    const eventDate = new Date(event.registrationDeadline);
    return eventDate > lastSync;
  });
}
