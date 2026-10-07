# NxtGlam Razorpay Integration

This version replaces Stripe Checkout with Razorpay Checkout.

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. Put your Razorpay **Test Key ID** in `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
3. Put your Razorpay **Test Key Secret** in `RAZORPAY_KEY_SECRET`.
4. Never publish or share the Secret Key.
5. Run `npm.cmd install`
6. Run `npm.cmd run dev`

The cart now opens Razorpay Checkout and verifies the payment signature on the server.
