import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
    try {
        // Get all orders with their data
        const orders = await prismadb.order.findMany({
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

        // Log each order's customer details
        const ordersWithDetails = orders.map(order => ({
            id: order.id,
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

        console.log('All orders with customer details:', ordersWithDetails);

        return NextResponse.json({
            message: 'Order data retrieved successfully',
            orders: ordersWithDetails,
            totalOrders: orders.length
        });

    } catch (err) {
        console.log(`[TEST_ORDERS_DATA_GET] ${err}`);
        return new NextResponse(`Internal error`, { status: 500})
    }
} 