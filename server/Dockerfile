# ============================================================
# StoreGrid Backend — Multi-stage Production Dockerfile
# Django 5 + Gunicorn | storegrid.co.ke
# ============================================================

FROM python:3.11-slim AS base

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Create non-root user
RUN addgroup --system storegrid && adduser --system --ingroup storegrid storegrid \
 && chown -R storegrid:storegrid /app

# Collect static files
RUN python manage.py collectstatic --noinput

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && chown storegrid:storegrid /entrypoint.sh

USER storegrid

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=5 \
  CMD curl -f http://localhost:8000/api/v1/health/ || exit 1

ENTRYPOINT ["/entrypoint.sh"]
