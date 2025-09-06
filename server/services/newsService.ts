import { type NewsFilters } from "@shared/schema";

interface NewsAPISource {
  id: string | null;
  name: string;
}

interface NewsAPIArticle {
  source: NewsAPISource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

export class NewsService {
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';

  constructor() {
    this.apiKey = process.env.NEWS_API_KEY || process.env.NEWSAPI_KEY || '';
    if (!this.apiKey) {
      throw new Error('NEWS_API_KEY environment variable is required');
    }
  }

  async fetchTopHeadlines(filters: NewsFilters = {}): Promise<NewsAPIResponse> {
    const params = new URLSearchParams();
    
    if (filters.country) params.set('country', filters.country);
    if (filters.category) params.set('category', filters.category);
    if (filters.sources && filters.sources.length > 0) {
      params.set('sources', filters.sources.join(','));
    }
    if (filters.q) params.set('q', filters.q);
    if (filters.pageSize) params.set('pageSize', filters.pageSize.toString());
    if (filters.page) params.set('page', filters.page.toString());

    // If no sources are specified and no country is specified, default to US
    if (!filters.sources && !filters.country) {
      params.set('country', 'us');
    }

    const url = `${this.baseUrl}/top-headlines?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`News API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async searchEverything(filters: NewsFilters = {}): Promise<NewsAPIResponse> {
    const params = new URLSearchParams();
    
    if (filters.q) params.set('q', filters.q);
    if (filters.sources && filters.sources.length > 0) {
      params.set('sources', filters.sources.join(','));
    }
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.pageSize) params.set('pageSize', filters.pageSize.toString());
    if (filters.page) params.set('page', filters.page.toString());

    // Default query if none specified
    if (!filters.q && (!filters.sources || filters.sources.length === 0)) {
      params.set('q', 'technology');
    }

    const url = `${this.baseUrl}/everything?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`News API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async getSources(country?: string, category?: string): Promise<{ sources: NewsAPISource[] }> {
    const params = new URLSearchParams();
    
    if (country) params.set('country', country);
    if (category) params.set('category', category);

    const url = `${this.baseUrl}/sources?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`News API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }
}
