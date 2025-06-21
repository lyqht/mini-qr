# syntax=docker/dockerfile:1

# Build stage
FROM node:lts-alpine AS builder
WORKDIR /app

# Accept BASE_PATH as build argument
ARG BASE_PATH=/
ENV BASE_PATH=${BASE_PATH}

# Accept additional VITE variables as build arguments
ARG VITE_HIDE_CREDITS
ARG VITE_DEFAULT_PRESET
ARG VITE_DEFAULT_DATA_TO_ENCODE
ARG VITE_QR_CODE_PRESETS
ARG VITE_FRAME_PRESET
ARG VITE_FRAME_PRESETS
ARG VITE_DISABLE_LOCAL_STORAGE

# Set them as environment variables for the build stage
ENV VITE_HIDE_CREDITS=${VITE_HIDE_CREDITS}
ENV VITE_DEFAULT_PRESET=${VITE_DEFAULT_PRESET}
ENV VITE_DEFAULT_DATA_TO_ENCODE=${VITE_DEFAULT_DATA_TO_ENCODE}
ENV VITE_QR_CODE_PRESETS=${VITE_QR_CODE_PRESETS}
ENV VITE_FRAME_PRESET=${VITE_FRAME_PRESET}
ENV VITE_FRAME_PRESETS=${VITE_FRAME_PRESETS}
ENV VITE_DISABLE_LOCAL_STORAGE=${VITE_DISABLE_LOCAL_STORAGE}

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