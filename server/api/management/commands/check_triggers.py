from django.core.management.base import BaseCommand
from api.models import Tenant
from api.notifications import run_all_background_checks

class Command(BaseCommand):
    help = "Run automated background triggers for low stock, quota achievements, credit limits, and reconciliation."

    def handle(self, *args, **options):
        self.stdout.write("Running automated background notification checks...")
        total_created = 0
        for tenant in Tenant.objects.all():
            created = run_all_background_checks(tenant)
            if created:
                total_created += len(created)
                self.stdout.write(self.style.SUCCESS(f"Generated {len(created)} notification(s) for '{tenant.name}'"))

        self.stdout.write(self.style.SUCCESS(f"Done. Total new automated notifications generated: {total_created}"))
