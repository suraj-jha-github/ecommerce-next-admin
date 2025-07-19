import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
    try {
        // Get ALL orders without store filtering
        const allOrders = await prismadb.order.findMany({
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

        // Log each order's details
        const ordersWithDetails = allOrders.map(order => ({
            id: order.id,
            storeId: order.storeId,
            customerName: order.customerName,
            phone: order.phone,
            address: order.address,
            paymentMethod: order.paymentMethod,
            isPaid: order.isPaid,
            status: order.status,
            createdAt: order.createdAt,
            orderItems: order.orderItems.map(item => ({
                productName: item.product.name,
                productPrice: item.product.price
            }))
        }));

        console.log('All orders without store filter:', ordersWithDetails);

        return NextResponse.json({
            message: 'All orders retrieved successfully',
            orders: ordersWithDetails,
            totalOrders: allOrders.length
        });

    } catch (err) {
        console.log(`[TEST_ALL_ORDERS_GET] ${err}`);
        return new NextResponse(`Internal error`, { status: 500})
    }
} 