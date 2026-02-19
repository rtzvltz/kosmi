import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const subscriptionType = session.metadata?.subscriptionType

      if (!userId || !subscriptionType) {
        console.error('Missing metadata in checkout session')
        break
      }

      // Bepaal subscription details
      let type: 'family' | 'school' = 'family'
      let childCount = 1
      let classCount = 1

      if (subscriptionType.startsWith('family_')) {
        type = 'family'
        childCount = parseInt(subscriptionType.split('_')[1])
      } else if (subscriptionType === 'school_class') {
        type = 'school'
        classCount = 1
      } else if (subscriptionType === 'school_unlimited') {
        type = 'school'
        classCount = 999 // Onbeperkt
      }

      // Maak subscription record aan
      const { error } = await supabase.from('subscriptions').insert({
        owner_id: userId,
        type,
        status: 'active',
        stripe_subscription_id: session.subscription as string,
        stripe_customer_id: session.customer as string,
        child_count: childCount,
        class_count: classCount,
      })

      if (error) {
        console.error('Error creating subscription:', error)
      }

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription

      // Update subscription status
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: subscription.status === 'active' ? 'active' : 'past_due',
        })
        .eq('stripe_subscription_id', subscription.id)

      if (error) {
        console.error('Error updating subscription:', error)
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      // Cancel subscription
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          ends_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)

      if (error) {
        console.error('Error cancelling subscription:', error)
      }

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
