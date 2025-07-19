import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!storeId) {
            return new NextResponse("Store Id is required", { status: 400 });
        }

        // Build the where clause
        const whereClause: any = {
            storeId: storeId,
        };

        // If userId is provided, filter by it (for user orders)
        // If no userId, return all orders (for admin view)
        if (userId) {
            whereClause.userId = userId;
        }

        const orders = await prismadb.order.findMany({
            where: whereClause,
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                                color: true,
                                size: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`Found ${orders.length} orders for store ${storeId}${userId ? ` and user ${userId}` : ' (admin view)'}`);

        return NextResponse.json(orders);
    } catch (err) {
        console.log(`[ORDERS_GET] ${err}`);
        return new NextResponse(`Internal error`, { status: 500 });
    }
} 