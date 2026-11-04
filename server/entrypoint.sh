#!/bin/sh
# ============================================================
# StoreGrid Backend Entrypoint
# Runs migrations and optional seed before starting Gunicorn
# ============================================================

set -e

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
