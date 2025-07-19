import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const { storeId, userId } = await req.json();
        
        if (!storeId) {
            return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        console.log('Creating test COD order for store:', storeId);

        // Create a test COD order
        const order = await prismadb.order.create({
            data: {
                storeId: storeId,
                userId: userId || "demo_user_123",
                isPaid: false,
                paymentMethod: "COD",
                status: "PENDING",
                phone: "+1234567890",
                address: "123 Test Street, Test City, TC 12345",
                orderItems: {
                    create: [
                        {
                            product: {
                                connect: {
                                    id: "test-product-id" // This would be a real product ID
                                }
                            }
                        }
                    ]
                }
            },
            include: {
                orderItems: true
            }
        });

        console.log('✅ COD order created:', order.id);
        console.log('✅ Payment method:', order.paymentMethod);
        console.log('✅ Is paid:', order.isPaid);

        return NextResponse.json({
            success: true,
            orderId: order.id,
            paymentMethod: order.paymentMethod,
            isPaid: order.isPaid,
            status: order.status
        });

    } catch (error: any) {
        console.error('Test COD order error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
    }
} 