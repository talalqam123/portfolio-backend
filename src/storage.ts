import session from "express-session";
import connectPg from "connect-pg-simple";
import { 
  users, caseStudies, contactMessages, siteSettings,
  type User, type InsertUser, 
  type CaseStudy, type InsertCaseStudy,
  type ContactMessage, type InsertContactMessage,
  type SiteSetting, type InsertSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";
import { pool } from "./db";

const PgStore = connectPg(session);
type SessionStore = InstanceType<typeof PgStore>;

// Interface with full CRUD operations for all entities
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Case study operations
  getCaseStudy(id: number): Promise<CaseStudy | undefined>;
  getCaseStudyBySlug(slug: string): Promise<CaseStudy | undefined>;
  getCaseStudies(limit?: number, featured?: boolean): Promise<CaseStudy[]>;
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  updateCaseStudy(id: number, caseStudy: Partial<InsertCaseStudy>): Promise<CaseStudy>;
  deleteCaseStudy(id: number): Promise<boolean>;
  
  // Contact message operations
  getContactMessages(limit?: number, unreadOnly?: boolean): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  markMessageAsRead(id: number): Promise<boolean>;
  deleteContactMessage(id: number): Promise<boolean>;
  
  // Settings operations
  getSetting(key: string): Promise<SiteSetting | undefined>;
  getSettingsByCategory(category: string): Promise<SiteSetting[]>;
  getAllSettings(): Promise<SiteSetting[]>;
  saveSetting(setting: InsertSetting): Promise<SiteSetting>;
  
  // Session store for auth
  sessionStore: SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;
  
  constructor() {
    this.sessionStore = new PgStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Case study operations
  async getCaseStudy(id: number): Promise<CaseStudy | undefined> {
    const [study] = await db.select().from(caseStudies).where(eq(caseStudies.id, id));
    return study;
  }
  
  async getCaseStudyBySlug(slug: string): Promise<CaseStudy | undefined> {
    const [study] = await db.select().from(caseStudies).where(eq(caseStudies.slug, slug));
    return study;
  }
  
  async getCaseStudies(limit?: number, featured?: boolean): Promise<CaseStudy[]> {
    // Build query based on conditions
    if (featured !== undefined) {
      if (limit) {
        return await db.select()
          .from(caseStudies)
          .where(eq(caseStudies.featured, featured))
          .orderBy(desc(caseStudies.publishDate))
          .limit(limit);
      } else {
        return await db.select()
          .from(caseStudies)
          .where(eq(caseStudies.featured, featured))
          .orderBy(desc(caseStudies.publishDate));
      }
    } else {
      if (limit) {
        return await db.select()
          .from(caseStudies)
          .orderBy(desc(caseStudies.publishDate))
          .limit(limit);
      } else {
        return await db.select()
          .from(caseStudies)
          .orderBy(desc(caseStudies.publishDate));
      }
    }
  }
  
  async createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const [study] = await db.insert(caseStudies).values(caseStudy).returning();
    return study;
  }
  
  async updateCaseStudy(id: number, caseStudy: Partial<InsertCaseStudy>): Promise<CaseStudy> {
    const [updated] = await db
      .update(caseStudies)
      .set({ ...caseStudy, updatedAt: new Date() })
      .where(eq(caseStudies.id, id))
      .returning();
    return updated;
  }
  
  async deleteCaseStudy(id: number): Promise<boolean> {
    const result = await db.delete(caseStudies).where(eq(caseStudies.id, id)).returning();
    return result.length > 0;
  }
  
  // Contact message operations
  async getContactMessages(limit?: number, unreadOnly?: boolean): Promise<ContactMessage[]> {
    // Build query based on conditions
    if (unreadOnly) {
      if (limit) {
        return await db.select()
          .from(contactMessages)
          .where(eq(contactMessages.read, false))
          .orderBy(desc(contactMessages.createdAt))
          .limit(limit);
      } else {
        return await db.select()
          .from(contactMessages)
          .where(eq(contactMessages.read, false))
          .orderBy(desc(contactMessages.createdAt));
      }
    } else {
      if (limit) {
        return await db.select()
          .from(contactMessages)
          .orderBy(desc(contactMessages.createdAt))
          .limit(limit);
      } else {
        return await db.select()
          .from(contactMessages)
          .orderBy(desc(contactMessages.createdAt));
      }
    }
  }
  
  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }
  
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [created] = await db.insert(contactMessages).values(message).returning();
    return created;
  }
  
  async markMessageAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(contactMessages)
      .set({ read: true })
      .where(eq(contactMessages.id, id))
      .returning();
    return result.length > 0;
  }
  
  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning();
    return result.length > 0;
  }
  
  // Settings operations
  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }
  
  async getSettingsByCategory(category: string): Promise<SiteSetting[]> {
    return await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.category, category))
      .orderBy(asc(siteSettings.key));
  }
  
  async getAllSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings).orderBy(asc(siteSettings.category), asc(siteSettings.key));
  }
  
  async saveSetting(setting: InsertSetting): Promise<SiteSetting> {
    // Check if setting already exists
    const existing = await this.getSetting(setting.key);
    
    if (existing) {
      // Update
      const [updated] = await db
        .update(siteSettings)
        .set({ ...setting, updatedAt: new Date() })
        .where(eq(siteSettings.key, setting.key))
        .returning();
      return updated;
    } else {
      // Insert
      const [created] = await db.insert(siteSettings).values(setting).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
