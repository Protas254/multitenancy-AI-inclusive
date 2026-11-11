"""
Management command: seed_reconciliations
Seeds realistic DailyReconciliation rows for Aren Enterprice (tenant-1e257fb0)
covering the past 3 months so the Reports → Reconciliation tab shows live data.
"""

import datetime
import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import DailyReconciliation, Tenant


class Command(BaseCommand):
    help = "Seed realistic daily reconciliation records for all active tenants"

    def handle(self, *args, **options):
        self.stdout.write("Seeding DailyReconciliation records...")

        tenants_to_seed = [
            "tenant-1e257fb0",   # Aren Enterprice
            "tenant-fashion",    # Fashion Hub Ltd
        ]

        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=90)   # ~3 months back

        total_created = 0

        for tenant_id in tenants_to_seed:
            tenant = Tenant.objects.filter(id=tenant_id).first()
            if not tenant:
                self.stdout.write(self.style.WARNING(f"  ⚠ Tenant {tenant_id} not found — skipping"))
                continue

            self.stdout.write(f"  → Seeding for: {tenant.name}")

            d = start_date
            while d < today:
                # Skip ~20% of days (closed / no data) to look realistic
                if random.random() < 0.18:
                    d += datetime.timedelta(days=1)
                    continue

                # Realistic daily totals (supermarket / boutique range)
                if tenant_id == "tenant-1e257fb0":
                    # Aren Enterprice — supermarket, higher volumes
                    cash_sales_base = random.randint(18000, 65000)
                    mpesa_base = random.randint(22000, 80000)
                    card_base = random.randint(0, 15000)
                else:
                    # Fashion Hub — boutique, smaller volumes
                    cash_sales_base = random.randint(8000, 30000)
                    mpesa_base = random.randint(5000, 25000)
                    card_base = random.randint(0, 8000)

                cash_expenses = random.randint(500, 3000)
                expected_cash = cash_sales_base - cash_expenses
                opening_float = random.choice([1000, 2000, 2500, 3000, 5000])

                # ~25% of days have a small discrepancy (realistic blind reconciliation)
                has_discrepancy = random.random() < 0.25
                if has_discrepancy:
                    cash_variance = random.choice([-500, -300, -200, -100, 100, 200, 300, 500])
                    mpesa_variance = random.choice([-300, -150, 0, 150, 300])
                    card_variance = random.choice([-200, 0, 0, 200])
                else:
                    cash_variance = 0
                    mpesa_variance = 0
                    card_variance = 0

                actual_cash = expected_cash + cash_variance
                mpesa_actual = mpesa_base + mpesa_variance
                card_actual = card_base + card_variance

                status = "discrepancy" if has_discrepancy else "reconciled"

                # Skip if already exists (unique_together: tenant + date)
                if DailyReconciliation.objects.filter(tenant=tenant, date=d).exists():
                    d += datetime.timedelta(days=1)
                    continue

                DailyReconciliation.objects.create(
                    tenant=tenant,
                    date=d,
                    opening_float=opening_float,
                    cash_sales=cash_sales_base,
                    cash_expenses=cash_expenses,
                    expected_cash=expected_cash,
                    actual_cash=actual_cash,
                    cash_discrepancy=cash_variance,
                    mpesa_expected=mpesa_base,
                    mpesa_actual=mpesa_actual,
                    mpesa_discrepancy=mpesa_variance,
                    card_expected=card_base,
                    card_actual=card_actual,
                    card_discrepancy=card_variance,
                    total_collected=actual_cash + mpesa_actual + card_actual,
                    status=status,
                    reconciled_by="Faith Chebet" if tenant_id == "tenant-1e257fb0" else "John Kamau",
                    notes=f"Daily close — {d.strftime('%A %d %b %Y')}",
                )
                total_created += 1

                d += datetime.timedelta(days=1)

            count = DailyReconciliation.objects.filter(tenant=tenant).count()
            self.stdout.write(self.style.SUCCESS(f"    ✓ {tenant.name}: {count} total reconciliation records"))

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Done! Created {total_created} new DailyReconciliation rows."))
