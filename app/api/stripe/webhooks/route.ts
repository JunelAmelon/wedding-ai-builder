import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { adminRepo } from "@/lib/db/repositories/adminRepo";
import type { UserSubscription } from "@/types/admin";
import type Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

function mapStatus(status: string): UserSubscription["status"] {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
      return "canceled";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "unpaid";
    default:
      return "unpaid";
  }
}

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") || "";
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (userId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const item = sub.items.data[0];
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;
          await userRepo.update(userId, {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          });
          await adminRepo.updateUserSubscription(subscriptionId, {
            userId,
            status: mapStatus(sub.status),
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            currentPeriodStart: new Date((item.current_period_start ?? sub.billing_cycle_anchor) * 1000).toISOString(),
            currentPeriodEnd: new Date((item.current_period_end ?? sub.billing_cycle_anchor) * 1000).toISOString(),
            planInterval: item?.price?.recurring?.interval || "month",
            amount: item?.price?.unit_amount || 3900,
            currency: sub.currency || "eur",
          });
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subDetails = invoice.parent?.subscription_details;
        const subscription = subDetails?.subscription;
        const subscriptionId = typeof subscription === "string" ? subscription : subscription?.id;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const item = sub.items.data[0];
          await adminRepo.updateUserSubscription(subscriptionId, {
            status: mapStatus(sub.status),
            currentPeriodStart: new Date((item.current_period_start ?? sub.billing_cycle_anchor) * 1000).toISOString(),
            currentPeriodEnd: new Date((item.current_period_end ?? sub.billing_cycle_anchor) * 1000).toISOString(),
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const item = sub.items.data[0];
        await adminRepo.updateUserSubscription(sub.id, {
          status: mapStatus(sub.status),
          currentPeriodStart: new Date((item.current_period_start ?? sub.billing_cycle_anchor) * 1000).toISOString(),
          currentPeriodEnd: new Date((item.current_period_end ?? sub.billing_cycle_anchor) * 1000).toISOString(),
        });
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook]", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
