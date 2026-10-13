# Stage 1: Build frontend and server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy application code
COPY . .

# Build Vite frontend and esbuild Node server
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled frontend and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
