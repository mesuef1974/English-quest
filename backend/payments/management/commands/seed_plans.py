"""Seed subscription plans: Free, Monthly, Annual, School"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from payments.models import Plan, Coupon

class Command(BaseCommand):
    help = "Seed subscription plans and launch coupon"

    def handle(self, *args, **options):
        plans = [
            {"slug": "free", "name_ar": "مجاني", "name_en": "Free", "price_usd": 0, "price_qar": 0,
             "interval": "lifetime", "max_children": 1, "is_active": True, "order": 0,
             "description_ar": "3 فئات مجانية مع نطق صوتي",
             "features": ["3 فئات تعليمية", "4 أنماط لعب", "نطق صوتي", "طفل واحد"]},
            {"slug": "monthly", "name_ar": "شهري", "name_en": "Monthly", "price_usd": 3.99, "price_qar": 14.99,
             "interval": "monthly", "max_children": 4, "is_active": True, "order": 1,
             "description_ar": "كل المحتوى + 4 أطفال",
             "features": ["20 فئة تعليمية", "3 مستويات صعوبة", "نطق صوتي احترافي", "4 أطفال", "لوحة تحكم الوالدين", "بدون إعلانات"]},
            {"slug": "annual", "name_ar": "سنوي", "name_en": "Annual", "price_usd": 29.99, "price_qar": 109.99,
             "interval": "annual", "max_children": 4, "is_active": True, "is_popular": True, "order": 2,
             "description_ar": "وفّر 37% — كل شيء لسنة كاملة",
             "features": ["كل مميزات الشهري", "وفّر 37%", "أولوية الدعم الفني", "محتوى جديد أولاً"]},
            {"slug": "school", "name_ar": "مدرسي", "name_en": "School", "price_usd": 99.99, "price_qar": 364.99,
             "interval": "annual", "max_children": 40, "is_active": True, "order": 3,
             "description_ar": "رخصة مدرسية — حتى 40 طالب",
             "features": ["حتى 40 طالب", "لوحة معلم", "تقارير تفصيلية", "دعم فني مخصص", "دمج مع SchoolOS"]},
        ]

        for p_data in plans:
            Plan.objects.update_or_create(slug=p_data["slug"], defaults=p_data)

        # Launch coupon
        Coupon.objects.update_or_create(
            code="LAUNCH2026",
            defaults={
                "discount_percent": 50,
                "max_uses": 500,
                "valid_from": timezone.now(),
                "valid_until": timezone.now() + timedelta(days=90),
                "is_active": True,
            }
        )

        self.stdout.write(self.style.SUCCESS(
            f"✅ Seeded {Plan.objects.count()} plans + LAUNCH2026 coupon (50% off)"
        ))
