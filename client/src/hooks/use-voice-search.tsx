import { useState, useCallback } from "react";
import { useSpeechRecognition } from "./use-speech-recognition";

interface UseVoiceSearchOptions {
  language?: string;
  onSearch?: (query: string) => void;
}

interface VoiceSearchHook {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  startVoiceSearch: () => void;
  stopVoiceSearch: () => void;
  error: string | null;
}

export function useVoiceSearch(options: UseVoiceSearchOptions = {}): VoiceSearchHook {
  const { language = "en-US", onSearch } = options;
  const [error, setError] = useState<string | null>(null);

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    language,
    continuous: false,
    onResult: (result) => {
      if (result.isFinal && result.transcript.trim()) {
        // Process the voice command
        processVoiceCommand(result.transcript.trim());
        resetTranscript();
      }
    },
    onError: (errorMessage) => {
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    },
  });

  const processVoiceCommand = useCallback((command: string) => {
    // Extract search parameters from voice command
    const lowerCommand = command.toLowerCase();
    
    // Simple command processing - can be enhanced with NLP
    let searchQuery = command;
    
    // Remove common voice search prefixes
    const prefixes = [
      "search for",
      "find",
      "show me",
      "get",
      "look for",
      "filter",
    ];
    
    for (const prefix of prefixes) {
      if (lowerCommand.startsWith(prefix)) {
        searchQuery = command.substring(prefix.length).trim();
        break;
      }
    }
    
    if (onSearch && searchQuery) {
      onSearch(searchQuery);
    }
  }, [onSearch]);

  const startVoiceSearch = useCallback(() => {
    setError(null);
    startListening();
  }, [startListening]);

  const stopVoiceSearch = useCallback(() => {
    stopListening();
  }, [stopListening]);

  return {
    isListening,
    transcript,
    isSupported,
    startVoiceSearch,
    stopVoiceSearch,
    error,
  };
}
