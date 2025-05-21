# WonderLens AI Frontend

This is the React frontend for the WonderLens AI application - an educational platform for children.

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and building
- Various UI libraries including Material-UI, Ant Design
- Interactive visualizations with Leaflet and Force Graph
- Progressive Web App capabilities

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the frontend directory with these variables:

```
# API connection
VITE_API_URL=http://localhost:7001  # For local development

# For production, this can be left undefined as the 
# component code will use the Render backend URL
```

## Frontend Architecture

- `src/components`: Reusable UI components
- `src/pages`: Page components for each route
- `src/assets`: Static assets like images
- `src/hooks`: Custom React hooks
- `src/utils`: Utility functions

See the main project README for complete documentation about the WonderLens application.
