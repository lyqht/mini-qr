# syntax=docker/dockerfile:1

# The app builds to static files that run on any CPU, so the build stages run
# on the build machine's own platform ($BUILDPLATFORM) instead of under QEMU.
# Running node/npm under QEMU for arm64 crashed with "Illegal instruction" and
# hung the multi-arch build. Only the final stage is per-architecture, and it
# only copies files in.

# Build stage
FROM --platform=$BUILDPLATFORM node:lts-alpine AS builder
WORKDIR /app

# Accept BASE_PATH as build argument. The default ./ makes asset URLs
# relative, so the prebuilt image works at the domain root or behind a proxy
# at any sub-path. Set it only to force absolute URLs.
ARG BASE_PATH=./
ENV BASE_PATH=${BASE_PATH}

# Accept additional VITE variables as build arguments
ARG VITE_HIDE_CREDITS
ARG VITE_DEFAULT_PRESET
ARG VITE_DEFAULT_DATA_TO_ENCODE
ARG VITE_QR_CODE_PRESETS
ARG VITE_FRAME_PRESET
ARG VITE_FRAME_PRESETS
ARG VITE_DISABLE_LOCAL_STORAGE
ARG VITE_QR_CREATE_SIMPLE_FULL_MODE_TOGGLE
ARG VITE_FIELDS_VISIBLE
ARG VITE_APP_VERSION
# Defaults to hidden for Docker deployments: these tend to be fixed,
# unattended kiosk-style setups where nobody is around to dismiss it.
# Override with --build-arg VITE_DISABLE_COLOR_CONTRAST_WARNING=false to show it.
ARG VITE_DISABLE_COLOR_CONTRAST_WARNING=true

# Set them as environment variables for the build stage
ENV VITE_HIDE_CREDITS=${VITE_HIDE_CREDITS}
ENV VITE_DEFAULT_PRESET=${VITE_DEFAULT_PRESET}
ENV VITE_DEFAULT_DATA_TO_ENCODE=${VITE_DEFAULT_DATA_TO_ENCODE}
ENV VITE_QR_CODE_PRESETS=${VITE_QR_CODE_PRESETS}
ENV VITE_FRAME_PRESET=${VITE_FRAME_PRESET}
ENV VITE_FRAME_PRESETS=${VITE_FRAME_PRESETS}
ENV VITE_DISABLE_LOCAL_STORAGE=${VITE_DISABLE_LOCAL_STORAGE}
ENV VITE_QR_CREATE_SIMPLE_FULL_MODE_TOGGLE=${VITE_QR_CREATE_SIMPLE_FULL_MODE_TOGGLE}
ENV VITE_FIELDS_VISIBLE=${VITE_FIELDS_VISIBLE}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}
ENV VITE_DISABLE_COLOR_CONTRAST_WARNING=${VITE_DISABLE_COLOR_CONTRAST_WARNING}

# Install exactly what pnpm-lock.yaml lists, with its integrity hashes.
# (`npm install --frozen-lockfile` ignored both the flag and the lockfile.)
# pnpm is installed with npm because Node 25+ no longer ships corepack. Keep
# its version in step with "packageManager" in package.json.
RUN npm install -g pnpm@10.0.0
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Install the static file server natively too. serve is plain JavaScript, so the
# installed files work on every architecture. Pinned so every build ships the
# same version.
FROM --platform=$BUILDPLATFORM node:lts-alpine AS serve
RUN npm install -g --prefix /opt/serve serve@14.2.8

# Production stage
FROM node:lts-alpine AS production
WORKDIR /app
COPY --from=serve /opt/serve/ /usr/local/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Make sure the entrypoint is executable even if the checkout lost the exec bit
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["serve", "-s", "dist", "-l", "8080"]
