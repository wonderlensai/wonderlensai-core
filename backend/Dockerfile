FROM node:18-alpine

# Add cron package and curl for health checks
RUN apk add --no-cache curl tzdata

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Set timezone
ENV TZ=UTC

# Expose the API port
EXPOSE 7001

# Default command (can be overridden in docker-compose.yml)
CMD ["npm", "start"] 