// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const getStripeCustomer = async (customerId: string) => {
  try {
    return await stripe.customers.retrieve(customerId);
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error);
    return null;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (subscriptionId: string, params: Stripe.SubscriptionUpdateParams) => {
  try {
    return await stripe.subscriptions.update(subscriptionId, params);
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};