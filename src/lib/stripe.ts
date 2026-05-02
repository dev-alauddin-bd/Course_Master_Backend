import Stripe from 'stripe';

import logger from "./logger";

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

if (stripeSecret === 'sk_test_placeholder') {
  logger.warn("Stripe secret key is missing (STRIPE_SECRET_KEY). Payment functionality will not work properly.");
}

export const stripe: InstanceType<typeof Stripe> = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16' as unknown as never,
});
