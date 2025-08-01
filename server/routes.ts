import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHealthcareFacilitySchema, insertSearchHistorySchema } from "@shared/schema";

// Mock healthcare facilities data for demonstration
const mockHealthcareFacilities = [
  {
    placeId: "mock_apollo_1",
    name: "Apollo Hospital",
    type: "hospital",
    address: "320 Fortis Blvd, Downtown Medical District, NY 10001",
    phone: "+1 (555) 123-4567",
    hours: "Mon-Sun: 24 hours",
    rating: "4.5",
    distance: "0.8 miles",
    latitude: "40.7128",
    longitude: "-74.0060"
  },
  {
    placeId: "mock_cvs_1",
    name: "CVS Pharmacy",
    type: "pharmacy",
    address: "150 Health Ave, Medical Plaza, NY 10002",
    phone: "+1 (555) 234-5678",
    hours: "Mon-Fri: 8AM-10PM, Sat-Sun: 9AM-9PM",
    rating: "4.2",
    distance: "0.5 miles",
    latitude: "40.7589",
    longitude: "-73.9851"
  },
  {
    placeId: "mock_wellness_1",
    name: "Wellness Medical Clinic",
    type: "clinic",
    address: "45 Care Street, Healthcare Center, NY 10003",
    phone: "+1 (555) 345-6789",
    hours: "Mon-Fri: 7AM-8PM, Sat: 8AM-5PM",
    rating: "4.7",
    distance: "1.2 miles",
    latitude: "40.7282",
    longitude: "-73.9942"
  },
  {
    placeId: "mock_walgreens_1",
    name: "Walgreens Pharmacy",
    type: "pharmacy",
    address: "89 Prescription Way, Pharmacy District, NY 10004",
    phone: "+1 (555) 456-7890",
    hours: "Mon-Sun: 7AM-11PM",
    rating: "4.1",
    distance: "1.5 miles",
    latitude: "40.7505",
    longitude: "-73.9934"
  },
  {
    placeId: "mock_mercy_1",
    name: "Mercy General Hospital",
    type: "hospital",
    address: "200 Emergency Lane, Hospital Quarter, NY 10005",
    phone: "+1 (555) 567-8901",
    hours: "Mon-Sun: 24 hours",
    rating: "4.3",
    distance: "2.1 miles",
    latitude: "40.7416",
    longitude: "-74.0032"
  },
  {
    placeId: "mock_family_1",
    name: "Family Health Clinic",
    type: "clinic",
    address: "78 Community Road, Family Care Center, NY 10006",
    phone: "+1 (555) 678-9012",
    hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-3PM",
    rating: "4.6",
    distance: "1.8 miles",
    latitude: "40.7348",
    longitude: "-73.9903"
  },
  {
    placeId: "mock_rite_aid_1",
    name: "Rite Aid Pharmacy",
    type: "pharmacy",
    address: "123 Medicine Street, Pharmacy Row, NY 10007",
    phone: "+1 (555) 789-0123",
    hours: "Mon-Fri: 8AM-9PM, Sat-Sun: 9AM-7PM",
    rating: "4.0",
    distance: "2.3 miles",
    latitude: "40.7580",
    longitude: "-73.9855"
  },
  {
    placeId: "mock_urgent_1",
    name: "Urgent Care Plus",
    type: "clinic",
    address: "56 Quick Care Ave, Urgent Medical Plaza, NY 10008",
    phone: "+1 (555) 890-1234",
    hours: "Mon-Sun: 7AM-10PM",
    rating: "4.4",
    distance: "1.0 miles",
    latitude: "40.7614",
    longitude: "-73.9776"
  },
  {
    placeId: "mock_mount_1",
    name: "Mount Sinai Medical Center",
    type: "hospital",
    address: "1468 Madison Avenue, Upper East Side, NY 10029",
    phone: "+1 (555) 901-2345",
    hours: "Mon-Sun: 24 hours",
    rating: "4.8",
    distance: "3.2 miles",
    latitude: "40.7891",
    longitude: "-73.9482"
  },
  {
    placeId: "mock_duane_1",
    name: "Duane Reade Pharmacy",
    type: "pharmacy",
    address: "Broadway & 72nd Street, Upper West Side, NY 10023",
    phone: "+1 (555) 012-3456",
    hours: "Mon-Sun: 24 hours",
    rating: "3.9",
    distance: "2.8 miles",
    latitude: "40.7782",
    longitude: "-73.9826"
  }
];

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
        console.error('Google Places API Error Details:', {
          status: data.status,
          error_message: data.error_message,
          url: searchUrl.toString()
        });
        throw new Error(`Google Places API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`);
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
      
      // Provide more specific error messages
      let errorMessage = "Failed to search facilities. Please check your connection and try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('REQUEST_DENIED')) {
          errorMessage = "Google Places API access denied. Please check that:\n" +
                        "1. Places API is enabled in your Google Cloud Console\n" +
                        "2. Your API key has the correct permissions\n" +
                        "3. Billing is set up for your Google Cloud project";
        } else if (error.message.includes('OVER_QUERY_LIMIT')) {
          errorMessage = "Google Places API quota exceeded. Please check your usage limits.";
        } else if (error.message.includes('INVALID_REQUEST')) {
          errorMessage = "Invalid search request. Please try a different search term.";
        }
      }
      
      res.status(500).json({ error: errorMessage });
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
