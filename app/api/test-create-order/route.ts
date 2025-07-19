import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { storeId, customerName, phone, address, paymentMethod } = body;

        // Create a test order with customer details
        const order = await prismadb.order.create({
            data: {
                storeId: storeId || "c30c2c17-0dd0-42a0-bb8b-cc6a73218a19", // Default store ID
                userId: "test_user_123",
                customerName: customerName || "Test Customer",
                phone: phone || "1234567890",
                address: address || "Test Address, City, State",
                paymentMethod: paymentMethod || "COD",
                isPaid: false,
                status: "PENDING",
                orderItems: {
                    create: [
                        {
                            product: {
                                connect: {
                                    id: "your-product-id-here" // You'll need to replace this with an actual product ID
                                }
                            }
                        }
                    ]
                }
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });

        console.log('Test order created:', {
            id: order.id,
            customerName: order.customerName,
            phone: order.phone,
            address: order.address,
            paymentMethod: order.paymentMethod
        });

        return NextResponse.json({
            message: 'Test order created successfully',
            order: {
                id: order.id,
                customerName: order.customerName,
                phone: order.phone,
                address: order.address,
                paymentMethod: order.paymentMethod
            }
        });

    } catch (err) {
        console.log(`[TEST_CREATE_ORDER_POST] ${err}`);
        return new NextResponse(`Internal error: ${err}`, { status: 500})
    }
} 