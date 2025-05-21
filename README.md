# WonderLens AI

Kid-friendly AI app for children's learning and discovery.

## Features

- Interactive AI-powered exploration for kids
- Age-appropriate news content updated daily
- Visual learning experiences
- Safe environment for children to learn and explore

## Daily News Feature

WonderLens includes a "Daily News" feature that provides fresh, age-appropriate content for children each day. The content is:

- Generated using OpenAI's GPT models
- Tailored to different age groups (6-7, 8-9, and 10 years old)
- Available for different regions (global, US, UK, India)
- Categorized into fun topics like Science, Space, Nature, Technology, Math, and Culture

### Technical Implementation

- News generation is handled by a Supabase Edge Function (`generate-daily-news`)
- Content is stored in the Supabase database in the `daily_kidnews` table
- The frontend fetches news through the backend API endpoint `/api/kidnews`
- Content older than 14 days is automatically purged

## Project Structure

The application is divided into two main components:

- **Frontend**: React application deployed on Vercel
- **Backend**: Node.js API server deployed on Render
- **Database**: Supabase for data storage and Edge Functions

## Running the Application Locally

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with the following variables:
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# OPENAI_API_KEY=your_openai_api_key

# Start the backend server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

### Supabase Edge Functions

To deploy or update the Edge Function for daily news generation:

```bash
# Navigate to the Supabase functions directory
cd backend/supabase

# Login to Supabase CLI
supabase login

# Deploy the function
supabase functions deploy generate-daily-news
```

Then in the Supabase dashboard, schedule the function to run daily at your preferred time.

## Deployment

- **Frontend**: Deployed on Vercel (wonderlens.app)
- **Backend**: Deployed on Render (wonderlensai-core.onrender.com)
- **Database & Edge Functions**: Managed on Supabase 