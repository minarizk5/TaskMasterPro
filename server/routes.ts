import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up auth routes: /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Task routes
  app.get("/api/tasks", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const tasks = await storage.getUserTasks(req.user.id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const validatedData = insertTaskSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const task = await storage.getTask(parseInt(req.params.id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if task belongs to current user
      if (task.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.put("/api/tasks/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const task = await storage.getTask(parseInt(req.params.id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if task belongs to current user
      if (task.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTask = await storage.updateTask(parseInt(req.params.id), req.body);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const task = await storage.getTask(parseInt(req.params.id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if task belongs to current user
      if (task.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTask(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Calendar/Date-based routes
  app.get("/api/tasks/date/:date", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const tasks = await storage.getTasksByDate(req.user.id, date);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks for date" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/completion", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const stats = await storage.getTaskCompletionStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completion stats" });
    }
  });

  app.get("/api/analytics/categories", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const categories = await storage.getTasksByCategory(req.user.id);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category stats" });
    }
  });

  app.get("/api/analytics/weekly", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const weeklyActivity = await storage.getWeeklyActivity(req.user.id);
      res.json(weeklyActivity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly activity" });
    }
  });

  // User profile update
  app.put("/api/user/profile", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      // Don't allow password updates through this endpoint
      const { password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const categories = await storage.getTaskCategories(req.user.id);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  app.post("/api/categories", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const newCategory = {
        name: req.body.name,
        color: req.body.color || "#" + Math.floor(Math.random()*16777215).toString(16), // Generate random color if not provided
        userId: req.user.id
      };
      
      const category = await storage.createTaskCategory(newCategory);
      res.status(201).json(category);
    } catch (error) {
      console.error("Failed to create category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
