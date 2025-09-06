import { apiRequest } from "./queryClient";
import type { NewsFilters, Article } from "@shared/schema";

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

interface NewsSource {
  id: string | null;
  name: string;
  description?: string;
  url?: string;
  category?: string;
  language?: string;
  country?: string;
}

export async function fetchNews(filters: NewsFilters = {}): Promise<NewsResponse> {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        queryParams.set(key, value.join(','));
      } else {
        queryParams.set(key, value.toString());
      }
    }
  });

  const response = await apiRequest(
    'GET',
    `/api/news?${queryParams.toString()}`
  );
  
  return response.json();
}

export async function searchNews(filters: NewsFilters = {}): Promise<NewsResponse> {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        queryParams.set(key, value.join(','));
      } else {
        queryParams.set(key, value.toString());
      }
    }
  });

  const response = await apiRequest(
    'GET',
    `/api/news/search?${queryParams.toString()}`
  );
  
  return response.json();
}

export async function fetchNewsSources(country?: string, category?: string): Promise<{ sources: NewsSource[] }> {
  const queryParams = new URLSearchParams();
  
  if (country) queryParams.set('country', country);
  if (category) queryParams.set('category', category);

  const response = await apiRequest(
    'GET',
    `/api/news/sources?${queryParams.toString()}`
  );
  
  return response.json();
}

export async function summarizeArticles(
  articles: { title: string; content: string; description?: string }[],
  summaryLength?: "short" | "medium" | "long"
): Promise<{ summaries: string[] }> {
  const response = await apiRequest(
    'POST',
    '/api/summarize',
    { articles, summaryLength }
  );
  
  return response.json();
}

export async function summarizeArticle(
  articleId: string,
  summaryLength?: "short" | "medium" | "long"
): Promise<{ article: Article; summary: string }> {
  const response = await apiRequest(
    'POST',
    `/api/summarize-article/${articleId}`,
    { summaryLength }
  );
  
  return response.json();
}

export async function generateTopicSummary(
  topic: string
): Promise<{
  topic: string;
  totalArticles: number;
  articlesAnalyzed: number;
  summary: string;
  sourceLinks: Array<{title: string; url: string; source: string}>;
  lastUpdated: string;
}> {
  const response = await apiRequest(
    'POST',
    '/api/topic-summary',
    { topic }
  );
  
  return response.json();
}
