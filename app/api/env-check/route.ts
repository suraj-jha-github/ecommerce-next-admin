import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        stripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
        stripePublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
        stripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        frontendStoreUrl: process.env.FRONTEND_STORE_URL,
        databaseUrl: !!process.env.DATABASE_URL,
        cloudinaryUrl: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        missingVariables: [
            !process.env.STRIPE_SECRET_KEY && 'STRIPE_SECRET_KEY',
            !process.env.STRIPE_PUBLISHABLE_KEY && 'STRIPE_PUBLISHABLE_KEY',
            !process.env.STRIPE_WEBHOOK_SECRET && 'STRIPE_WEBHOOK_SECRET',
            !process.env.FRONTEND_STORE_URL && 'FRONTEND_STORE_URL',
            !process.env.DATABASE_URL && 'DATABASE_URL',
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'
        ].filter(Boolean)
    });
} 