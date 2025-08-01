import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const healthcareFacilities = pgTable("healthcare_facilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  placeId: text("place_id").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // hospital, pharmacy, clinic
  address: text("address").notNull(),
  phone: text("phone"),
  hours: text("hours"),
  rating: text("rating"),
  distance: text("distance"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  facilityId: varchar("facility_id").references(() => healthcareFacilities.id),
  searchQuery: text("search_query").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHealthcareFacilitySchema = createInsertSchema(healthcareFacilities).pick({
  placeId: true,
  name: true,
  type: true,
  address: true,
  phone: true,
  hours: true,
  rating: true,
  distance: true,
  latitude: true,
  longitude: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).pick({
  userId: true,
  facilityId: true,
  searchQuery: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertHealthcareFacility = z.infer<typeof insertHealthcareFacilitySchema>;
export type HealthcareFacility = typeof healthcareFacilities.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
