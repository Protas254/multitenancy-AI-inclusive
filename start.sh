#!/usr/bin/env bash
# Verdant — Start all dev servers
# Run: bash start.sh  (from /home/junior/Desktop/multitenancy)

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🌿 Verdant Dev Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🔪 Killing stale servers..."
pkill -f "manage.py runserver" 2>/dev/null && echo "  ✓ Killed old Django" || echo "  · No old Django"
pkill -f "vite"               2>/dev/null && echo "  ✓ Killed old Vite"   || echo "  · No old Vite"
sleep 1

echo "⚙️  Resetting Vite proxy → http://localhost:8000"
sed -i 's|target: "http://localhost:8001"|target: "http://localhost:8000"|g' "$ROOT/client/vite.config.ts" 2>/dev/null || true

echo ""
echo "🐍 Starting Django on http://localhost:8000 ..."
"$ROOT/server/venv/bin/python" "$ROOT/server/manage.py" runserver 8000 > "$ROOT/django.log" 2>&1 &
DJANGO_PID=$!

for i in $(seq 1 10); do
    sleep 1
    curl -sf http://localhost:8000/admin/ -o /dev/null 2>/dev/null && echo "   ✅ Django is up!" && break
    echo "   ⏳ Waiting... ($i/10)"
done

echo ""
echo "⚡ Starting Vite on http://localhost:3000 ..."
cd "$ROOT/client" && npm run dev > "$ROOT/vite.log" 2>&1 &
VITE_PID=$!
cd "$ROOT"
sleep 3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Both servers started!"
echo ""
echo "   🌐 Landing Page  →  http://localhost:3000"
echo "   🔐 Login         →  http://localhost:3000/login"
echo "   🛠  Django Admin  →  http://localhost:8000/admin"
echo "   📡 API           →  http://localhost:8000/api/v1/"
echo ""
echo "   📧 john.kamau@business.co.ke / password123  (owner)"
echo "   📧 protasjunior254@gmail.com  / password123  (superadmin)"
echo ""
echo "Press Ctrl+C to stop."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
wait
