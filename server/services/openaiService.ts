import { GoogleGenAI } from "@google/genai";
import { type SummarizeRequest } from "@shared/schema";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.ai = new GoogleGenAI({ apiKey });
  }

  async summarizeArticles(request: SummarizeRequest): Promise<string[]> {
    const { articles, summaryLength = "medium" } = request;
    
    const lengthInstructions = {
      short: "Summarize in 1-2 concise sentences",
      medium: "Summarize in 3-4 sentences with key details",
      long: "Summarize in 5-6 sentences with comprehensive details"
    };

    const summaries: string[] = [];

    for (const article of articles) {
      try {
        const prompt = `${lengthInstructions[summaryLength]} the following news article while maintaining the key points and important information:

Title: ${article.title}
Content: ${article.content || article.description || "No content available"}

Please provide a clear, informative summary that captures the essence of the article.`;

        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const summary = response.text?.trim() || "Unable to generate summary";
        summaries.push(summary);
      } catch (error) {
        console.error(`Error summarizing article "${article.title}":`, error);
        summaries.push("Summary unavailable due to processing error");
      }
    }

    return summaries;
  }

  async summarizeArticle(title: string, content: string, summaryLength: "short" | "medium" | "long" = "medium"): Promise<string> {
    const lengthInstructions = {
      short: "Summarize in 1-2 concise sentences",
      medium: "Summarize in 3-4 sentences with key details", 
      long: "Summarize in 5-6 sentences with comprehensive details"
    };

    try {
      const prompt = `${lengthInstructions[summaryLength]} the following news article while maintaining the key points and important information:

Title: ${title}
Content: ${content || "No content available"}

Please provide a clear, informative summary that captures the essence of the article.`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text?.trim() || "Unable to generate summary";
    } catch (error) {
      console.error(`Error summarizing article "${title}":`, error);
      return "Summary unavailable due to processing error";
    }
  }

  async analyzeSentiment(text: string): Promise<{ rating: number; confidence: number }> {
    try {
      const systemPrompt = `You are a sentiment analysis expert. 
Analyze the sentiment of the text and provide a rating
from 1 to 5 stars and a confidence score between 0 and 1.
Respond with JSON in this format: 
{'rating': number, 'confidence': number}`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              rating: { type: "number" },
              confidence: { type: "number" },
            },
            required: ["rating", "confidence"],
          },
        },
        contents: text,
      });

      const rawJson = response.text;

      if (rawJson) {
        const result = JSON.parse(rawJson);
        return {
          rating: Math.max(1, Math.min(5, Math.round(result.rating))),
          confidence: Math.max(0, Math.min(1, result.confidence)),
        };
      } else {
        throw new Error("Empty response from model");
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return { rating: 3, confidence: 0.5 };
    }
  }
}
