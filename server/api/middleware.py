from django.utils.deprecation import MiddlewareMixin

class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        tenant_id = request.headers.get("X-Tenant-ID") or request.META.get("HTTP_X_TENANT_ID")
        request.tenant_id = tenant_id
