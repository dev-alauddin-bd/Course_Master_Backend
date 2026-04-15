// @ts-ignore
const Stripe = require('stripe');

import logger from "./logger";

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

if (stripeSecret === 'sk_test_placeholder') {
  logger.warn("Stripe secret key is missing (STRIPE_SECRET_KEY). Payment functionality will not work properly.");
}

export const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-02-24.acacia',
});
