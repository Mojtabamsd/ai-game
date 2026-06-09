# ── Stage 1: Build the React frontend ────────────────────────────────────────
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ── Stage 2: Production image (Node + Python) ────────────────────────────────
FROM node:22-slim

# Install Python and OpenCV system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
RUN python3 -m venv /app/.venv
RUN /app/.venv/bin/pip install --no-cache-dir \
    opencv-python-headless \
    numpy \
    scikit-learn \
    scikit-image \
    joblib

# Copy built React frontend
COPY --from=frontend-build /app/build ./build

# Copy server and public files
COPY server/ ./server/
COPY public/ ./public/

# Install Node dependencies (production only)
COPY package*.json ./
RUN npm ci --omit=dev

# Create mount point for persistent database
RUN mkdir -p /data

EXPOSE 5000

CMD ["node", "server/server.js"]
