#!/bin/sh
# ============================================================
# StoreGrid Backend Entrypoint
# Runs migrations and optional seed before starting Gunicorn
# ============================================================

set -e

# Initialize persistent volume database if mounted
if [ -d "/app/db_data" ]; then
  if [ ! -f "/app/db_data/db.sqlite3" ]; then
    if [ -f "/app/db.sqlite3" ]; then
      echo "📦 Seeding persistent database in /app/db_data/db.sqlite3 from image..."
      cp /app/db.sqlite3 /app/db_data/db.sqlite3
    else
      echo "📦 Initializing new database file in /app/db_data/db.sqlite3..."
      touch /app/db_data/db.sqlite3
    fi
  fi
fi

echo "⏳ Running Django migrations..."
python manage.py migrate --noinput

echo "✅ Migrations done."

# Optional: seed superadmin on first boot only
if [ "$DJANGO_CREATE_SUPERUSER" = "true" ]; then
  echo "👤 Creating superadmin..."
  python manage.py shell -c "
from api.models import User
if not User.objects.filter(email='$DJANGO_SUPERUSER_EMAIL').exists():
    u = User.objects.create_superuser('$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')
    u.name = 'Super Admin'
    u.is_super_admin = True
    u.save()
    print('Superuser created.')
else:
    print('Superuser already exists.')
"
fi

echo "🚀 Starting Gunicorn..."
exec gunicorn \
  --bind 0.0.0.0:8000 \
  --workers ${GUNICORN_WORKERS:-3} \
  --timeout ${GUNICORN_TIMEOUT:-120} \
  --access-logfile - \
  --error-logfile - \
  config.wsgi:application
