import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ storeId: string, orderId: string }> }
) {
    try {
        const { userId } = await auth();
        const { storeId, orderId } = await params;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!orderId) {
            return new NextResponse("Order ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const order = await prismadb.order.update({
            where: {
                id: orderId,
                storeId: storeId
            },
            data: {
                isPaid: true
            }
        });

        console.log('Order marked as paid:', order.id);

        return NextResponse.json(order);
    } catch (error) {
        console.log('[ORDER_MARK_PAID]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
} 