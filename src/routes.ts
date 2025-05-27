import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCaseStudySchema, insertContactSchema, insertSettingSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { sendContactFormEmail, sendNewCaseStudyNotification } from "./email";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Contact form endpoint
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      
      // Store the message in the database
      const savedMessage = await storage.createContactMessage(contactData);
      
      // Send the email notification
      const emailSent = await sendContactFormEmail(
        contactData.name,
        contactData.email,
        contactData.subject,
        contactData.message
      );
      
      if (emailSent) {
        res.status(201).json({
          success: true,
          message: "Your message has been sent!",
          data: savedMessage
        });
      } else {
        // We still save the message in DB even if email fails
        res.status(201).json({
          success: true,
          message: "Your message was received but there was an issue sending the email notification.",
          data: savedMessage
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid form data",
          errors: error.errors
        });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({
          success: false,
          message: "An error occurred while processing your request."
        });
      }
    }
  });

  // Public case studies endpoints
  app.get("/api/case-studies", async (req: Request, res: Response) => {
    try {
      const caseStudies = await storage.getCaseStudies();
      res.json(caseStudies);
    } catch (error) {
      console.error("Error fetching case studies:", error);
      res.status(500).json({ error: "Failed to fetch case studies" });
    }
  });

  app.get("/api/case-studies/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const caseStudy = await storage.getCaseStudyBySlug(slug);
      
      if (!caseStudy) {
        return res.status(404).json({ error: "Case study not found" });
      }
      
      res.json(caseStudy);
    } catch (error) {
      console.error("Error fetching case study:", error);
      res.status(500).json({ error: "Failed to fetch case study" });
    }
  });

  // Admin endpoints - protected by auth middleware
  
  // Case studies management
  app.get("/api/admin/case-studies", async (req: Request, res: Response) => {
    try {
      const caseStudies = await storage.getCaseStudies();
      res.json(caseStudies);
    } catch (error) {
      console.error("Error fetching case studies:", error);
      res.status(500).json({ error: "Failed to fetch case studies" });
    }
  });

  app.get("/api/admin/case-studies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const caseStudy = await storage.getCaseStudy(id);
      
      if (!caseStudy) {
        return res.status(404).json({ error: "Case study not found" });
      }
      
      res.json(caseStudy);
    } catch (error) {
      console.error("Error fetching case study:", error);
      res.status(500).json({ error: "Failed to fetch case study" });
    }
  });

  app.post("/api/admin/case-studies", async (req: Request, res: Response) => {
    try {
      const caseStudyData = insertCaseStudySchema.parse(req.body);
      const createdCaseStudy = await storage.createCaseStudy(caseStudyData);
      
      // Send notification email
      await sendNewCaseStudyNotification(
        createdCaseStudy.title, 
        createdCaseStudy.slug, 
        createdCaseStudy.clientName
      );
      
      res.status(201).json(createdCaseStudy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Invalid case study data", 
          details: error.errors 
        });
      } else {
        console.error("Error creating case study:", error);
        res.status(500).json({ error: "Failed to create case study" });
      }
    }
  });

  app.put("/api/admin/case-studies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const caseStudyData = insertCaseStudySchema.partial().parse(req.body);
      
      const updatedCaseStudy = await storage.updateCaseStudy(id, caseStudyData);
      res.json(updatedCaseStudy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Invalid case study data", 
          details: error.errors 
        });
      } else {
        console.error("Error updating case study:", error);
        res.status(500).json({ error: "Failed to update case study" });
      }
    }
  });

  app.delete("/api/admin/case-studies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCaseStudy(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Case study not found" });
      }
    } catch (error) {
      console.error("Error deleting case study:", error);
      res.status(500).json({ error: "Failed to delete case study" });
    }
  });

  // Contact messages management
  app.get("/api/admin/messages", async (req: Request, res: Response) => {
    try {
      const unreadOnly = req.query.unread === "true";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const messages = await storage.getContactMessages(limit, unreadOnly);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/admin/messages/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.getContactMessage(id);
      
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ error: "Failed to fetch message" });
    }
  });

  app.put("/api/admin/messages/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markMessageAsRead(id);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Message not found" });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  app.delete("/api/admin/messages/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContactMessage(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Message not found" });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Site settings management
  app.get("/api/admin/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/admin/settings/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const settings = await storage.getSettingsByCategory(category);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings by category:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings/:key", async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const { value, category, type = 'text', description = '' } = insertSettingSchema.parse(req.body);
      
      const setting = await storage.saveSetting({ key, value, category, type, description });
      res.json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Invalid setting data", 
          details: error.errors 
        });
      } else {
        console.error("Error saving setting:", error);
        res.status(500).json({ error: "Failed to save setting" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
