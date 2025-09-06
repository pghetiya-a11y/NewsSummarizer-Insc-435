import { useState, useEffect } from "react";
import { Search, Mic, Settings, Moon, Sun, Globe, Tag, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useVoiceSearch } from "@/hooks/use-voice-search";
import { cn } from "@/lib/utils";

interface NewsFilters {
  country?: string;
  category?: string;
  sources?: string[];
  query?: string;
}

interface NewsHeaderProps {
  filters: NewsFilters;
  onFiltersChange: (filters: NewsFilters) => void;
  onSettingsClick: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  isLoading?: boolean;
  resultsCount?: number;
  onRefresh: () => void;
}

const COUNTRIES = [
  { value: "", label: "All Countries" },
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
  { value: "in", label: "India" },
];

const CATEGORIES = [
  { value: "", label: "All Topics" },
  { value: "business", label: "Business" },
  { value: "entertainment", label: "Entertainment" },
  { value: "general", label: "General" },
  { value: "health", label: "Health" },
  { value: "science", label: "Science" },
  { value: "sports", label: "Sports" },
  { value: "technology", label: "Technology" },
];

export function NewsHeader({
  filters,
  onFiltersChange,
  onSettingsClick,
  isDarkMode,
  onThemeToggle,
  isLoading = false,
  resultsCount = 0,
  onRefresh,
}: NewsHeaderProps) {
  const [searchQuery, setSearchQuery] = useState(filters.query || "");

  const { isListening, isSupported, startVoiceSearch, stopVoiceSearch, error } = useVoiceSearch({
    onSearch: (query) => {
      setSearchQuery(query);
      onFiltersChange({ ...filters, query });
    },
  });

  useEffect(() => {
    setSearchQuery(filters.query || "");
  }, [filters.query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, query: searchQuery });
  };

  const handleCountryChange = (country: string) => {
    onFiltersChange({ ...filters, country: country || undefined });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category: category || undefined });
  };

  const clearFilters = () => {
    setSearchQuery("");
    onFiltersChange({});
  };

  const activeFilters = [];
  if (filters.country) {
    const country = COUNTRIES.find(c => c.value === filters.country);
    if (country) activeFilters.push({ key: 'country', label: country.label, value: filters.country });
  }
  if (filters.category) {
    const category = CATEGORIES.find(c => c.value === filters.category);
    if (category) activeFilters.push({ key: 'category', label: category.label, value: filters.category });
  }
  if (filters.query) {
    activeFilters.push({ key: 'query', label: `"${filters.query}"`, value: filters.query });
  }

  const removeFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    if (filterKey === 'country') delete newFilters.country;
    if (filterKey === 'category') delete newFilters.category;
    if (filterKey === 'query') {
      delete newFilters.query;
      setSearchQuery("");
    }
    onFiltersChange(newFilters);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        {/* Logo and Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">NewsAI</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              data-testid="button-refresh"
            >
              <Search className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              data-testid="button-theme-toggle"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Search Bar with Voice Input */}
        <form onSubmit={handleSearchSubmit} className="relative mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for topics, keywords, or countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-3"
              data-testid="input-search"
            />
            {isSupported && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute right-1 top-1/2 transform -translate-y-1/2",
                  isListening && "text-primary animate-pulse"
                )}
                onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                data-testid="button-voice-search"
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>

        {/* Voice Search Feedback */}
        {isListening && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg" data-testid="voice-feedback">
            <div className="flex items-center space-x-3">
              <Mic className="w-5 h-5 text-primary animate-pulse" />
              <div>
                <p className="text-primary font-medium">Listening...</p>
                <p className="text-primary/70 text-sm">Say something like "Show me technology news from USA"</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={stopVoiceSearch}
                className="ml-auto"
                data-testid="button-stop-voice"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Voice Search Error */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            Voice search error: {error}
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Country Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="flex items-center space-x-2" data-testid="button-country-filter">
                <Globe className="w-4 h-4" />
                <span>{COUNTRIES.find(c => c.value === filters.country)?.label || "All Countries"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {COUNTRIES.map((country) => (
                <DropdownMenuItem
                  key={country.value}
                  onClick={() => handleCountryChange(country.value)}
                  data-testid={`option-country-${country.value || 'all'}`}
                >
                  {country.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="flex items-center space-x-2" data-testid="button-category-filter">
                <Tag className="w-4 h-4" />
                <span>{CATEGORIES.find(c => c.value === filters.category)?.label || "All Topics"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {CATEGORIES.map((category) => (
                <DropdownMenuItem
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  data-testid={`option-category-${category.value || 'all'}`}
                >
                  {category.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-clear-filters"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filter Tags */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="flex items-center gap-1"
                data-testid={`badge-filter-${filter.key}`}
              >
                {filter.label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 p-0 hover:bg-primary/20"
                  onClick={() => removeFilter(filter.key)}
                  data-testid={`button-remove-filter-${filter.key}`}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Results Summary */}
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold" data-testid="text-results-count">
                {isLoading ? "Loading..." : `Found ${resultsCount} articles`}
              </h2>
              <p className="text-sm text-muted-foreground" data-testid="text-results-description">
                {activeFilters.length > 0 
                  ? `Filtered by: ${activeFilters.map(f => f.label).join(", ")} • Summarized by AI`
                  : "Latest news • Summarized by AI"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
