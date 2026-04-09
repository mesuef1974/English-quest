"""
accounts/models.py — Parent + Child profiles
PDPPL Article 17 compliant — children's data protection
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Parent(AbstractUser):
    """الوالد — صانع القرار والدافع"""
    phone = models.CharField("رقم الهاتف", max_length=20, blank=True)
    country = models.CharField("الدولة", max_length=50, default="QA")
    language = models.CharField("اللغة", max_length=5, default="ar", choices=[("ar", "عربي"), ("en", "English")])
    is_verified = models.BooleanField("موثّق", default=False)
    daily_limit_minutes = models.PositiveIntegerField("الحد اليومي (دقائق)", default=30)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "والد"
        verbose_name_plural = "أولياء الأمور"

    def __str__(self):
        return f"{self.get_full_name() or self.username}"

    @property
    def children_count(self):
        return self.children.count()

    def can_add_child(self):
        return self.children.count() < settings.MAX_CHILDREN_PER_PARENT


class Child(models.Model):
    """الطفل — المستخدم الأساسي للتطبيق"""
    LEVEL_CHOICES = [("L1", "مبتدئ"), ("L2", "متوسط"), ("L3", "متقدم")]

    parent = models.ForeignKey(Parent, on_delete=models.CASCADE, related_name="children", verbose_name="الوالد")
    name = models.CharField("الاسم", max_length=50)
    age = models.PositiveIntegerField("العمر", validators=[MinValueValidator(4), MaxValueValidator(15)])
    avatar_emoji = models.CharField("الأفاتار", max_length=10, default="🧒")
    current_level = models.CharField("المستوى الحالي", max_length=2, choices=LEVEL_CHOICES, default="L1")
    total_stars = models.PositiveIntegerField("مجموع النجوم", default=0)
    total_xp = models.PositiveIntegerField("مجموع النقاط", default=0)
    current_streak = models.PositiveIntegerField("السلسلة الحالية", default=0)
    longest_streak = models.PositiveIntegerField("أطول سلسلة", default=0)
    last_played = models.DateTimeField("آخر لعب", null=True, blank=True)
    total_play_minutes = models.PositiveIntegerField("إجمالي وقت اللعب (دقائق)", default=0)
    words_learned = models.PositiveIntegerField("الكلمات المتعلّمة", default=0)
    is_active = models.BooleanField("نشط", default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "طفل"
        verbose_name_plural = "الأطفال"
        ordering = ["-last_played"]

    def __str__(self):
        return f"{self.avatar_emoji} {self.name} ({self.get_current_level_display()})"
