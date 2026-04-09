from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Parent, Child

@admin.register(Parent)
class ParentAdmin(UserAdmin):
    list_display = ["username", "email", "first_name", "phone", "country", "children_count", "date_joined"]
    fieldsets = UserAdmin.fieldsets + (("إعدادات التطبيق", {"fields": ("phone", "country", "language", "daily_limit_minutes")}),)

@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ["name", "parent", "age", "current_level", "total_stars", "current_streak", "words_learned", "last_played"]
    list_filter = ["current_level", "is_active"]
    search_fields = ["name", "parent__username"]
