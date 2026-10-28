/** Local/test checkout without Stripe. Set PAYMENT_DEV_MODE=true, or leave unset in development with no Stripe key. */
export function isPaymentDevMode() {
  if (process.env.PAYMENT_DEV_MODE === "true") return true;
  if (process.env.PAYMENT_DEV_MODE === "false") return false;
  return process.env.NODE_ENV !== "production" && !process.env.STRIPE_SECRET_KEY;
}
