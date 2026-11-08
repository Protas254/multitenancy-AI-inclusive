import io
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from api.models import User, Tenant, Membership, Category, Supplier, Product, StockMovement

class BulkUploadProductTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword123",
            name="Test User"
        )
        self.tenant = Tenant.objects.create(
            name="Test Retailer",
            slug="testretailer",
            currency="KES",
            is_active=True
        )
        self.membership = Membership.objects.create(
            user=self.user,
            tenant=self.tenant,
            role="owner"
        )
        self.client.force_authenticate(user=self.user)
        self.auth_headers = {"HTTP_X_TENANT_ID": self.tenant.id}

    def test_download_template(self):
        response = self.client.get("/api/v1/products/template/", **self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/csv; charset=utf-8")
        self.assertIn("Name,Category,SKU,Barcode", response.content.decode("utf-8"))

    def test_bulk_upload_csv_file(self):
        csv_content = (
            "Name,Category,SKU,Barcode,Buying Price,Selling Price,Current Stock,Min Stock Level,Supplier,Description\n"
            "Sugar 1kg,Groceries,SKU-SUGAR-01,1122334455,120,150,40,10,Mumias Sugar,Fine white sugar\n"
            "Salt 500g,Groceries,SKU-SALT-02,2233445566,30,45,100,20,Kensalt,Iodized table salt\n"
        )
        uploaded_file = SimpleUploadedFile(
            "products.csv",
            csv_content.encode("utf-8"),
            content_type="text/csv"
        )

        response = self.client.post(
            "/api/v1/products/bulk-upload/",
            {"file": uploaded_file},
            format="multipart",
            **self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["total"], 2)
        self.assertEqual(data["created"], 2)
        self.assertEqual(data["updated"], 0)
        self.assertEqual(data["failed"], 0)

        # Check that products exist in db
        sugar = Product.objects.get(tenant=self.tenant, sku="SKU-SUGAR-01")
        self.assertEqual(sugar.name, "Sugar 1kg")
        self.assertEqual(sugar.selling_price, 150)
        self.assertEqual(sugar.current_stock, 40)
        self.assertEqual(sugar.category.name, "Groceries")
        self.assertEqual(sugar.supplier.name, "Mumias Sugar")

        # Check stock movement created
        movement = StockMovement.objects.filter(tenant=self.tenant, product=sugar).first()
        self.assertIsNotNone(movement)
        self.assertEqual(movement.quantity, 40)

    def test_bulk_upload_update_existing_product(self):
        # Create existing product
        cat = Category.objects.create(tenant=self.tenant, name="Beverages")
        Product.objects.create(
            tenant=self.tenant,
            name="Soda 500ml",
            sku="SKU-SODA-01",
            category=cat,
            buying_price=40,
            selling_price=60,
            current_stock=10
        )

        csv_content = (
            "Name,Category,SKU,Barcode,Buying Price,Selling Price,Current Stock,Min Stock Level,Supplier,Description\n"
            "Soda 500ml Cold,Beverages,SKU-SODA-01,,45,70,25,5,,Updated chilled soda\n"
        )
        uploaded_file = SimpleUploadedFile(
            "update.csv",
            csv_content.encode("utf-8"),
            content_type="text/csv"
        )

        response = self.client.post(
            "/api/v1/products/bulk-upload/",
            {"file": uploaded_file, "update_existing": "true"},
            format="multipart",
            **self.auth_headers
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["created"], 0)
        self.assertEqual(data["updated"], 1)

        updated_prod = Product.objects.get(tenant=self.tenant, sku="SKU-SODA-01")
        self.assertEqual(updated_prod.name, "Soda 500ml Cold")
        self.assertEqual(updated_prod.selling_price, 70)
        self.assertEqual(updated_prod.current_stock, 25)

    def test_bulk_upload_json_payload(self):
        payload = {
            "products": [
                {
                    "name": "Tea Leaves 250g",
                    "category": "Beverages",
                    "sku": "SKU-TEA-01",
                    "sellingPrice": 110,
                    "buyingPrice": 90,
                    "currentStock": 35
                }
            ]
        }
        response = self.client.post(
            "/api/v1/products/bulk-upload/",
            payload,
            format="json",
            **self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["created"], 1)
        tea = Product.objects.get(tenant=self.tenant, sku="SKU-TEA-01")
        self.assertEqual(tea.name, "Tea Leaves 250g")

    def test_bulk_upload_with_errors(self):
        csv_content = (
            "Name,Category,SKU,Barcode,Buying Price,Selling Price,Current Stock,Min Stock Level,Supplier,Description\n"
            ",Beverages,SKU-NONAME,,45,70,25,5,,Product without name\n"
            "Coffee 100g,Beverages,SKU-COFFEE,,150,200,10,2,Dormans,Instant coffee\n"
        )
        uploaded_file = SimpleUploadedFile(
            "test_err.csv",
            csv_content.encode("utf-8"),
            content_type="text/csv"
        )
        response = self.client.post(
            "/api/v1/products/bulk-upload/",
            {"file": uploaded_file},
            format="multipart",
            **self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total"], 2)
        self.assertEqual(data["created"], 1)
        self.assertEqual(data["failed"], 1)
        self.assertEqual(len(data["errors"]), 1)
        self.assertEqual(data["errors"][0]["row"], 1)
