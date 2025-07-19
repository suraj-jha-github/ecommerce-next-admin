import { NextResponse } from 'next/server';
import { stripe } from "@/lib/stripe";

export async function GET() {
    try {
        // Test if Stripe is configured
        const testSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Test Product',
                        },
                        unit_amount: 2000, // $20.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3002/cart?success=1',
            cancel_url: 'http://localhost:3002/cart?canceled=1',
        });

        return NextResponse.json({
            success: true,
            message: 'Stripe is configured correctly',
            sessionId: testSession.id,
            sessionUrl: testSession.url,
            stripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
            stripePublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
            stripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        });

    } catch (error: any) {
        console.error('Stripe test error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
            stripePublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
            stripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        }, { status: 500 });
    }
} 