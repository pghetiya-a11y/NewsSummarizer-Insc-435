import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  url: text("url").notNull(),
  urlToImage: text("url_to_image"),
  publishedAt: timestamp("published_at").notNull(),
  source: jsonb("source").notNull(),
  author: text("author"),
  category: text("category"),
  country: text("country"),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  preferredSources: jsonb("preferred_sources").default([]),
  autoSummarize: boolean("auto_summarize").default(true),
  summaryLength: text("summary_length").default("medium"),
  voiceSearchEnabled: boolean("voice_search_enabled").default(true),
  voiceLanguage: text("voice_language").default("en-US"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
});

export const newsFiltersSchema = z.object({
  country: z.string().optional(),
  category: z.string().optional(),
  sources: z.union([
    z.array(z.string()),
    z.string().transform(val => val.split(',').filter(s => s.trim() !== ''))
  ]).optional(),
  q: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sortBy: z.enum(["relevancy", "popularity", "publishedAt"]).optional(),
  pageSize: z.coerce.number().min(1).max(100).optional(),
  page: z.coerce.number().min(1).optional(),
});

export const summarizeRequestSchema = z.object({
  articles: z.array(z.object({
    title: z.string(),
    content: z.string(),
    description: z.string().optional(),
  })),
  summaryLength: z.enum(["short", "medium", "long"]).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewsFilters = z.infer<typeof newsFiltersSchema>;
export type SummarizeRequest = z.infer<typeof summarizeRequestSchema>;
