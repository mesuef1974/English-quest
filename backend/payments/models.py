"""
payments/models.py — Subscription plans, payments, invoices
Supports: tap payments (GCC) + Stripe (global)
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class Plan(models.Model):
    """خطط الاشتراك"""
    INTERVAL_CHOICES = [("monthly", "شهري"), ("annual", "سنوي"), ("lifetime", "مدى الحياة")]

    slug = models.SlugField(unique=True)
    name_ar = models.CharField("الاسم بالعربية", max_length=50)
    name_en = models.CharField("الاسم بالإنجليزية", max_length=50)
    description_ar = models.TextField("الوصف بالعربية", blank=True)
    price_usd = models.DecimalField("السعر (USD)", max_digits=8, decimal_places=2)
    price_qar = models.DecimalField("السعر (QAR)", max_digits=8, decimal_places=2)
    interval = models.CharField("الفترة", max_length=10, choices=INTERVAL_CHOICES)
    max_children = models.PositiveIntegerField("أقصى عدد أطفال", default=4)
    features = models.JSONField("المميزات", default=list, help_text='["20 فئة","نطق صوتي",...]')
    stripe_price_id = models.CharField("Stripe Price ID", max_length=100, blank=True)
    tap_plan_id = models.CharField("tap Plan ID", max_length=100, blank=True)
    is_active = models.BooleanField("نشط", default=True)
    is_popular = models.BooleanField("الأكثر شيوعاً", default=False)
    order = models.PositiveIntegerField("الترتيب", default=0)

    class Meta:
        verbose_name = "خطة"
        verbose_name_plural = "الخطط"
        ordering = ["order"]

    def __str__(self):
        return f"{self.name_ar} — ${self.price_usd}/{self.get_interval_display()}"


class Subscription(models.Model):
    """اشتراك والد في خطة"""
    STATUS_CHOICES = [
        ("trialing", "تجريبي"), ("active", "نشط"), ("past_due", "متأخر"),
        ("canceled", "ملغي"), ("expired", "منتهي"),
    ]
    GATEWAY_CHOICES = [("stripe", "Stripe"), ("tap", "tap"), ("manual", "يدوي")]

    parent = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                   related_name="subscription", verbose_name="الوالد")
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, verbose_name="الخطة")
    status = models.CharField("الحالة", max_length=10, choices=STATUS_CHOICES, default="trialing")
    gateway = models.CharField("بوابة الدفع", max_length=10, choices=GATEWAY_CHOICES, default="stripe")
    gateway_subscription_id = models.CharField("معرّف الاشتراك الخارجي", max_length=200, blank=True)
    gateway_customer_id = models.CharField("معرّف العميل الخارجي", max_length=200, blank=True)
    current_period_start = models.DateTimeField("بداية الفترة الحالية", default=timezone.now)
    current_period_end = models.DateTimeField("نهاية الفترة الحالية")
    trial_end = models.DateTimeField("نهاية الفترة التجريبية", null=True, blank=True)
    canceled_at = models.DateTimeField("تاريخ الإلغاء", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "اشتراك"
        verbose_name_plural = "الاشتراكات"

    def __str__(self):
        return f"{self.parent} → {self.plan.name_ar} ({self.get_status_display()})"

    @property
    def is_valid(self):
        if self.status in ("active", "trialing"):
            return self.current_period_end > timezone.now()
        return False

    @property
    def days_remaining(self):
        if self.is_valid:
            return (self.current_period_end - timezone.now()).days
        return 0

    def save(self, *args, **kwargs):
        if not self.current_period_end:
            if self.plan.interval == "monthly":
                self.current_period_end = self.current_period_start + timedelta(days=30)
            elif self.plan.interval == "annual":
                self.current_period_end = self.current_period_start + timedelta(days=365)
            else:
                self.current_period_end = self.current_period_start + timedelta(days=36500)
        super().save(*args, **kwargs)


class Payment(models.Model):
    """سجل دفعة واحدة"""
    STATUS_CHOICES = [("pending", "قيد الانتظار"), ("completed", "مكتمل"), ("failed", "فشل"), ("refunded", "مسترد")]

    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name="payments", verbose_name="الاشتراك")
    amount_usd = models.DecimalField("المبلغ (USD)", max_digits=8, decimal_places=2)
    amount_local = models.DecimalField("المبلغ (محلي)", max_digits=8, decimal_places=2, null=True)
    currency = models.CharField("العملة", max_length=3, default="USD")
    status = models.CharField("الحالة", max_length=10, choices=STATUS_CHOICES, default="pending")
    gateway = models.CharField("البوابة", max_length=10, default="stripe")
    gateway_payment_id = models.CharField("معرّف الدفعة الخارجي", max_length=200, blank=True)
    gateway_response = models.JSONField("استجابة البوابة", default=dict, blank=True)
    paid_at = models.DateTimeField("تاريخ الدفع", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "دفعة"
        verbose_name_plural = "المدفوعات"
        ordering = ["-created_at"]

    def __str__(self):
        return f"${self.amount_usd} — {self.get_status_display()} ({self.gateway})"


class Coupon(models.Model):
    """كوبون خصم"""
    code = models.CharField("الرمز", max_length=20, unique=True)
    discount_percent = models.PositiveIntegerField("نسبة الخصم %", default=0)
    discount_fixed_usd = models.DecimalField("خصم ثابت (USD)", max_digits=6, decimal_places=2, default=0)
    max_uses = models.PositiveIntegerField("أقصى استخدام", default=100)
    current_uses = models.PositiveIntegerField("الاستخدام الحالي", default=0)
    valid_from = models.DateTimeField("صالح من")
    valid_until = models.DateTimeField("صالح حتى")
    is_active = models.BooleanField("نشط", default=True)

    class Meta:
        verbose_name = "كوبون"
        verbose_name_plural = "الكوبونات"

    def __str__(self):
        return f"{self.code} ({self.discount_percent}%)" if self.discount_percent else f"{self.code} (${self.discount_fixed_usd})"

    @property
    def is_valid(self):
        now = timezone.now()
        return self.is_active and self.current_uses < self.max_uses and self.valid_from <= now <= self.valid_until
