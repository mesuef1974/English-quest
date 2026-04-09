from django.urls import path
from . import views

urlpatterns = [
    # Public
    path("plans/", views.PlanListView.as_view(), name="plans"),
    path("coupon/validate/", views.validate_coupon, name="validate_coupon"),
    # Authenticated
    path("subscription/", views.my_subscription, name="my_subscription"),
    path("checkout/", views.create_checkout, name="create_checkout"),
    path("cancel/", views.cancel_subscription, name="cancel_subscription"),
    path("history/", views.payment_history, name="payment_history"),
    # Webhooks (no auth — verified by signature)
    path("webhooks/stripe/", views.stripe_webhook, name="stripe_webhook"),
    path("webhooks/tap/", views.tap_webhook, name="tap_webhook"),
]
