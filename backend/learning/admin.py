from django.contrib import admin
from .models import Category, LearningItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["emoji", "name_ar", "name_en", "slug", "order", "is_free", "is_active"]
    list_editable = ["order", "is_free", "is_active"]
    prepopulated_fields = {"slug": ("name_en",)}

@admin.register(LearningItem)
class LearningItemAdmin(admin.ModelAdmin):
    list_display = ["emoji", "text_en", "text_ar", "category", "level", "order"]
    list_filter = ["category", "level", "is_active"]
    search_fields = ["text_en", "text_ar"]
    list_editable = ["order"]
