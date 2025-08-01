import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHealthcareFacilitySchema, insertSearchHistorySchema } from "@shared/schema";

// Healthcare API configuration
const NEW_API_KEY = process.env.NEW_API_KEY; // You'll need to provide this
const NEW_API_BASE_URL = process.env.NEW_API_BASE_URL; // You'll need to provide this

// Temporary mock data - will be replaced with your actual API
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
  
  // Search healthcare facilities using new API
  app.get("/api/search-facilities", async (req, res) => {
    try {
      const { query, location } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }

      // Filter mock facilities based on search query
      const searchTerm = query.toLowerCase();
      const filteredFacilities = mockHealthcareFacilities.filter(facility =>
        facility.name.toLowerCase().includes(searchTerm) ||
        facility.type.toLowerCase().includes(searchTerm) ||
        facility.address.toLowerCase().includes(searchTerm)
      );

      // Store facilities in our database and return them
      const facilities = await Promise.all(
        filteredFacilities.slice(0, 10).map(async (facilityData) => {
          // Check if facility already exists
          let storedFacility = await storage.getFacilityByPlaceId(facilityData.placeId);
          if (!storedFacility) {
            storedFacility = await storage.createFacility(facilityData);
          }
          return storedFacility;
        })
      );

      res.json({ facilities });
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
