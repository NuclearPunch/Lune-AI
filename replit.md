# Overview

LUNE is an AI-powered dating application that stands for "Light Up New Emotions." The platform serves as an intelligent dating concierge that guides users to discover and nurture new emotions through personalized matchmaking and conversation coaching. The application combines emotion-based compatibility scoring with real-time AI guidance to create meaningful connections.

The system follows a full-stack TypeScript architecture with a React frontend, Express backend, and PostgreSQL database, all designed around emotion intelligence and AI-driven user experiences.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with a custom moonlight theme featuring brand colors (midnight, moonlight, lavender, rose, purple, cream)
- **Routing**: Wouter for client-side routing with pages for home, onboarding, matches, chat, and profile
- **State Management**: TanStack Query for server state with React hooks for local state
- **Real-time Communication**: WebSocket integration for live messaging

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket support for real-time features
- **Validation**: Zod schemas for type-safe data validation
- **AI Integration**: OpenAI API (GPT-4o) with specialized agents for different tasks

## Database Design
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Strategy**: Comprehensive relational design with tables for users, profiles, matches, conversations, messages, emotional feedback, reports, and AI interactions
- **Data Types**: JSONB fields for flexible emotion profiles, embeddings, and complex data structures
- **Relationships**: Foreign key constraints with cascade deletes for data integrity

## AI Agent System
The application features four specialized AI agents:
1. **Onboarding Summary Agent**: Generates marketing-style profile summaries and keywords
2. **Profile Embedding Agent**: Converts profile data into embedding-ready text
3. **Match Reasons Agent**: Analyzes compatibility and generates match explanations
4. **Message Templates Agent**: Creates personalized first message suggestions

## Authentication & Security
- **Authentication**: Username/password-based system with session management
- **Data Protection**: Input validation and sanitization using Zod schemas
- **Safety Features**: User reporting system with categorized report types (spam, harassment, inappropriate content, fake profiles)

## Real-time Features
- **WebSocket Server**: Integrated with HTTP server for live messaging
- **Message Types**: Support for user messages, AI suggestions, and system notifications
- **Connection Management**: Automatic reconnection logic with configurable retry attempts

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI API for GPT-4o model access
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple

## Development Tools
- **Build System**: Vite with TypeScript support and React plugin
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Development Environment**: Replit-specific plugins for runtime error handling and cartographer integration

## UI/UX Libraries
- **Component Library**: Radix UI primitives for accessibility-first components
- **Animations**: Embla Carousel for image carousels and smooth interactions
- **Form Management**: React Hook Form with Hookform Resolvers for form validation
- **Date Handling**: date-fns for date manipulation and formatting

## Utility Libraries
- **Styling Utilities**: clsx and tailwind-merge for conditional CSS classes
- **Validation**: Zod for runtime type checking and schema validation
- **HTTP Client**: Native fetch API with custom API client wrapper
- **WebSocket**: Native WebSocket API with custom reconnection logic