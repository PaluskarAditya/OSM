FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# Stage 2
FROM node:20-alpine

WORKDIR /app

COPY backend/ ./backend
COPY backend/package*.json ./
WORKDIR /app/backend
RUN npm install --production

COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/

WORKDIR /app/frontend
RUN npm install --production

COPY package.json ./

EXPOSE 3000 8000

WORKDIR /app
CMD ["npm", "run", "start:all"]