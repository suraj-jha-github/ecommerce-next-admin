import Stripe from "stripe";
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    console.log('=== STRIPE WEBHOOK RECEIVED ===');
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    console.log('Webhook signature:', signature ? 'Present' : 'Missing');
    console.log('Webhook body length:', body.length);
    console.log('STRIPE_WEBHOOK_SECRET exists:', !!process.env.STRIPE_WEBHOOK_SECRET);

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.error('STRIPE_WEBHOOK_SECRET is not configured');
            return new NextResponse('Webhook secret not configured', { status: 500 });
        }

        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('Webhook event type:', event.type);
        console.log('Webhook event ID:', event.id);
    } catch (error: any) {
        console.error('Webhook signature verification failed:', error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const address = session?.customer_details?.address;

    const addressComponents = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postal_code,
        address?.country,
    ];

    const addressString = addressComponents.filter(c => c !== null).join(', ');

    // Handle different payment events
    if (event.type === 'checkout.session.completed') {
        console.log('=== PROCESSING CHECKOUT.SESSION.COMPLETED ===');
        console.log('Session ID:', session.id);
        console.log('Order ID from metadata:', session?.metadata?.orderId);
        console.log('Payment status:', session.payment_status);
        console.log('Session amount total:', session.amount_total);
        
        if (!session?.metadata?.orderId) {
            console.error('No orderId found in session metadata');
            return new NextResponse('No orderId in metadata', { status: 400 });
        }

        try {
            // First check if order exists
            const existingOrder = await prismadb.order.findUnique({
                where: {
                    id: session.metadata.orderId,
                },
                include: {
                    orderItems: true,
                }
            });

            if (!existingOrder) {
                console.error('Order not found:', session.metadata.orderId);
                return new NextResponse('Order not found', { status: 404 });
            }

            console.log('Found existing order:', existingOrder.id);
            console.log('Current isPaid status:', existingOrder.isPaid);

            // Update the order
            const order = await prismadb.order.update({
                where: {
                    id: session.metadata.orderId,
                },
                data: {
                    isPaid: true,
                    status: 'CONFIRMED', // Set initial status
                    address: addressString,
                    phone: session?.customer_details?.phone || ''
                },
                include: {
                    orderItems: true,
                }
            });

            console.log('✅ Order updated successfully:', order.id);
            console.log('✅ New isPaid status:', order.isPaid);
            console.log('✅ New status:', order.status);
            console.log('✅ Order address:', order.address);
            console.log('✅ Order phone:', order.phone);

            // Archive the products
            const productIds = order.orderItems.map(orderItem => orderItem.productId);
            console.log('Product IDs to archive:', productIds);

            await prismadb.product.updateMany({
                where: {
                    id: {
                        in: [...productIds]
                    },
                },
                data: {
                    isArchived: true,
                }
            });
            
            console.log('✅ Products archived successfully');
            console.log('=== WEBHOOK PROCESSING COMPLETE ===');

        } catch (error) {
            console.error('Error updating order:', error);
            return new NextResponse('Error updating order', { status: 500 });
        }
    } else if (event.type === 'payment_intent.succeeded') {
        console.log('=== PROCESSING PAYMENT_INTENT.SUCCEEDED ===');
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment Intent ID:', paymentIntent.id);
        console.log('Amount:', paymentIntent.amount);
        
        // Handle payment intent success if needed
        console.log('Payment intent succeeded, but no order update needed');
        
    } else if (event.type === 'payment_intent.payment_failed') {
        console.log('=== PROCESSING PAYMENT_INTENT.PAYMENT_FAILED ===');
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment Intent ID:', paymentIntent.id);
        console.log('Failure reason:', paymentIntent.last_payment_error?.message);
        
    } else {
        console.log('Ignoring event type:', event.type);
    }

    return new NextResponse(null, { status: 200 });
}