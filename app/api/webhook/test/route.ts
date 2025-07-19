import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'Webhook test endpoint',
        stripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        stripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
        frontendStoreUrl: process.env.FRONTEND_STORE_URL,
        stripeWebhookEndpoint: process.env.STRIPE_WEBHOOK_SECRET ? 'Configured' : 'Missing'
    });
} 