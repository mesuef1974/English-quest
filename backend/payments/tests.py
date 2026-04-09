from django.test import TestCase
from .models import Plan, Coupon
from django.utils import timezone
from datetime import timedelta

class PlanModelTest(TestCase):
    def test_plan_creation(self):
        plan = Plan.objects.create(
            slug="test", name_ar="اختبار", name_en="Test",
            price_usd=9.99, price_qar=36.99, interval="monthly"
        )
        self.assertEqual(str(plan), "اختبار — $9.99/شهري")

class CouponModelTest(TestCase):
    def test_valid_coupon(self):
        coupon = Coupon.objects.create(
            code="TEST50", discount_percent=50, max_uses=10,
            valid_from=timezone.now() - timedelta(days=1),
            valid_until=timezone.now() + timedelta(days=30),
        )
        self.assertTrue(coupon.is_valid)

    def test_expired_coupon(self):
        coupon = Coupon.objects.create(
            code="EXPIRED", discount_percent=50, max_uses=10,
            valid_from=timezone.now() - timedelta(days=30),
            valid_until=timezone.now() - timedelta(days=1),
        )
        self.assertFalse(coupon.is_valid)
