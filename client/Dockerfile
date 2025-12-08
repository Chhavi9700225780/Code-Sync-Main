# Dockerfile for React Frontend (Vite + TypeScript)

# --- Stage 1: Build ---
# Use a Node version suitable for your React build process
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# --- Build-time Environment Variable ---
# Set ARG for the backend URL, default to localhost for safety
ARG VITE_BACKEND_URL=http://k8s-threetie-api-068c246db8-507886c27474ccba.elb.us-east-1.amazonaws.com:3000

# Make the ARG available as an environment variable *during the build*
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Build the React application
# Vite uses the VITE_ prefixed env vars during build
RUN npm run build
# Expected output is in ./dist

# --- Stage 2: Production Server ---
# Use a lightweight Nginx server
FROM nginx:stable-alpine

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files from the builder stage to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (Optional but recommended for SPAs)
# Create a file named nginx.conf next to this Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (standard HTTP port Nginx listens on)
EXPOSE 80

# Default command to start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
