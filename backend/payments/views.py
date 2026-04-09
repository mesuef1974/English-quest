"""
payments/views.py — Checkout, subscription management, webhooks
Supports Stripe + tap payments (GCC)
"""
import json
import logging
from decimal import Decimal
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Plan, Subscription, Payment, Coupon
from .serializers import (
    PlanSerializer, SubscriptionSerializer, CreateCheckoutSerializer,
    PaymentSerializer, CouponValidateSerializer, CouponResultSerializer,
)

logger = logging.getLogger(__name__)


class PlanListView(generics.ListAPIView):
    """GET /api/payments/plans/ — كل الخطط المتاحة (عام)"""
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer
    permission_classes = [permissions.AllowAny]


@api_view(["GET"])
def my_subscription(request):
    """GET /api/payments/subscription/ — اشتراكي الحالي"""
    try:
        sub = Subscription.objects.get(parent=request.user)
        return Response(SubscriptionSerializer(sub).data)
    except Subscription.DoesNotExist:
        return Response({
            "status": "free",
            "message": "أنت على الخطة المجانية",
            "available_plans": PlanSerializer(Plan.objects.filter(is_active=True), many=True).data,
        })


@api_view(["POST"])
def create_checkout(request):
    """
    POST /api/payments/checkout/ — إنشاء جلسة دفع
    
    Body: { plan_slug, gateway: "stripe"|"tap", coupon_code?, success_url, cancel_url }
    Returns: { checkout_url, session_id }
    """
    serializer = CreateCheckoutSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    plan = Plan.objects.filter(slug=data["plan_slug"], is_active=True).first()
    if not plan:
        return Response({"error": "الخطة غير موجودة"}, status=404)

    # Calculate price with coupon
    price = plan.price_usd
    coupon = None
    if data.get("coupon_code"):
        coupon = Coupon.objects.filter(code=data["coupon_code"]).first()
        if coupon and coupon.is_valid:
            if coupon.discount_percent > 0:
                price = price * (1 - Decimal(coupon.discount_percent) / 100)
            elif coupon.discount_fixed_usd > 0:
                price = max(Decimal("0"), price - coupon.discount_fixed_usd)

    gateway = data["gateway"]

    if gateway == "stripe":
        checkout_data = _create_stripe_checkout(request.user, plan, price, data, coupon)
    elif gateway == "tap":
        checkout_data = _create_tap_checkout(request.user, plan, price, data, coupon)
    else:
        return Response({"error": "بوابة دفع غير مدعومة"}, status=400)

    return Response(checkout_data, status=201)


def _create_stripe_checkout(user, plan, price, data, coupon):
    """Create Stripe Checkout Session"""
    # NOTE: In production, import stripe and create real session
    # import stripe
    # stripe.api_key = settings.STRIPE_SECRET_KEY
    # session = stripe.checkout.Session.create(...)

    return {
        "gateway": "stripe",
        "checkout_url": f"https://checkout.stripe.com/pay/placeholder_{plan.slug}",
        "session_id": f"cs_placeholder_{plan.slug}_{user.id}",
        "plan": plan.name_ar,
        "amount": str(price),
        "currency": "USD",
        "note": "في الإنتاج: سيتم توجيهك لصفحة Stripe الحقيقية",
    }


def _create_tap_checkout(user, plan, price, data, coupon):
    """Create tap payments checkout (GCC)"""
    # NOTE: In production, use tap API
    # import requests
    # response = requests.post("https://api.tap.company/v2/charges", ...)

    price_qar = plan.price_qar
    return {
        "gateway": "tap",
        "checkout_url": f"https://checkout.payments.tap.company/placeholder_{plan.slug}",
        "charge_id": f"chg_placeholder_{plan.slug}_{user.id}",
        "plan": plan.name_ar,
        "amount": str(price_qar),
        "currency": "QAR",
        "note": "في الإنتاج: سيتم توجيهك لصفحة tap الحقيقية",
    }


