# Healthcare Facility Search Application

A full-stack healthcare facility finder with real-time search and auto-fill functionality using React, Express, and Google Places API.

## Features

- **Real-time Search**: Search for hospitals, pharmacies, and clinics with live results
- **Auto-fill Forms**: Automatically populate facility details when selected
- **Search History**: Track and revisit previous searches
- **Google Places Integration**: Authentic healthcare facility data
- **Modern UI**: Professional healthcare-themed interface with shadcn/ui components

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- Google Places API key (see setup instructions below)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd healthcare-search
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google Places API key:
   ```
   GOOGLE_PLACES_API_KEY=your_actual_api_key_here
   NODE_ENV=development
   PORT=5000
   ```

3. **Get a Google Places API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the **Places API** and **Places API (New)**
   - Go to **Credentials** and create an API key
   - Copy the API key to your `.env` file

4. **Start the development server:**
   
   **For Windows (Recommended):**
   ```bash
   node start-local.js
   ```
   
   **For Mac/Linux:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5000`

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities
├── server/               # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage layer
├── shared/               # Shared types and schemas
└── .env.example          # Environment variables template
```

## API Usage

The application uses Google Places API for real healthcare facility data:

- **Text Search API**: Finds facilities by name/type
- **Place Details API**: Retrieves comprehensive facility information

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_PLACES_API_KEY` | Google Places API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No (default: 5000) |

## Features in Detail

### Real-time Search
- Debounced search with 500ms delay
- Minimum 2 characters to trigger search
- Live results display as you type

### Auto-fill Functionality
- Click any search result to auto-populate form fields
- Includes: facility name, type, address, phone, hours, rating

### Search History
- Automatically saves selected facilities
- Recent searches displayed for quick access
- Click history items to re-select facilities

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Data Storage**: In-memory (easily extensible to PostgreSQL)

## Deployment

The application is ready for deployment on platforms like Replit, Vercel, or any Node.js hosting service. Make sure to set the `GOOGLE_PLACES_API_KEY` environment variable in your deployment platform.