from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import uuid

def gen_usr_id():
    return f"usr-{uuid.uuid4().hex[:10]}"

def gen_mem_id():
    return f"mem-{uuid.uuid4().hex[:10]}"

def gen_cat_id():
    return f"cat-{uuid.uuid4().hex[:10]}"

def gen_sup_id():
    return f"sup-{uuid.uuid4().hex[:10]}"

def gen_prod_id():
    return f"prod-{uuid.uuid4().hex[:10]}"

def gen_cust_id():
    return f"cust-{uuid.uuid4().hex[:10]}"

def gen_sale_id():
    return f"sale-{uuid.uuid4().hex[:10]}"

def gen_item_id():
    return f"item-{uuid.uuid4().hex[:10]}"

def gen_exp_id():
    return f"exp-{uuid.uuid4().hex[:10]}"

def gen_stf_id():
    return f"stf-{uuid.uuid4().hex[:10]}"

def gen_pay_id():
    return f"pay-{uuid.uuid4().hex[:10]}"

def gen_tgt_id():
    return f"tgt-{uuid.uuid4().hex[:10]}"

def gen_notif_id():
    return f"notif-{uuid.uuid4().hex[:10]}"

def gen_tenant_id():
    return f"tenant-{uuid.uuid4().hex[:8]}"

class Tenant(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=gen_tenant_id)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    domain = models.CharField(max_length=255, blank=True, null=True)
    business_type = models.CharField(max_length=100, default="Retail Supermarket")
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=16.0)
    plan = models.CharField(max_length=50, default="pro")
    currency = models.CharField(max_length=10, default="KES")
    status = models.CharField(max_length=20, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = gen_tenant_id()
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.name) or "business"
            self.slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.id})"

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("username", email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("username") is None or extra_fields.get("username") == email:
            extra_fields["username"] = extra_fields.get("name") or "Protas"
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    id = models.CharField(max_length=64, primary_key=True, default=gen_usr_id)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    avatar = models.URLField(blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    def __str__(self):
        return f"{self.name or self.email} ({self.email})"

class Membership(models.Model):
    ROLE_CHOICES = [
        ("owner", "Owner"),
        ("admin", "Admin"),
        ("manager", "Manager"),
        ("cashier", "Cashier"),
    ]
    id = models.CharField(max_length=64, primary_key=True, default=gen_mem_id)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="owner")
    designation = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "tenant")

class Category(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=gen_cat_id)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.name} - {self.tenant_id}"

class Supplier(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=gen_sup_id)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="suppliers")
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.name} ({self.tenant_id})"

class Product(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=gen_prod_id)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, blank=True)
    barcode = models.CharField(max_length=100, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True)
    buying_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_stock = models.IntegerField(default=0)
    min_stock_level = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.sku:
            import uuid
            self.sku = f"SKU-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} [{self.sku}]"

class Customer(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=gen_cust_id)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="customers")
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    total_purchases = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    loyalty_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.tenant_id})"

class Sale(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ("paid", "Paid"),
        ("partial", "Partial"),
        ("unpaid", "Unpaid"),
    ]
    PAYMENT_METHOD_CHOICES = [
        ("mpesa", "M-PESA"),
        ("cash", "Cash"),
        ("card", "Card"),
        ("credit", "Credit"),
    ]
    id = models.CharField(max_length=64, primary_key=True, default=gen_sale_id)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="sales")
    invoice_number = models.CharField(max_length=100)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=255, blank=True)
    cashier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    cashier_name = models.CharField(max_length=255, blank=True)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="paid")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default="mpesa")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.invoice_number} - {self.total_amount}"

class SaleItem(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=gen_item_id)
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

class Expense(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=gen_exp_id)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="expenses")
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    category = models.CharField(max_length=100)
    date = models.DateField()
    recorded_by = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} ({self.amount})"

class StaffMember(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=gen_stf_id)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="staff")
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    role = models.CharField(max_length=50, default="Cashier")
    monthly_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default="active")

    def __str__(self):
        return f"{self.name} - {self.role}"

class PayrollRecord(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=gen_pay_id)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="payrolls")
    staff = models.ForeignKey(StaffMember, on_delete=models.CASCADE, related_name="payrolls")
    month = models.CharField(max_length=50)
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bonus = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default="paid")
    payment_date = models.DateField(blank=True, null=True)

class Target(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=gen_tgt_id)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="targets")
    title = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    current_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    period = models.CharField(max_length=50, default="Monthly")
    start_date = models.DateField()
    end_date = models.DateField()

class Notification(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=gen_notif_id)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=50, default="info")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


def gen_rec_id():
    return f"rec-{uuid.uuid4().hex[:10]}"


class DailyReconciliation(models.Model):
    STATUS_CHOICES = [
        ("reconciled", "Reconciled"),
        ("discrepancy", "Discrepancy"),
        ("pending", "Pending"),
    ]
    id = models.CharField(max_length=64, primary_key=True, default=gen_rec_id)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="reconciliations")
    date = models.DateField()
    opening_float = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cash_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cash_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    expected_cash = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    actual_cash = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cash_discrepancy = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mpesa_expected = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mpesa_actual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mpesa_discrepancy = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    card_expected = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    card_actual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    card_discrepancy = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_collected = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    reconciled_by = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]
        unique_together = [("tenant", "date")]
