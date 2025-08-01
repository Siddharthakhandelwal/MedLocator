import { type User, type InsertUser, type HealthcareFacility, type InsertHealthcareFacility, type SearchHistory, type InsertSearchHistory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getFacility(id: string): Promise<HealthcareFacility | undefined>;
  getFacilityByPlaceId(placeId: string): Promise<HealthcareFacility | undefined>;
  createFacility(facility: InsertHealthcareFacility): Promise<HealthcareFacility>;
  updateFacility(id: string, facility: Partial<HealthcareFacility>): Promise<HealthcareFacility>;
  
  getSearchHistory(userId?: string): Promise<SearchHistory[]>;
  createSearchHistory(search: InsertSearchHistory): Promise<SearchHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private facilities: Map<string, HealthcareFacility>;
  private searchHistory: Map<string, SearchHistory>;

  constructor() {
    this.users = new Map();
    this.facilities = new Map();
    this.searchHistory = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getFacility(id: string): Promise<HealthcareFacility | undefined> {
    return this.facilities.get(id);
  }

  async getFacilityByPlaceId(placeId: string): Promise<HealthcareFacility | undefined> {
    return Array.from(this.facilities.values()).find(
      (facility) => facility.placeId === placeId,
    );
  }

  async createFacility(insertFacility: InsertHealthcareFacility): Promise<HealthcareFacility> {
    const id = randomUUID();
    const facility: HealthcareFacility = { 
      ...insertFacility,
      phone: insertFacility.phone || null,
      hours: insertFacility.hours || null,
      rating: insertFacility.rating || null,
      distance: insertFacility.distance || null,
      latitude: insertFacility.latitude || null,
      longitude: insertFacility.longitude || null,
      id,
      createdAt: new Date()
    };
    this.facilities.set(id, facility);
    return facility;
  }

  async updateFacility(id: string, updates: Partial<HealthcareFacility>): Promise<HealthcareFacility> {
    const existing = this.facilities.get(id);
    if (!existing) {
      throw new Error('Facility not found');
    }
    const updated = { ...existing, ...updates };
    this.facilities.set(id, updated);
    return updated;
  }

  async getSearchHistory(userId?: string): Promise<SearchHistory[]> {
    const history = Array.from(this.searchHistory.values())
      .filter(search => !userId || search.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 10);
    return history;
  }

  async createSearchHistory(insertSearch: InsertSearchHistory): Promise<SearchHistory> {
    const id = randomUUID();
    const search: SearchHistory = { 
      ...insertSearch,
      userId: insertSearch.userId || null,
      facilityId: insertSearch.facilityId || null,
      id,
      createdAt: new Date()
    };
    this.searchHistory.set(id, search);
    return search;
  }
}

export const storage = new MemStorage();
