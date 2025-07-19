import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import prismadb from "@/lib/prismadb";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { userId } = await auth();
        const body = await req.json();

        const { label, imageUrl, isHomePage } = body;
        const { storeId } = await params; 

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!label) {
            return new NextResponse("Label is required", { status: 400});
        }

        // if (!imageUrl) {
        //     return new NextResponse("Image Url is required", { status: 400});
        // }

        if (!storeId) {
            return new NextResponse("Store Id is required", { status: 400});
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // If this billboard is being set as home page, unset all other home page billboards
        if (isHomePage) {
            await prismadb.billboard.updateMany({
                where: {
                    storeId: storeId,
                    isHomePage: true
                },
                data: {
                    isHomePage: false
                }
            });
        }

        const billboard = await prismadb.billboard.create({
            data : {
                label,
                imageUrl,
                isHomePage: isHomePage || false,
                storeId: storeId
            }
        })

        return NextResponse.json(billboard);

    } catch (err) {
        console.log(`[BILLBOARDS_POST] ${err}`);
        return new NextResponse(`Internal error`, { status: 500})
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params; 

        if (!storeId) {
            return new NextResponse("Store Id is required", { status: 400});
        }

        const billboards = await prismadb.billboard.findMany({
            where: {
                storeId: storeId
            }
        })

        return NextResponse.json(billboards);

    } catch (err) {
        console.log(`[BILLBOARDS_GET] ${err}`);
        return new NextResponse(`Internal error`, { status: 500})
    }
}