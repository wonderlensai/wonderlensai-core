# WonderLens AI

Kid-friendly AI app for children's learning and discovery.

## Daily News Features

WonderLens includes a "Daily News" feature that provides fresh, age-appropriate content for children each day. The content is:

- Generated using OpenAI's GPT models
- Tailored to different age groups (6-7, 8-9, and 10 years old)
- Available for different regions (global, US, UK, India)
- Categorized into fun topics like Science, Space, Nature, Technology, Math, and Culture

### Setting Up Daily News Generation

The app uses a scheduled script to generate fresh news content every day. Here are several ways to set it up:

#### Option 1: Using Docker Compose (Recommended)

The simplest way to run the daily news generator is using Docker Compose:

```bash
# Start all services including the daily news generator
docker-compose up -d
```

The `daily-news` service will run the script automatically at 4 AM UTC every day.

#### Option 2: Setting Up a Cron Job Manually

1. Navigate to the backend directory and run the setup script:

```bash
cd backend/scripts
chmod +x setup-cron.js
node setup-cron.js
```

2. Follow the instructions to add the cron job to your system.

#### Option 3: Running the Script Manually

You can also generate news content manually at any time:

```bash
cd backend/scripts
chmod +x generate-news-now.sh
./generate-news-now.sh
```

### Technical Details

- The news generation script is located at `backend/scripts/generate_kidnews.js`
- Content is stored in the Supabase database in the `daily_kidnews` table
- The frontend fetches news through the `/api/kidnews` endpoint
- Content older than 14 days is automatically purged

### Frontend Integration

The daily news is displayed in the Home page using the `WonderLensDaily` component. The component:

- Fetches news from the backend API
- Displays a story carousel with different categories
- Adapts to the user's device (mobile, tablet)

## Running the Application

```bash
# Install dependencies
npm install

# Start the backend
cd backend
npm start

# Start the frontend
cd frontend
npm run dev
```

## Environment Variables

Make sure your `.env` file in the backend directory includes:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
``` 