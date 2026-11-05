# StoreGrid — Multi-Tenant Retail Business Cloud & POS

Modern multi-tenant SaaS operating system built for retail stores, supermarkets, pharmacies, and multi-branch enterprises across Kenya and East Africa.

- **Main Website / Client App**: `https://storegrid.co.ke`
- **Backend Admin & API**: `https://api.storegrid.co.ke/admin` (API Base: `https://api.storegrid.co.ke/api/v1/`)
- **Official Contact Email**: `storegridkenya@gmail.com`

---

## 🏗 System Architecture & Multi-Project Isolation (Contabo VPS)

StoreGrid is configured to run as an **isolated third project** on your Contabo server without conflicting with any existing applications:

| Isolation Boundary | Configuration | Why It's Safe |
| :--- | :--- | :--- |
| **Compose Project Name** | `name: storegrid` | Namespaces all Docker commands and resources |
| **Frontend Container** | `storegrid_frontend` → `127.0.0.1:3003:80` | High-range dedicated localhost port; won't clash with ports 80/443 |
| **Backend Container** | `storegrid_backend` → `127.0.0.1:8003:8000` | High-range dedicated localhost port; won't clash with port 8000 |
| **Docker Network** | `storegrid_network` (Bridge) | Completely isolated from other project containers on the VPS |
| **Docker Volumes** | `storegrid_media`, `storegrid_sqlite` | Namespaced persistent volumes |
| **Host Web Server** | Host Nginx reverse proxy | Listens on 80/443 for `storegrid.co.ke` and `api.storegrid.co.ke` only |

---

## 📧 Production Email Configuration (SMTP)

Configured with Gmail SMTP and an App Password in [.env.production](file:///.env.production):
- **Email**: `storegridkenya@gmail.com`
- **SMTP Host**: `smtp.gmail.com:587` (TLS)
- **Sender**: `StoreGrid Cloud <storegridkenya@gmail.com>`

---

## 🐳 Contabo Production Deployment Guide

### Step 1: Copy Project to Contabo Server
```bash
# Recommended isolated directory:
sudo mkdir -p /var/www/storegrid
cd /var/www/storegrid
```

### Step 2: Verify Production Environment Variables
Inspect [.env.production](file:///.env.production):
```bash
nano .env.production
```

### Step 3: Launch Isolated Docker Containers
```bash
docker compose up -d --build
```
Verify health:
```bash
docker compose ps
# Both storegrid_backend and storegrid_frontend should show "healthy" / "Up"
```

### Step 4: Configure Host Nginx on Contabo
Copy the two reverse proxy configuration files to your Contabo host Nginx:
```bash
# 1. Main frontend app (storegrid.co.ke -> 127.0.0.1:3003)
sudo cp nginx/storegrid.co.ke.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/storegrid.co.ke.conf /etc/nginx/sites-enabled/

# 2. Backend & Admin (api.storegrid.co.ke -> 127.0.0.1:8003)
sudo cp nginx/api.storegrid.co.ke.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/api.storegrid.co.ke.conf /etc/nginx/sites-enabled/

# Test syntax (will not disturb your other 2 projects)
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5: Issue SSL Certificates with Certbot
```bash
sudo certbot --nginx -d storegrid.co.ke -d www.storegrid.co.ke
sudo certbot --nginx -d api.storegrid.co.ke
```

### Step 6: Create Initial Admin Account
```bash
docker compose exec backend python manage.py createsuperuser
```
You can then log in to the admin dashboard at `https://api.storegrid.co.ke/admin`.

---

## 🌐 DNS Records Required

Configure these records in your domain registrar DNS manager:

| Type | Name / Host | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `<CONTABO_SERVER_IP>` | Root domain (`storegrid.co.ke`) |
| **A** or **CNAME** | `www` | `<CONTABO_SERVER_IP>` | WWW subdomain |
| **A** | `api` | `<CONTABO_SERVER_IP>` | Backend Admin & API (`api.storegrid.co.ke`) |
