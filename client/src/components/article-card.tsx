import { useState } from "react";
import { ExternalLink, Bookmark, Share2, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { summarizeArticle } from "@/lib/newsApi";
import type { Article } from "@shared/schema";

interface ArticleCardProps {
  article: Article;
  onSummarize?: (articleId: string, summary: string) => void;
}

export function ArticleCard({ article, onSummarize }: ArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const summarizeMutation = useMutation({
    mutationFn: ({ articleId, summaryLength }: { articleId: string; summaryLength?: "short" | "medium" | "long" }) =>
      summarizeArticle(articleId, summaryLength),
    onSuccess: (data) => {
      onSummarize?.(data.article.id, data.summary);
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      toast({
        title: "Summary Generated",
        description: "AI summary has been generated for this article.",
      });
    },
    onError: () => {
      toast({
        title: "Summary Failed",
        description: "Unable to generate AI summary. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleReadFullArticle = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Bookmark Removed" : "Article Bookmarked",
      description: isBookmarked 
        ? "Article removed from bookmarks"
        : "Article saved to bookmarks",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description || "",
          url: article.url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(article.url);
        toast({
          title: "Link Copied",
          description: "Article link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Unable to share article",
          variant: "destructive",
        });
      }
    }
  };

  const handleSummarize = () => {
    summarizeMutation.mutate({ articleId: article.id });
  };

  const getTimeAgo = (publishedAt: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(publishedAt).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return new Date(publishedAt).toLocaleDateString();
  };

  const source = article.source as any;
  const sourceName = source?.name || "Unknown Source";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-article-${article.id}`}>
      {article.urlToImage && (
        <img
          src={article.urlToImage}
          alt={article.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
          data-testid={`img-article-${article.id}`}
        />
      )}
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs" data-testid={`badge-source-${article.id}`}>
            {sourceName}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            <span data-testid={`text-time-${article.id}`}>{getTimeAgo(article.publishedAt)}</span>
          </div>
        </div>

        <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary cursor-pointer" 
            onClick={handleReadFullArticle}
            data-testid={`text-title-${article.id}`}>
          {article.title}
        </h3>

        {/* AI Summary or Description */}
        <div className="mb-3">
          {article.aiSummary ? (
            <div className="space-y-2">
              <div className="flex items-center text-xs text-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                <span>AI Summary</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-summary-${article.id}`}>
                {article.aiSummary}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {article.description && (
                <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-description-${article.id}`}>
                  {article.description}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSummarize}
                disabled={summarizeMutation.isPending}
                className="text-xs"
                data-testid={`button-summarize-${article.id}`}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {summarizeMutation.isPending ? "Generating..." : "Generate AI Summary"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="link"
            onClick={handleReadFullArticle}
            className="p-0 h-auto text-primary hover:text-primary/80 text-sm font-medium"
            data-testid={`link-read-full-${article.id}`}
          >
            Read Full Article
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleBookmark}
              data-testid={`button-bookmark-${article.id}`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShare}
              data-testid={`button-share-${article.id}`}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
