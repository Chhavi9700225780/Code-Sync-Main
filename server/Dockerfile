# Dockerfile for Node.js Backend (TypeScript)

# --- Stage 1: Build ---
# Use a specific Node version known to work with your app, Alpine for smaller size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for dependency caching
COPY package.json package-lock.json ./

# Install *all* dependencies needed for the build (including devDependencies like typescript)
RUN npm ci

# Copy tsconfig and the rest of the source code
COPY tsconfig.json ./
COPY src ./src

# --- Environment Variables ---
# IMPORTANT: DO NOT copy .env file into the image!
# These should be injected at runtime (e.g., via Docker Compose, Kubernetes, Render Env Vars)
# We list them here for documentation, but they are NOT set in the image.
# ENV NODE_ENV=production # Set this via runtime environment
# ENV PORT=3000
# ENV DATABASE_URL=mongodb://...
# ENV JWT_SECRET=your_secret
# ENV SESSION_SECRET=your_secret # (If you were still using sessions)

# Build the TypeScript code
RUN npm run build
# Expected output is in ./dist

# Prune devDependencies after build
RUN npm prune --production

# --- Stage 2: Production ---
# Use a fresh, minimal Node image
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on (should match PORT env var)
EXPOSE 3000

# Command to run the application
# Use node directly to run the compiled JavaScript
CMD ["node", "dist/server.js"]

# Healthcheck (Optional but recommended)
# Adjust the path and port if needed
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#  CMD curl -f http://localhost:3000/ || exit 1 # Replace with a proper health endpoint if you have one
