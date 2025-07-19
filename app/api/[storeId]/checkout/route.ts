import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
    const { productIds, userId, paymentMethod = "STRIPE", customerName, phone, address } = await req.json();
    const { storeId } = await params; 

    if(!productIds || productIds.length === 0) {
        return new NextResponse("Product ids are required", { status: 400 });
    }

    // For all orders, require customer details
    if (!customerName || !phone || !address) {
        return new NextResponse("Customer name, phone, and address are required for all orders", { status: 400 });
    }

    const products = await prismadb.product.findMany({
        where: {
            id: {
                in: productIds
            }
        }
    })

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    products.forEach((product) => {
        line_items.push({
            quantity: 1,
            price_data: {
                currency: 'USD',
                product_data: {
                    name: product.name,
                },
                unit_amount: Number(product.price) * 100
            }
        })
    })

    const order = await prismadb.order.create({
        data: {
            storeId: storeId,
            userId: userId || "anonymous",
            isPaid: paymentMethod === "COD" ? false : false, // COD orders start as unpaid
            paymentMethod: paymentMethod,
            customerName: customerName || "",
            phone: phone || "",
            address: address || "",
            orderItems: {
                create: productIds.map((productId: string) => ({
                    product: {
                        connect: {
                            id: productId
                        }
                    }
                }))
            }
        }
    })

    console.log('Order created with ID:', order.id);
    console.log('Order userId:', order.userId);
    console.log('Order payment method:', order.paymentMethod);
    console.log('Order customer name:', order.customerName);
    console.log('Order phone:', order.phone);
    console.log('Order address:', order.address);
    console.log('Order isPaid status:', order.isPaid);

    // Handle different payment methods
    if (paymentMethod === "COD") {
        // For COD, return success immediately
        return NextResponse.json({ 
            url: `${process.env.FRONTEND_STORE_URL}/cart?success=1&orderId=${order.id}`,
            orderId: order.id,
            paymentMethod: "COD"
        }, {
            headers: corsHeaders,
        });
    } else {
        // For Stripe, create checkout session
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            billing_address_collection: "required",
            phone_number_collection: {
                enabled: true,
            },
            success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
            cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?cancelled=1`,
            metadata: {
                orderId: order.id
            }
        })

        console.log('Stripe session created with metadata:', session.metadata);

        return NextResponse.json({ url: session.url }, {
            headers: corsHeaders,
        })
    }
}