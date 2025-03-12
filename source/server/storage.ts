import { users, parts, usageHistory } from "@shared/schema";
import type { User, Part, UsageHistory, InsertUser, InsertPart, InsertUsage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Part operations
  getParts(): Promise<Part[]>;
  getPart(id: number): Promise<Part | undefined>;
  createPart(part: InsertPart): Promise<Part>;
  updatePart(id: number, part: Partial<InsertPart>): Promise<Part>;
  deletePart(id: number): Promise<void>;

  // Usage history operations
  getUsageHistory(): Promise<UsageHistory[]>;
  recordUsage(usage: InsertUsage & { usedBy: number }): Promise<UsageHistory>;

  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private parts: Map<number, Part>;
  private usageHistory: Map<number, UsageHistory>;
  private currentId: { users: number; parts: number; usage: number };
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.parts = new Map();
    this.usageHistory = new Map();
    this.currentId = { users: 1, parts: 1, usage: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getParts(): Promise<Part[]> {
    return Array.from(this.parts.values());
  }

  async getPart(id: number): Promise<Part | undefined> {
    return this.parts.get(id);
  }

  async createPart(insertPart: InsertPart): Promise<Part> {
    const id = this.currentId.parts++;
    const part: Part = { ...insertPart, id };
    this.parts.set(id, part);
    return part;
  }

  async updatePart(id: number, partUpdate: Partial<InsertPart>): Promise<Part> {
    const existingPart = await this.getPart(id);
    if (!existingPart) {
      throw new Error("Part not found");
    }
    const updatedPart = { ...existingPart, ...partUpdate };
    this.parts.set(id, updatedPart);
    return updatedPart;
  }

  async deletePart(id: number): Promise<void> {
    this.parts.delete(id);
  }

  async getUsageHistory(): Promise<UsageHistory[]> {
    return Array.from(this.usageHistory.values());
  }

  async recordUsage(usage: InsertUsage & { usedBy: number }): Promise<UsageHistory> {
    const id = this.currentId.usage++;
    const historyEntry: UsageHistory = {
      ...usage,
      id,
      usedAt: new Date(),
    };
    this.usageHistory.set(id, historyEntry);

    // Update part quantity
    const part = await this.getPart(usage.partId);
    if (!part) {
      throw new Error("Part not found");
    }
    await this.updatePart(usage.partId, {
      stockQuantity: part.stockQuantity - usage.quantity,
    });

    return historyEntry;
  }
}

export const storage = new MemStorage();
