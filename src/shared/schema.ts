import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Case Studies table
export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image").notNull(),
  clientName: text("client_name"),
  clientIndustry: text("client_industry"),
  duration: text("duration"),
  services: text("services").array(),
  challenge: text("challenge"),
  solution: text("solution"),
  result: text("result"),
  images: text("images").array(),
  technologies: text("technologies").array().notNull(),
  testimonial: text("testimonial"),
  testimonialAuthor: text("testimonial_author"),
  testimonialRole: text("testimonial_role"),
  featured: boolean("featured").default(false),
  publishDate: timestamp("publish_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings for the admin panel
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  category: text("category").notNull(),
  type: text("type").notNull(), // text, number, boolean, json, etc.
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for insert and validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true,
});

// Create a custom Zod schema for case studies
const caseStudySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  description: z.string().min(1, "Description is required"),
  coverImage: z.string().min(5, "Cover image URL must be at least 5 characters"),
  clientName: z.string().optional(),
  clientIndustry: z.string().optional(),
  duration: z.string().optional(),
  services: z.array(z.string()).optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  result: z.string().optional(),
  images: z.array(z.string()).optional(),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  testimonial: z.string().optional(),
  testimonialAuthor: z.string().optional(),
  testimonialRole: z.string().optional(),
  featured: z.boolean().optional(),
});

// Replace the auto-generated schema with our custom one
export const insertCaseStudySchema = caseStudySchema;

export const insertContactSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

export const insertSettingSchema = createInsertSchema(siteSettings).pick({
  key: true,
  value: true,
  description: true,
  category: true,
  type: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;
export type CaseStudy = typeof caseStudies.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
