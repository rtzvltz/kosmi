import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

// Stripe Price IDs - deze moeten in de .env komen na aanmaken in Stripe Dashboard
export const STRIPE_PRICES = {
  family_1: process.env.STRIPE_PRICE_FAMILY_1!,
  family_2: process.env.STRIPE_PRICE_FAMILY_2!,
  family_3: process.env.STRIPE_PRICE_FAMILY_3!,
  school_class: process.env.STRIPE_PRICE_SCHOOL_CLASS!,
  school_unlimited: process.env.STRIPE_PRICE_SCHOOL_UNLIMITED!,
}
