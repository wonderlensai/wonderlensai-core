# WonderLens AI Backend

This is the Express.js backend for the WonderLens AI application. It handles API requests from the frontend and interacts with the Supabase database.

## Tech Stack

- Node.js with Express
- Supabase for database and edge functions
- OpenAI API integration

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Start production server
npm start
```

## Environment Variables

Create a `.env` file in the backend directory with these variables:

```
# Supabase configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI API key for content generation
OPENAI_API_KEY=your_openai_api_key

# Optional port configuration (defaults to 7001)
PORT=7001
```

## API Endpoints

- `GET /api/kidnews`: Fetches age-appropriate news content
  - Query params: `country` (e.g., 'global', 'us') and `age` (e.g., 8)
  
- Additional endpoints are documented in the respective route files

## Supabase Edge Functions

The backend includes a Supabase Edge Function that handles daily news generation:

- `generate-daily-news`: Located in `supabase/functions/generate-daily-news/`
- Automatically creates news content for different age groups and countries
- Can be scheduled to run daily using Supabase dashboard

See the main project README for complete documentation about the WonderLens application. 