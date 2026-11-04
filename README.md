# StoreGrid — Multi-Tenant Retail Business Cloud & POS

Modern multi-tenant SaaS operating system built for retail stores, supermarkets, pharmacies, and multi-branch enterprises across Kenya and East Africa.

- **Main Website / Client App**: `https://storegrid.co.ke`
- **Backend Admin & API**: `https://api.storegrid.co.ke/admin` (API Base: `https://api.storegrid.co.ke/api/v1/`)

---

## 🏗 System Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + PWA (served via Nginx)
- **Backend**: Django 5 + Django REST Framework + SimpleJWT + SQLite/PostgreSQL (served via Gunicorn)
- **Subdomains**:
  - `storegrid.co.ke` / `www.storegrid.co.ke` → Public landing page, POS, and tenant dashboards
  - `api.storegrid.co.ke` → Django Admin (`/admin/`) & REST APIs (`/api/v1/`)

---

## 🐳 Production Deployment with Docker

### 1. Configure Production Environment

Review and adjust [.env.production](file:///.env.production):
```ini
VITE_SITE_URL=https://storegrid.co.ke
NEXT_PUBLIC_SITE_URL=https://storegrid.co.ke
VITE_API_URL=https://api.storegrid.co.ke/api/v1
NEXT_PUBLIC_API_URL=https://api.storegrid.co.ke/api/v1

DJANGO_SECRET_KEY=generate-a-strong-random-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,storegrid.co.ke,www.storegrid.co.ke,api.storegrid.co.ke
CSRF_TRUSTED_ORIGINS=https://storegrid.co.ke,https://www.storegrid.co.ke,https://api.storegrid.co.ke
CORS_ALLOWED_ORIGINS=https://storegrid.co.ke,https://www.storegrid.co.ke,https://api.storegrid.co.ke
```

### 2. Build and Launch Containers

```bash
# Build and run containers in detached mode
docker compose up -d --build

# View container logs
docker compose logs -f

# Check container health status
docker compose ps
```

### 3. Create Superadmin (First Time)

```bash
docker compose exec backend python manage.py createsuperuser
```

---

## 💻 Local Development

### Option A: Local Scripts (Without Docker)
```bash
# Start both Django (port 8000) and Vite (port 3000)
bash start.sh
```

### Option B: Docker Compose Development
```bash
docker compose -f docker-compose.dev.yml up
```

---

## 🌐 DNS Configuration

Configure these records in your `.co.ke` DNS manager:

| Type | Name | Content / Value | Purpose |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `<SERVER_IP>` | Root domain (`storegrid.co.ke`) |
| **CNAME** | `www` | `storegrid.co.ke` | WWW redirect |
| **A** | `api` | `<SERVER_IP>` | API & Admin (`api.storegrid.co.ke`) |
