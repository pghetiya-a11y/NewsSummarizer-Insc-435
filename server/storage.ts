import { type User, type InsertUser, type Article, type InsertArticle, type UserPreferences, type InsertUserPreferences } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Article methods
  getArticles(filters?: { country?: string; category?: string; sources?: string[] }): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, updates: Partial<Article>): Promise<Article>;
  
  // User preferences methods
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private articles: Map<string, Article>;
  private userPreferences: Map<string, UserPreferences>;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.userPreferences = new Map();
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

  async getArticles(filters?: { country?: string; category?: string; sources?: string[] }): Promise<Article[]> {
    let articles = Array.from(this.articles.values());
    
    if (filters?.country) {
      articles = articles.filter(article => article.country === filters.country);
    }
    
    if (filters?.category) {
      articles = articles.filter(article => article.category === filters.category);
    }
    
    if (filters?.sources && filters.sources.length > 0) {
      articles = articles.filter(article => {
        const source = article.source as any;
        return filters.sources?.includes(source?.name || source?.id);
      });
    }
    
    return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const article: Article = { 
      ...insertArticle, 
      id,
      createdAt: new Date()
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const existing = this.articles.get(id);
    if (!existing) {
      throw new Error(`Article with id ${id} not found`);
    }
    const updated = { ...existing, ...updates };
    this.articles.set(id, updated);
    return updated;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(
      prefs => prefs.userId === userId
    );
  }

  async createUserPreferences(insertPrefs: InsertUserPreferences): Promise<UserPreferences> {
    const id = randomUUID();
    const prefs: UserPreferences = { ...insertPrefs, id };
    this.userPreferences.set(id, prefs);
    return prefs;
  }

  async updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const existing = Array.from(this.userPreferences.values()).find(
      prefs => prefs.userId === userId
    );
    if (!existing) {
      throw new Error(`User preferences for user ${userId} not found`);
    }
    const updated = { ...existing, ...updates };
    this.userPreferences.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
