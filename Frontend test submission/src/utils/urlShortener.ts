import { logger, logUrlShortening, logUrlAccess, logError, logValidation } from './logger';

export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  customShortCode?: string;
  createdAt: string;
  expiresAt: string;
  validityMinutes: number;
  clicks: ClickData[];
  isExpired: boolean;
}

export interface ClickData {
  timestamp: string;
  source: string;
  location: string;
  userAgent: string;
  ipHash?: string; // For privacy, we'll use a hash instead of actual IP
}

export interface CreateUrlRequest {
  originalUrl: string;
  validityMinutes?: number;
  customShortCode?: string;
}

class UrlShortenerService {
  private static readonly STORAGE_KEY = 'url_shortener_data';
  private static readonly DEFAULT_VALIDITY_MINUTES = 30;
  private static readonly SHORTCODE_LENGTH = 6;
  private urls: Map<string, ShortenedUrl> = new Map();

  constructor() {
    this.loadFromStorage();
    logger.info('URL Shortener Service initialized', 'URL_SERVICE');
  }

  // Load data from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(UrlShortenerService.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.urls = new Map(data.urls || []);
        logger.info(`Loaded ${this.urls.size} URLs from storage`, 'STORAGE');
      }
    } catch (error) {
      logError('Loading from storage', error);
    }
  }

  // Save data to localStorage
  private saveToStorage(): void {
    try {
      const data = {
        urls: Array.from(this.urls.entries()),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(UrlShortenerService.STORAGE_KEY, JSON.stringify(data));
      logger.debug('Data saved to storage', 'STORAGE');
    } catch (error) {
      logError('Saving to storage', error);
    }
  }

  // Validate URL format
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const isValid = ['http:', 'https:'].includes(urlObj.protocol);
      logValidation('URL format', url, isValid, isValid ? undefined : 'Invalid protocol');
      return isValid;
    } catch {
      logValidation('URL format', url, false, 'Invalid URL format');
      return false;
    }
  }

  // Validate custom shortcode
  private isValidShortCode(shortCode: string): boolean {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    const isValidLength = shortCode.length >= 3 && shortCode.length <= 20;
    const isAlphanumeric = alphanumericRegex.test(shortCode);
    const isValid = isValidLength && isAlphanumeric;
    
    logValidation('Short code format', shortCode, isValid, 
      !isValidLength ? 'Length must be 3-20 characters' : 
      !isAlphanumeric ? 'Must be alphanumeric' : undefined
    );
    
    return isValid;
  }

  // Generate random shortcode
  private generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    do {
      result = '';
      for (let i = 0; i < UrlShortenerService.SHORTCODE_LENGTH; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.urls.has(result));
    
    logger.debug(`Generated shortcode: ${result}`, 'SHORTCODE_GENERATION');
    return result;
  }

  // Check if shortcode is unique
  private isShortCodeUnique(shortCode: string): boolean {
    const isUnique = !this.urls.has(shortCode);
    logValidation('Short code uniqueness', shortCode, isUnique, 
      isUnique ? undefined : 'Short code already exists'
    );
    return isUnique;
  }

  // Create shortened URL
  createShortenedUrl(request: CreateUrlRequest): { success: boolean; data?: ShortenedUrl; error?: string } {
    try {
      // Validate original URL
      if (!this.isValidUrl(request.originalUrl)) {
        return { success: false, error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.' };
      }

      // Validate and set validity
      const validityMinutes = request.validityMinutes || UrlShortenerService.DEFAULT_VALIDITY_MINUTES;
      if (validityMinutes <= 0 || !Number.isInteger(validityMinutes)) {
        return { success: false, error: 'Validity must be a positive integer representing minutes.' };
      }

      // Handle shortcode
      let shortCode: string;
      if (request.customShortCode) {
        if (!this.isValidShortCode(request.customShortCode)) {
          return { success: false, error: 'Invalid shortcode. Must be 3-20 alphanumeric characters.' };
        }
        if (!this.isShortCodeUnique(request.customShortCode)) {
          return { success: false, error: 'Shortcode already exists. Please choose a different one.' };
        }
        shortCode = request.customShortCode;
      } else {
        shortCode = this.generateShortCode();
      }

      // Create shortened URL object
      const now = new Date();
      const expiresAt = new Date(now.getTime() + validityMinutes * 60 * 1000);
      
      const shortenedUrl: ShortenedUrl = {
        id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalUrl: request.originalUrl,
        shortCode,
        customShortCode: request.customShortCode,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        validityMinutes,
        clicks: [],
        isExpired: false
      };

      // Store the URL
      this.urls.set(shortCode, shortenedUrl);
      this.saveToStorage();

      logUrlShortening(request.originalUrl, shortCode, validityMinutes);
      
      return { success: true, data: shortenedUrl };
    } catch (error) {
      logError('Creating shortened URL', error, request);
      return { success: false, error: 'An unexpected error occurred while creating the shortened URL.' };
    }
  }

  // Get shortened URL by code
  getShortenedUrl(shortCode: string): ShortenedUrl | null {
    const url = this.urls.get(shortCode);
    if (!url) {
      logger.warn(`Short URL not found: ${shortCode}`, 'URL_RETRIEVAL');
      return null;
    }

    // Check if expired
    const now = new Date();
    const isExpired = new Date(url.expiresAt) < now;
    
    if (isExpired && !url.isExpired) {
      url.isExpired = true;
      this.urls.set(shortCode, url);
      this.saveToStorage();
      logger.info(`URL expired: ${shortCode}`, 'URL_EXPIRY');
    }

    return url;
  }

  // Access shortened URL (for redirection)
  accessShortenedUrl(shortCode: string, source: string = 'direct'): { success: boolean; originalUrl?: string; error?: string } {
    try {
      const url = this.getShortenedUrl(shortCode);
      
      if (!url) {
        return { success: false, error: 'Short URL not found.' };
      }

      if (url.isExpired) {
        return { success: false, error: 'Short URL has expired.' };
      }

      // Record the click
      const clickData: ClickData = {
        timestamp: new Date().toISOString(),
        source,
        location: this.getCoarseLocation(),
        userAgent: navigator.userAgent,
        ipHash: this.generateIpHash()
      };

      url.clicks.push(clickData);
      this.urls.set(shortCode, url);
      this.saveToStorage();

      logUrlAccess(shortCode, url.originalUrl, source, clickData.location);

      return { success: true, originalUrl: url.originalUrl };
    } catch (error) {
      logError('Accessing shortened URL', error, { shortCode, source });
      return { success: false, error: 'An error occurred while accessing the URL.' };
    }
  }

  // Get coarse geographical location (simplified for demo)
  private getCoarseLocation(): string {
    // In a real app, you'd use a geolocation service
    // For demo purposes, we'll use timezone to get rough location
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const parts = timezone.split('/');
      return parts.length > 1 ? parts[1].replace('_', ' ') : 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  // Generate IP hash for privacy
  private generateIpHash(): string {
    // In a real app, you'd hash the actual IP
    // For demo purposes, generate a consistent hash based on session
    return `hash_${Math.random().toString(36).substr(2, 8)}`;
  }

  // Get all URLs for current session
  getAllUrls(): ShortenedUrl[] {
    return Array.from(this.urls.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get URL statistics
  getUrlStats(shortCode: string): { success: boolean; stats?: any; error?: string } {
    const url = this.getShortenedUrl(shortCode);
    
    if (!url) {
      return { success: false, error: 'URL not found.' };
    }

    const stats = {
      totalClicks: url.clicks.length,
      clicksToday: url.clicks.filter(click => {
        const clickDate = new Date(click.timestamp);
        const today = new Date();
        return clickDate.toDateString() === today.toDateString();
      }).length,
      topSources: this.getTopSources(url.clicks),
      topLocations: this.getTopLocations(url.clicks),
      clickHistory: url.clicks.map(click => ({
        timestamp: click.timestamp,
        source: click.source,
        location: click.location
      }))
    };

    return { success: true, stats };
  }

  private getTopSources(clicks: ClickData[]): { source: string; count: number }[] {
    const sourceCounts = clicks.reduce((acc, click) => {
      acc[click.source] = (acc[click.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getTopLocations(clicks: ClickData[]): { location: string; count: number }[] {
    const locationCounts = clicks.reduce((acc, click) => {
      acc[click.location] = (acc[click.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Clean up expired URLs
  cleanupExpiredUrls(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [shortCode, url] of this.urls.entries()) {
      if (new Date(url.expiresAt) < now) {
        this.urls.delete(shortCode);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.saveToStorage();
      logger.info(`Cleaned up ${cleanedCount} expired URLs`, 'CLEANUP');
    }
  }
}

// Singleton instance
export const urlShortenerService = new UrlShortenerService();