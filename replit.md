# Overview

This is a full-stack news aggregation application with AI-powered features. The application fetches news articles from the News API, displays them in a modern React frontend, and provides AI-powered summarization capabilities using OpenAI's GPT-5 model. Users can filter news by country, category, and sources, with additional features like voice search and customizable preferences.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript in client-side rendering mode
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state and local React state for UI state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with `/api` prefix for all endpoints
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Development Setup**: Vite middleware integration for hot module replacement

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management
- **In-Memory Storage**: Fallback memory storage implementation for development/testing
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL storage
- **User System**: Basic username/password authentication
- **Preferences**: Per-user customizable settings for news sources, AI features, and voice search

## External Service Integrations

### News API Integration
- **Service**: NewsAPI.org for fetching global news articles
- **Features**: Country-based filtering, category filtering, source filtering, and keyword search
- **Rate Limiting**: Handled through service configuration
- **Data Processing**: Articles are normalized and stored with consistent schema

### OpenAI Integration
- **Model**: GPT-5 for article summarization
- **Features**: Configurable summary lengths (short, medium, long)
- **Error Handling**: Graceful fallback when AI services are unavailable
- **Cost Management**: Per-article summarization with user preferences

### Voice Search Capabilities
- **API**: Web Speech API for browser-based voice recognition
- **Language Support**: Multiple language support for international users
- **Fallback**: Text-based search when voice features are unavailable

## Key Architectural Decisions

### Monorepo Structure
- **Shared Schema**: Common TypeScript types and Zod schemas in `/shared` directory
- **Client/Server Separation**: Clear separation between frontend (`/client`) and backend (`/server`)
- **Build Strategy**: Separate build processes for client (Vite) and server (esbuild)

### Type Safety
- **End-to-End Types**: Shared schemas ensure type consistency across client and server
- **Database Types**: Drizzle generates TypeScript types from database schema
- **API Types**: Zod schemas provide runtime validation and type inference

### Performance Optimization
- **Query Caching**: TanStack Query handles API response caching and invalidation
- **Component Optimization**: React memo and proper dependency management
- **Bundle Optimization**: Vite handles code splitting and tree shaking

### Development Experience
- **Hot Reloading**: Vite middleware integration for instant feedback
- **Error Reporting**: Runtime error overlay for development debugging
- **TypeScript**: Strict type checking across the entire application