import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const parts = pgTable("parts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  minimumQuantity: integer("minimum_quantity").notNull().default(0),
  location: text("location").notNull(),
});

export const usageHistory = pgTable("usage_history", {
  id: serial("id").primaryKey(),
  partId: integer("part_id").notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  usedBy: integer("used_by").notNull(),
  usedAt: timestamp("used_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPartSchema = createInsertSchema(parts).pick({
  name: true,
  description: true,
  stockQuantity: true,
  minimumQuantity: true,
  location: true,
});

export const insertUsageSchema = createInsertSchema(usageHistory).pick({
  partId: true,
  quantity: true,
  reason: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPart = z.infer<typeof insertPartSchema>;
export type InsertUsage = z.infer<typeof insertUsageSchema>;
export type User = typeof users.$inferSelect;
export type Part = typeof parts.$inferSelect;
export type UsageHistory = typeof usageHistory.$inferSelect;
