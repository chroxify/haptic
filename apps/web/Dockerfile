# Use Node.js as the base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install turbo
RUN npm install -g turbo

# Copy the entire monorepo
COPY . .

# Generate a partial monorepo with a pruned lockfile for the web workspace
RUN turbo prune web --docker

# Install dependencies and build the project
FROM node:18-alpine AS installer
WORKDIR /app

# Copy pruned files from the previous stage
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source files
COPY --from=builder /app/out/full/ .

# Install @tailwindcss/typography in the web workspace
RUN cd apps/web && pnpm add -D @tailwindcss/typography

# Build the project
RUN pnpm run build --filter=web

# Final stage
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built application
COPY --from=installer /app/apps/web/build ./build
COPY --from=installer /app/apps/web/package.json .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "build"]