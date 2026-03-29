# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install ALL dependencies (including devDependencies for building)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm install
RUN npx prisma generate

# Copy source code and build the app
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

# Set environment variables
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy only production dependencies from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Prune devDependencies (optional but recommended for smaller images)
# Note: Since we need prisma client in node_modules, we keep it. 
# A more advanced way is to install ONLY production deps here, but builder already has them.
RUN npm prune --production

# Expose port (adjust to your server port, default for NestJS is 3000)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
