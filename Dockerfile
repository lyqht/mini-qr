# syntax=docker/dockerfile:1

# Build stage
FROM node:lts-alpine AS builder
WORKDIR /app

# Accept BASE_PATH as build argument
ARG BASE_PATH=/
ENV BASE_PATH=${BASE_PATH}

COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

# Production stage
FROM node:lts-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
RUN npm install -g serve
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]