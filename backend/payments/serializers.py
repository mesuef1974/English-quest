from rest_framework import serializers
from .models import Plan, Subscription, Payment, Coupon


class PlanSerializer(serializers.ModelSerializer):
    interval_display = serializers.CharField(source="get_interval_display", read_only=True)

    class Meta:
        model = Plan
        fields = ["id", "slug", "name_ar", "name_en", "description_ar",
                  "price_usd", "price_qar", "interval", "interval_display",
                  "max_children", "features", "is_popular", "order"]


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_detail = PlanSerializer(source="plan", read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Subscription
        fields = ["id", "plan", "plan_detail", "status", "status_display",
                  "gateway", "is_valid", "days_remaining",
                  "current_period_start", "current_period_end",
                  "trial_end", "canceled_at", "created_at"]
        read_only_fields = ["id", "status", "gateway", "current_period_start",
                           "current_period_end", "trial_end", "canceled_at", "created_at"]


class CreateCheckoutSerializer(serializers.Serializer):
    plan_slug = serializers.SlugField()
    gateway = serializers.ChoiceField(choices=["stripe", "tap"], default="stripe")
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    success_url = serializers.URLField(default="https://app.englishquest.qa/payment/success")
    cancel_url = serializers.URLField(default="https://app.englishquest.qa/payment/cancel")


class PaymentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "amount_usd", "amount_local", "currency",
                  "status", "status_display", "gateway", "paid_at", "created_at"]


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=20)


class CouponResultSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Coupon
        fields = ["code", "discount_percent", "discount_fixed_usd", "is_valid"]
