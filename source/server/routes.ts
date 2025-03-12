import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPartSchema, insertUsageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Parts management
  app.get("/api/parts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parts = await storage.getParts();
    res.json(parts);
  });

  app.post("/api/parts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validation = insertPartSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }
    const part = await storage.createPart(validation.data);
    res.status(201).json(part);
  });

  app.patch("/api/parts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const validation = insertPartSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }
    try {
      const part = await storage.updatePart(id, validation.data);
      res.json(part);
    } catch (error) {
      res.status(404).json({ message: "Part not found" });
    }
  });

  app.delete("/api/parts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    await storage.deletePart(id);
    res.sendStatus(204);
  });

  // Usage history
  app.get("/api/usage", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const history = await storage.getUsageHistory();
    res.json(history);
  });

  app.post("/api/usage", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validation = insertUsageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }
    const usage = await storage.recordUsage({
      ...validation.data,
      usedBy: req.user!.id,
    });
    res.status(201).json(usage);
  });

  const httpServer = createServer(app);
  return httpServer;
}
