import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();
        
        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        console.log('Manual webhook trigger for order:', orderId);

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

        // Update order as paid
        const updatedOrder = await prismadb.order.update({
            where: { id: orderId },
            data: { isPaid: true },
            include: { orderItems: true }
        });

        console.log('✅ Order marked as paid:', updatedOrder.id);
        console.log('✅ New isPaid status:', updatedOrder.isPaid);

        // Archive products
        const productIds = updatedOrder.orderItems.map(item => item.productId);
        await prismadb.product.updateMany({
            where: { id: { in: productIds } },
            data: { isArchived: true }
        });

        console.log('✅ Products archived');

        return NextResponse.json({
            success: true,
            orderId: updatedOrder.id,
            isPaid: updatedOrder.isPaid
        });

    } catch (error) {
        console.error('Manual webhook trigger error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 