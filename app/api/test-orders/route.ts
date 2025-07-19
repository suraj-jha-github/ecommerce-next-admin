import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const storeId = searchParams.get('storeId');

        console.log('Test orders API called with:', { userId, storeId });

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        // First, let's check if the store exists
        const store = await prismadb.store.findUnique({
            where: { id: storeId }
        });

        if (!store) {
            console.log('Store not found:', storeId);
            return NextResponse.json({ 
                error: 'Store not found',
                availableStores: await prismadb.store.findMany({
                    select: { id: true, name: true }
                })
            }, { status: 404 });
        }

        // Build the where clause
        const whereClause: any = {
            storeId: storeId,
        };

        if (userId) {
            whereClause.userId = userId;
        }

        console.log('Querying orders with where clause:', whereClause);

        const orders = await prismadb.order.findMany({
            where: whereClause,
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`Found ${orders.length} orders`);

        return NextResponse.json({
            success: true,
            totalOrders: orders.length,
            userId: userId || 'all users',
            storeId: storeId,
            storeName: store.name,
            orders: orders.map(order => ({
                id: order.id,
                userId: order.userId,
                isPaid: order.isPaid,
                status: order.status,
                createdAt: order.createdAt,
                itemsCount: order.orderItems.length
            }))
        });

    } catch (error: any) {
        console.error('Test orders error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
} 