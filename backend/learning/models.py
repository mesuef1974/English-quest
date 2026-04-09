"""
learning/models.py — Categories, Levels, Learning Items
20 categories × 3 levels = 60 learning units
"""
from django.db import models


class Category(models.Model):
    """فئة تعليمية — مثل: الحيوانات، الطعام، الألوان"""
    slug = models.SlugField("المعرّف", unique=True, max_length=30)
    name_ar = models.CharField("الاسم بالعربية", max_length=50)
    name_en = models.CharField("الاسم بالإنجليزية", max_length=50)
    emoji = models.CharField("الرمز", max_length=10)
    color = models.CharField("اللون", max_length=7, default="#2EC4B6")
    order = models.PositiveIntegerField("الترتيب", default=0)
    is_free = models.BooleanField("مجاني", default=False, help_text="متاح في الإصدار المجاني")
    is_active = models.BooleanField("نشط", default=True)

    class Meta:
        verbose_name = "فئة"
        verbose_name_plural = "الفئات"
        ordering = ["order"]

    def __str__(self):
        return f"{self.emoji} {self.name_ar}"


class LearningItem(models.Model):
    """عنصر تعليمي — كلمة أو جملة"""
    LEVEL_CHOICES = [("L1", "مبتدئ — كلمات"), ("L2", "متوسط — جمل"), ("L3", "متقدم — جمل مركبة")]

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="items", verbose_name="الفئة")
    level = models.CharField("المستوى", max_length=2, choices=LEVEL_CHOICES)
    text_en = models.CharField("النص الإنجليزي", max_length=200)
    text_ar = models.CharField("النص العربي", max_length=200)
    emoji = models.CharField("الرمز", max_length=10, blank=True)
    audio_en_url = models.URLField("رابط الصوت الإنجليزي", blank=True)
    audio_ar_url = models.URLField("رابط الصوت العربي", blank=True)
    order = models.PositiveIntegerField("الترتيب", default=0)
    is_active = models.BooleanField("نشط", default=True)

    class Meta:
        verbose_name = "عنصر تعليمي"
        verbose_name_plural = "العناصر التعليمية"
        ordering = ["category", "level", "order"]
        unique_together = ["category", "level", "text_en"]

    def __str__(self):
        return f"[{self.level}] {self.emoji} {self.text_en} = {self.text_ar}"