@api_view(["POST"])
def cancel_subscription(request):
    """POST /api/payments/cancel/ — إلغاء الاشتراك"""
    try:
        sub = Subscription.objects.get(parent=request.user, status__in=["active", "trialing"])
    except Subscription.DoesNotExist:
        return Response({"error": "لا يوجد اشتراك نشط"}, status=404)

    sub.status = "canceled"
    sub.canceled_at = timezone.now()
    sub.save()

    # TODO: Cancel on gateway (Stripe/tap)

    return Response({
        "message": "تم إلغاء الاشتراك. سيبقى نشطاً حتى نهاية الفترة الحالية.",
        "active_until": sub.current_period_end,
    })


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def validate_coupon(request):
    """POST /api/payments/coupon/validate/ — التحقق من كوبون"""
    serializer = CouponValidateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    coupon = Coupon.objects.filter(code=serializer.validated_data["code"]).first()
    if not coupon:
        return Response({"valid": False, "error": "كوبون غير موجود"}, status=404)
    
    if not coupon.is_valid:
        return Response({"valid": False, "error": "كوبون منتهي الصلاحية"}, status=400)

    return Response(CouponResultSerializer(coupon).data)


@api_view(["GET"])
def payment_history(request):
    """GET /api/payments/history/ — سجل المدفوعات"""
    try:
        sub = Subscription.objects.get(parent=request.user)
        payments = Payment.objects.filter(subscription=sub)
        return Response(PaymentSerializer(payments, many=True).data)
    except Subscription.DoesNotExist:
        return Response([])


# ═══════ WEBHOOKS ═══════

@csrf_exempt
def stripe_webhook(request):
    """POST /api/payments/webhooks/stripe/ — Stripe webhook handler"""
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    # TODO: In production, verify signature
    # import stripe
    # stripe.api_key = settings.STRIPE_SECRET_KEY
    # event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)

    try:
        event = json.loads(payload)
        event_type = event.get("type", "")

        if event_type == "checkout.session.completed":
            _handle_stripe_checkout_complete(event["data"]["object"])
        elif event_type == "invoice.paid":
            _handle_stripe_invoice_paid(event["data"]["object"])
        elif event_type == "customer.subscription.deleted":
            _handle_stripe_subscription_canceled(event["data"]["object"])

        logger.info(f"Stripe webhook processed: {event_type}")
        return HttpResponse(status=200)
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        return HttpResponse(status=400)


@csrf_exempt
def tap_webhook(request):
    """POST /api/payments/webhooks/tap/ — tap payments webhook handler"""
    try:
        event = json.loads(request.body)
        event_type = event.get("event", "")

        if event_type == "CHARGE_SUCCEEDED":
            _handle_tap_charge_success(event["data"])
        elif event_type == "CHARGE_FAILED":
            _handle_tap_charge_failed(event["data"])

        logger.info(f"tap webhook processed: {event_type}")
        return HttpResponse(status=200)
    except Exception as e:
        logger.error(f"tap webhook error: {e}")
        return HttpResponse(status=400)


def _handle_stripe_checkout_complete(session):
    """Process successful Stripe checkout"""
    logger.info(f"Stripe checkout complete: {session.get('id')}")
    # TODO: Create/update Subscription + Payment records


def _handle_stripe_invoice_paid(invoice):
    """Process recurring Stripe payment"""
    logger.info(f"Stripe invoice paid: {invoice.get('id')}")
    # TODO: Extend subscription period + create Payment record


def _handle_stripe_subscription_canceled(sub_data):
    """Process Stripe subscription cancellation"""
    logger.info(f"Stripe subscription canceled: {sub_data.get('id')}")
    # TODO: Update Subscription status


def _handle_tap_charge_success(charge):
    """Process successful tap charge"""
    logger.info(f"tap charge success: {charge.get('id')}")
    # TODO: Create/update Subscription + Payment records


def _handle_tap_charge_failed(charge):
    """Process failed tap charge"""
    logger.info(f"tap charge failed: {charge.get('id')}")
    # TODO: Update Payment status to failed
