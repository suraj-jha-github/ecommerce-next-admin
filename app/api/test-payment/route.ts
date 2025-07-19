import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();
        
        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        console.log('=== SIMULATING SUCCESSFUL PAYMENT ===');
        console.log('Order ID:', orderId);

        // Find the order
        const order = await prismadb.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        console.log('Found order:', order.id);
        console.log('Current isPaid status:', order.isPaid);

        if (order.isPaid) {
            return NextResponse.json({ 
                message: 'Order is already paid',
                orderId: order.id,
                isPaid: order.isPaid
            });
        }

        // Simulate successful payment by updating order
        const updatedOrder = await prismadb.order.update({
            where: { id: orderId },
            data: { 
                isPaid: true,
                status: 'CONFIRMED' // Also update status
            },
            include: { orderItems: true }
        });

        console.log('✅ Payment simulation successful!');
        console.log('✅ Order marked as paid:', updatedOrder.id);
        console.log('✅ New isPaid status:', updatedOrder.isPaid);
        console.log('✅ New status:', updatedOrder.status);

        // Archive products (optional for testing)
        const productIds = updatedOrder.orderItems.map(item => item.productId);
        await prismadb.product.updateMany({
            where: { id: { in: productIds } },
            data: { isArchived: true }
        });

        console.log('✅ Products archived');
        console.log('=== PAYMENT SIMULATION COMPLETE ===');

        return NextResponse.json({
            success: true,
            message: 'Payment simulated successfully',
            orderId: updatedOrder.id,
            isPaid: updatedOrder.isPaid,
            status: updatedOrder.status
        });

    } catch (error) {
        console.error('Payment simulation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 