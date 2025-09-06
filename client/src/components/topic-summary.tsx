import { useState } from "react";
import { ExternalLink, FileText, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { generateTopicSummary } from "@/lib/newsApi";
import { useToast } from "@/hooks/use-toast";

interface TopicSummaryProps {
  topic: string;
  onClose?: () => void;
}

interface TopicSummaryData {
  topic: string;
  totalArticles: number;
  articlesAnalyzed: number;
  summary: string;
  sourceLinks: Array<{title: string; url: string; source: string}>;
  lastUpdated: string;
}

export function TopicSummary({ topic, onClose }: TopicSummaryProps) {
  const [summaryData, setSummaryData] = useState<TopicSummaryData | null>(null);
  const { toast } = useToast();

  const summaryMutation = useMutation({
    mutationFn: (searchTopic: string) => generateTopicSummary(searchTopic),
    onSuccess: (data) => {
      setSummaryData(data);
    },
    onError: (error: any) => {
      toast({
        title: "Summary Failed",
        description: error.message || "Unable to generate topic summary. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateSummary = () => {
    summaryMutation.mutate(topic);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (summaryMutation.isPending) {
    return (
      <Card className="mb-6" data-testid="topic-summary-loading">
        <CardContent className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Analyzing "{topic}"</h3>
          <p className="text-muted-foreground">
            Searching recent articles and generating comprehensive summary...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!summaryData) {
    return (
      <Card className="mb-6" data-testid="topic-summary-prompt">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Get Topic Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Get a comprehensive AI-powered summary about "{topic}" based on the latest news articles, 
            with source links for deeper reading.
          </p>
          <Button 
            onClick={handleGenerateSummary}
            disabled={summaryMutation.isPending}
            data-testid="button-generate-topic-summary"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Topic Summary
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6" data-testid="topic-summary-result">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-primary" />
              Topic Summary: {summaryData.topic}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary">
                {summaryData.articlesAnalyzed} articles analyzed
              </Badge>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Updated {formatDate(summaryData.lastUpdated)}</span>
              </div>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* AI Summary */}
        <div className="mb-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-foreground leading-relaxed whitespace-pre-line" data-testid="text-topic-summary">
              {summaryData.summary}
            </p>
          </div>
        </div>

        {/* Source Links */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Sources for Deep Dive Reading ({summaryData.sourceLinks.length})
          </h4>
          <div className="space-y-2">
            {summaryData.sourceLinks.map((link, index) => (
              <div 
                key={index}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                data-testid={`source-link-${index}`}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <h5 className="font-medium text-sm line-clamp-2 mb-1">
                    {link.title}
                  </h5>
                  <Badge variant="outline" className="text-xs">
                    {link.source}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                  data-testid={`button-read-source-${index}`}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}