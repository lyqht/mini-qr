# syntax=docker/dockerfile:1

# Build stage.
#
# Pinned to $BUILDPLATFORM (the architecture of the machine running the build)
# rather than the target platform. Everything this stage produces -- the Vite
# bundle in dist/ and the pure-JavaScript `serve` package -- is
# architecture-independent, so there is no reason to run Node under QEMU here.
# Emulating it was actively breaking multi-arch builds: `npm install` for the
# app's dependency tree would intermittently die with
# `qemu: uncaught target signal 4 (Illegal instruction)` and then hang until
# GitHub cancelled the job at its 6-hour limit, so no image was published
# (see issue #328).
FROM --platform=$BUILDPLATFORM node:lts-alpine AS builder
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
ARG VITE_QR_CREATE_SIMPLE_FULL_MODE_TOGGLE
ARG VITE_FIELDS_VISIBLE
ARG VITE_APP_VERSION

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

# `serve` is the static file server used at runtime. It is pure JavaScript with
# no native addons, so install it here on the build platform and copy the tree
# into the runtime image below -- the only architecture-specific part is the
# Node binary itself, which comes from the target platform's base image.
# Installed before any source is copied in so the layer survives code changes.
RUN npm install --no-save --prefix /opt/serve serve

COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

# Production stage.
#
# Target-platform stage, and deliberately free of any RUN instruction: nothing
# is executed under emulation when cross-building, only files are copied in.
FROM node:lts-alpine AS production
WORKDIR /app
ENV PATH="/opt/serve/node_modules/.bin:${PATH}"
COPY --from=builder /opt/serve /opt/serve
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
