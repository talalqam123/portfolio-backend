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
  clientName: text("client_name").notNull(),
  clientIndustry: text("client_industry").notNull(),
  duration: text("duration"),
  services: text("services").array().notNull(),
  challenge: text("challenge").notNull(),
  solution: text("solution").notNull(),
  result: text("result").notNull(),
  images: text("images").array(),
  technologies: text("technologies").array(),
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

export const insertCaseStudySchema = createInsertSchema(caseStudies).pick({
  title: true,
  slug: true,
  excerpt: true,
  description: true,
  coverImage: true,
  clientName: true,
  clientIndustry: true,
  duration: true,
  services: true,
  challenge: true,
  solution: true,
  result: true,
  images: true,
  technologies: true,
  testimonial: true,
  testimonialAuthor: true,
  testimonialRole: true,
  featured: true,
});

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
