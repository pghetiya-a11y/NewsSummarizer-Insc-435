import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { NewsService } from "./services/newsService";
import { GeminiService } from "./services/openaiService";
import { newsFiltersSchema, summarizeRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  let newsService: NewsService;
  let geminiService: GeminiService;

  try {
    newsService = new NewsService();
    geminiService = new GeminiService();
  } catch (error) {
    console.error("Failed to initialize services:", error);
  }

  // Get news articles with filtering
  app.get("/api/news", async (req, res) => {
    try {
      if (!newsService) {
        return res.status(500).json({ 
          message: "News service not available. Please check NEWS_API_KEY environment variable." 
        });
      }

      const filters = newsFiltersSchema.parse(req.query);
      const newsResponse = await newsService.fetchTopHeadlines(filters);
      
      // Convert to our article format and store in memory
      const articles = await Promise.all(
        newsResponse.articles.map(async (apiArticle) => {
          const article = await storage.createArticle({
            title: apiArticle.title,
            description: apiArticle.description,
            content: apiArticle.content,
            url: apiArticle.url,
            urlToImage: apiArticle.urlToImage,
            publishedAt: new Date(apiArticle.publishedAt),
            source: apiArticle.source,
            author: apiArticle.author,
            category: filters.category || null,
            country: filters.country || null,
            aiSummary: null,
          });
          return article;
        })
      );

      res.json({
        status: newsResponse.status,
        totalResults: newsResponse.totalResults,
        articles,
      });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch news articles" 
      });
    }
  });

  // Search news articles
  app.get("/api/news/search", async (req, res) => {
    try {
      if (!newsService) {
        return res.status(500).json({ 
          message: "News service not available. Please check NEWS_API_KEY environment variable." 
        });
      }

      const filters = newsFiltersSchema.parse(req.query);
      const newsResponse = await newsService.searchEverything(filters);
      
      const articles = await Promise.all(
        newsResponse.articles.map(async (apiArticle) => {
          const article = await storage.createArticle({
            title: apiArticle.title,
            description: apiArticle.description,
            content: apiArticle.content,
            url: apiArticle.url,
            urlToImage: apiArticle.urlToImage,
            publishedAt: new Date(apiArticle.publishedAt),
            source: apiArticle.source,
            author: apiArticle.author,
            category: filters.category || null,
            country: filters.country || null,
            aiSummary: null,
          });
          return article;
        })
      );

      res.json({
        status: newsResponse.status,
        totalResults: newsResponse.totalResults,
        articles,
      });
    } catch (error) {
      console.error("Error searching news:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to search news articles" 
      });
    }
  });

  // Get news sources
  app.get("/api/news/sources", async (req, res) => {
    try {
      if (!newsService) {
        return res.status(500).json({ 
          message: "News service not available. Please check NEWS_API_KEY environment variable." 
        });
      }

      const { country, category } = req.query;
      const sources = await newsService.getSources(
        country as string,
        category as string
      );
      
      res.json(sources);
    } catch (error) {
      console.error("Error fetching sources:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch news sources" 
      });
    }
  });

  // Summarize articles with AI
  app.post("/api/summarize", async (req, res) => {
    try {
      if (!geminiService) {
        return res.status(500).json({ 
          message: "Gemini service not available. Please check GEMINI_API_KEY environment variable." 
        });
      }

      const request = summarizeRequestSchema.parse(req.body);
      const summaries = await geminiService.summarizeArticles(request);
      
      res.json({ summaries });
    } catch (error) {
      console.error("Error generating summaries:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate AI summaries" 
      });
    }
  });

  // Summarize single article
  app.post("/api/summarize-article/:id", async (req, res) => {
    try {
      if (!geminiService) {
        return res.status(500).json({ 
          message: "Gemini service not available. Please check GEMINI_API_KEY environment variable." 
        });
      }

      const { id } = req.params;
      const { summaryLength } = req.body;
      
      // Get article from storage (assuming we stored it when fetching news)
      const articles = await storage.getArticles();
      const article = articles.find(a => a.id === id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const summary = await geminiService.summarizeArticle(
        article.title,
        article.content || article.description || "",
        summaryLength
      );

      // Update article with AI summary
      const updatedArticle = await storage.updateArticle(id, { aiSummary: summary });
      
      res.json({ article: updatedArticle, summary });
    } catch (error) {
      console.error("Error summarizing article:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to summarize article" 
      });
    }
  });

  // Get user preferences
  app.get("/api/preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch user preferences" 
      });
    }
  });

  // Create or update user preferences
  app.post("/api/preferences", async (req, res) => {
    try {
      const preferences = await storage.createUserPreferences(req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error creating preferences:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create user preferences" 
      });
    }
  });

  app.put("/api/preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      const preferences = await storage.updateUserPreferences(userId, updates);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to update user preferences" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
