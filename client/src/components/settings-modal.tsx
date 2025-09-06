import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchNewsSources } from "@/lib/newsApi";
import { useToast } from "@/hooks/use-toast";

interface UserPreferences {
  preferredSources: string[];
  autoSummarize: boolean;
  summaryLength: "short" | "medium" | "long";
  voiceSearchEnabled: boolean;
  voiceLanguage: string;
}

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
}

const VOICE_LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "it-IT", label: "Italian" },
  { value: "pt-PT", label: "Portuguese" },
  { value: "zh-CN", label: "Chinese" },
  { value: "ja-JP", label: "Japanese" },
  { value: "ko-KR", label: "Korean" },
];

export function SettingsModal({
  open,
  onOpenChange,
  preferences,
  onPreferencesChange,
}: SettingsModalProps) {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);
  const { toast } = useToast();

  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ['/api/news/sources'],
    enabled: open,
  });

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleSave = () => {
    onPreferencesChange(localPreferences);
    
    // Save to localStorage
    localStorage.setItem('newsai-preferences', JSON.stringify(localPreferences));
    
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
    
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalPreferences(preferences);
    onOpenChange(false);
  };

  const toggleSource = (sourceId: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      preferredSources: prev.preferredSources.includes(sourceId)
        ? prev.preferredSources.filter(id => id !== sourceId)
        : [...prev.preferredSources, sourceId]
    }));
  };

  const sources = sourcesData?.sources || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto" data-testid="modal-settings">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preferred News Sources */}
          <div>
            <h3 className="font-medium mb-3">Preferred News Sources</h3>
            {sourcesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sources.slice(0, 20).map((source: any) => (
                  <div key={source.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`source-${source.id}`}
                      checked={localPreferences.preferredSources.includes(source.id || source.name)}
                      onCheckedChange={() => toggleSource(source.id || source.name)}
                      data-testid={`checkbox-source-${source.id || source.name}`}
                    />
                    <Label
                      htmlFor={`source-${source.id}`}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <span className="text-sm">{source.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Summary Settings */}
          <div>
            <h3 className="font-medium mb-3">AI Summary Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="auto-summarize"
                  checked={localPreferences.autoSummarize}
                  onCheckedChange={(checked) =>
                    setLocalPreferences(prev => ({ ...prev, autoSummarize: checked as boolean }))
                  }
                  data-testid="checkbox-auto-summarize"
                />
                <Label htmlFor="auto-summarize">Automatically summarize articles</Label>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">Summary Length</Label>
                <Select
                  value={localPreferences.summaryLength}
                  onValueChange={(value: "short" | "medium" | "long") =>
                    setLocalPreferences(prev => ({ ...prev, summaryLength: value }))
                  }
                >
                  <SelectTrigger data-testid="select-summary-length">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                    <SelectItem value="medium">Medium (3-4 sentences)</SelectItem>
                    <SelectItem value="long">Long (5-6 sentences)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Voice Search Settings */}
          <div>
            <h3 className="font-medium mb-3">Voice Search</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="voice-search"
                  checked={localPreferences.voiceSearchEnabled}
                  onCheckedChange={(checked) =>
                    setLocalPreferences(prev => ({ ...prev, voiceSearchEnabled: checked as boolean }))
                  }
                  data-testid="checkbox-voice-search"
                />
                <Label htmlFor="voice-search">Enable voice search</Label>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">Language</Label>
                <Select
                  value={localPreferences.voiceLanguage}
                  onValueChange={(value) =>
                    setLocalPreferences(prev => ({ ...prev, voiceLanguage: value }))
                  }
                >
                  <SelectTrigger data-testid="select-voice-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel-settings"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            data-testid="button-save-settings"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
