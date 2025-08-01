import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHealthcareFacilitySchema, insertSearchHistorySchema } from "@shared/schema";
import fs from 'fs';
import path from 'path';

// Manually load API key from .env file
let GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.PLACES_API_KEY;

// If API key is not set in environment, try to read from .env file
if (!GOOGLE_PLACES_API_KEY) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const apiKeyMatch = envContent.match(/GOOGLE_PLACES_API_KEY=["\'](.*?)["\']/);
      if (apiKeyMatch && apiKeyMatch[1]) {
        GOOGLE_PLACES_API_KEY = apiKeyMatch[1];
        console.log('Loaded Google Places API key from .env file');
      }
    }
  } catch (error) {
    console.error('Error loading .env file:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Search healthcare facilities using Google Places API
  app.get("/api/search-facilities", async (req, res) => {
    try {
      const { query, location } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }

      if (!GOOGLE_PLACES_API_KEY) {
        return res.status(500).json({ error: "Google Places API key not configured" });
      }

      // Search for healthcare facilities using Google Places Text Search
      const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      searchUrl.searchParams.set('query', `${query} hospital pharmacy clinic`);
      searchUrl.searchParams.set('type', 'health');
      searchUrl.searchParams.set('key', GOOGLE_PLACES_API_KEY);
      
      if (location && typeof location === 'string') {
        searchUrl.searchParams.set('location', location);
        searchUrl.searchParams.set('radius', '10000');
      }

      const response = await fetch(searchUrl.toString());
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const facilities = await Promise.all(
        (data.results || []).slice(0, 10).map(async (place: any) => {
          // Get detailed information about each place
          const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
          detailsUrl.searchParams.set('place_id', place.place_id);
          detailsUrl.searchParams.set('fields', 'name,formatted_address,formatted_phone_number,opening_hours,rating,types,geometry');
          detailsUrl.searchParams.set('key', GOOGLE_PLACES_API_KEY);

          try {
            const detailsResponse = await fetch(detailsUrl.toString());
            const detailsData = await detailsResponse.json();
            
            if (detailsData.status === 'OK') {
              const details = detailsData.result;
              
              // Determine facility type based on Google types
              let facilityType = 'clinic';
              if (details.types?.includes('hospital')) {
                facilityType = 'hospital';
              } else if (details.types?.includes('pharmacy')) {
                facilityType = 'pharmacy';
              } else if (details.types?.includes('health')) {
                facilityType = 'clinic';
              }

              // Format opening hours
              let hours = 'Hours not available';
              if (details.opening_hours?.weekday_text) {
                hours = details.opening_hours.weekday_text.join(', ');
              }

              const facility = {
                placeId: place.place_id,
                name: details.name || place.name,
                type: facilityType,
                address: details.formatted_address || place.formatted_address,
                phone: details.formatted_phone_number || null,
                hours: hours,
                rating: details.rating ? details.rating.toString() : null,
                distance: null, // Could calculate if user location provided
                latitude: details.geometry?.location?.lat?.toString() || null,
                longitude: details.geometry?.location?.lng?.toString() || null,
              };

              // Store facility in our database
              let storedFacility = await storage.getFacilityByPlaceId(place.place_id);
              if (!storedFacility) {
                storedFacility = await storage.createFacility(facility);
              }

              return storedFacility;
            }
          } catch (error) {
            console.error('Error fetching place details:', error);
          }

          // Fallback if details fetch fails
          const basicFacility = {
            placeId: place.place_id,
            name: place.name,
            type: 'clinic',
            address: place.formatted_address,
            phone: null,
            hours: 'Hours not available',
            rating: place.rating ? place.rating.toString() : null,
            distance: null,
            latitude: place.geometry?.location?.lat?.toString() || null,
            longitude: place.geometry?.location?.lng?.toString() || null,
          };

          let storedFacility = await storage.getFacilityByPlaceId(place.place_id);
          if (!storedFacility) {
            storedFacility = await storage.createFacility(basicFacility);
          }

          return storedFacility;
        })
      );

      res.json({ facilities: facilities.filter(Boolean) });
    } catch (error) {
      console.error('Search facilities error:', error);
      res.status(500).json({ 
        error: "Failed to search facilities. Please check your connection and try again." 
      });
    }
  });

  // Get search history
  app.get("/api/search-history", async (req, res) => {
    try {
      const history = await storage.getSearchHistory();
      
      // Populate facility details for each history item
      const populatedHistory = await Promise.all(
        history.map(async (item) => {
          const facility = item.facilityId ? await storage.getFacility(item.facilityId) : null;
          return {
            ...item,
            facility
          };
        })
      );

      res.json({ history: populatedHistory });
    } catch (error) {
      console.error('Get search history error:', error);
      res.status(500).json({ error: "Failed to fetch search history" });
    }
  });

  // Save search to history
  app.post("/api/search-history", async (req, res) => {
    try {
      const validated = insertSearchHistorySchema.parse(req.body);
      const search = await storage.createSearchHistory(validated);
      res.json({ search });
    } catch (error) {
      console.error('Save search history error:', error);
      res.status(500).json({ error: "Failed to save search history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
