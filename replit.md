# Healthcare Facility Search Application

## Overview

This is a full-stack healthcare facility search application built with React, Express, and PostgreSQL. The application allows users to search for healthcare facilities (hospitals, clinics, pharmacies) using the Google Places API and maintains a history of searches. It features a modern UI built with shadcn/ui components and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**Date: August 1, 2025**
- Successfully implemented healthcare facility search with Google Places API integration
- Fixed query URL structure issue that was preventing search results from displaying
- Added real-time search functionality with debounced input
- Implemented auto-fill form functionality for selected facilities
- Added search history tracking and display
- Created local development setup documentation with environment variable configuration
- All features tested and working with authentic Google Places API data

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for development and building
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with custom query client
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom healthcare-themed color palette
- **Form Handling**: React Hook Form with Zod validation resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for facility search and search history
- **Middleware**: Custom request logging, JSON parsing, and error handling
- **Development**: Custom Vite integration for SSR-like development experience

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon Database serverless)
- **Schema**: Three main tables - users, healthcare_facilities, and search_history
- **Migrations**: Drizzle Kit for schema management and migrations
- **Connection**: @neondatabase/serverless for serverless PostgreSQL connections

### Data Storage Design
- **Users Table**: Basic user authentication with username/password
- **Healthcare Facilities Table**: Stores facility data from Google Places API including location coordinates, contact info, and ratings
- **Search History Table**: Tracks user searches with references to facilities and search queries
- **Session Storage**: In-memory storage implementation with interface for future database integration

### Authentication & Authorization
- **Current**: Basic user schema defined but not fully implemented
- **Storage**: Password field in users table (ready for hashing implementation)
- **Session Management**: Infrastructure in place with connect-pg-simple for PostgreSQL session storage

## External Dependencies

### Third-Party APIs
- **Google Places API**: Core service for searching healthcare facilities
  - Text Search API for finding facilities by query
  - Place Details API for retrieving comprehensive facility information
  - Requires GOOGLE_PLACES_API_KEY or PLACES_API_KEY environment variable

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
  - Requires DATABASE_URL environment variable
  - Configured for connection pooling and serverless usage

### UI and Styling Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **class-variance-authority**: For component variant management
- **Embla Carousel**: For carousel components

### Development and Build Tools
- **Vite**: Fast development server and build tool with React plugin
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and autoprefixer

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class management
- **zod**: Schema validation for forms and API data
- **nanoid**: Unique ID generation for development features