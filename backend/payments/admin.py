from django.contrib import admin
from .models import Plan, Subscription, Payment, Coupon

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ["name_ar", "name_en", "price_usd", "price_qar", "interval", "is_popular", "is_active", "order"]
    list_editable = ["price_usd", "price_qar", "is_popular", "is_active", "order"]

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ["parent", "plan", "status", "gateway", "current_period_end", "is_valid"]
    list_filter = ["status", "gateway", "plan"]
    search_fields = ["parent__username", "parent__email"]

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["subscription", "amount_usd", "currency", "status", "gateway", "paid_at"]
    list_filter = ["status", "gateway"]

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ["code", "discount_percent", "discount_fixed_usd", "current_uses", "max_uses", "valid_until", "is_active"]
    list_filter = ["is_active"]
