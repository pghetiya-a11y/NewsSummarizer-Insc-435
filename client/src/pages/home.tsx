import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { NewsHeader } from "@/components/news-header";
import { ArticleCard } from "@/components/article-card";
import { SettingsModal } from "@/components/settings-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchNews, searchNews } from "@/lib/newsApi";
import type { Article } from "@shared/schema";

interface NewsFilters {
  country?: string;
  category?: string;
  sources?: string[];
  q?: string;
  pageSize?: number;
  page?: number;
}

interface UserPreferences {
  preferredSources: string[];
  autoSummarize: boolean;
  summaryLength: "short" | "medium" | "long";
  voiceSearchEnabled: boolean;
  voiceLanguage: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  preferredSources: [],
  autoSummarize: true,
  summaryLength: "medium",
  voiceSearchEnabled: true,
  voiceLanguage: "en-US",
};

export default function Home() {
  const [filters, setFilters] = useState<NewsFilters>({
    pageSize: 20,
    page: 1,
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [articles, setArticles] = useState<Article[]>([]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('newsai-preferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('newsai-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Apply preferred sources to filters
  const effectiveFilters = {
    ...filters,
    sources: preferences.preferredSources.length > 0 ? preferences.preferredSources : filters.sources,
  };

  const {
    data: newsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['/api/news', effectiveFilters],
    queryFn: () => {
      if (effectiveFilters.q) {
        return searchNews(effectiveFilters);
      }
      return fetchNews(effectiveFilters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (newsData?.articles) {
      setArticles(newsData.articles);
    }
  }, [newsData]);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('newsai-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('newsai-theme', 'light');
    }
  };

  const handleFiltersChange = (newFilters: NewsFilters) => {
    setFilters({ ...newFilters, pageSize: 20, page: 1 });
  };

  const handlePreferencesChange = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('newsai-preferences', JSON.stringify(newPreferences));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  };

  const handleSummarize = (articleId: string, summary: string) => {
    setArticles(prev => prev.map(article =>
      article.id === articleId ? { ...article, aiSummary: summary } : article
    ));
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <NewsHeader
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSettingsClick={() => setSettingsOpen(true)}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
          resultsCount={0}
          onRefresh={handleRefresh}
        />
        
        <main className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
              <p className="text-muted-foreground mb-4" data-testid="text-error-message">
                {error instanceof Error ? error.message : "We couldn't fetch the latest news. Please check your connection and try again."}
              </p>
              <Button onClick={handleRefresh} data-testid="button-retry">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>

        <SettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          preferences={preferences}
          onPreferencesChange={handlePreferencesChange}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NewsHeader
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSettingsClick={() => setSettingsOpen(true)}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        isLoading={isLoading}
        resultsCount={articles.length}
        onRefresh={handleRefresh}
      />
      
      <main className="container mx-auto px-4 py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12" data-testid="loading-state">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">
              Fetching and summarizing news articles...
            </p>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && articles.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="articles-grid">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onSummarize={handleSummarize}
                />
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-8">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                size="lg"
                data-testid="button-load-more"
              >
                Load More Articles
              </Button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && articles.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms to find more articles.
              </p>
              <Button onClick={() => handleFiltersChange({})} variant="outline">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        preferences={preferences}
        onPreferencesChange={handlePreferencesChange}
      />
    </div>
  );
}
