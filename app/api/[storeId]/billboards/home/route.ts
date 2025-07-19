import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params; 

        if (!storeId) {
            return new NextResponse("Store Id is required", { status: 400});
        }

        // Find the billboard marked as home page
        const homeBillboard = await prismadb.billboard.findFirst({
            where: {
                storeId: storeId,
                isHomePage: true
            }
        });

        if (!homeBillboard) {
            return new NextResponse("No home page billboard found", { status: 404 });
        }

        return NextResponse.json(homeBillboard);

    } catch (err) {
        console.log(`[HOME_BILLBOARD_GET] ${err}`);
        return new NextResponse(`Internal error`, { status: 500})
    }
} 