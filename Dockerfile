# ================================
# Multi-stage Dockerfile for Express.js App
# ================================

# Stage 1: Base image with dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Development
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Stage 3: Production dependencies
FROM base AS dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 4: Production build
FROM node:18-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application files
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
