# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# install deps (just for building)
COPY package*.json ./
RUN npm ci

# copy source and bundle
COPY . .
RUN npm run build   # creates dist/app.js with all deps inside

# Stage 2: Runner (no node_modules!)
FROM node:20-alpine AS runner

WORKDIR /app

# only copy bundled output
COPY --from=builder /app/dist ./dist

# run the bundled file
CMD ["node", "dist/app.js"]
