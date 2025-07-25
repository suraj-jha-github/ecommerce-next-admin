import prismadb from "@/lib/prismadb";
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from "next/server"

export async function GET (
    req: Request,
    { params }: { params: Promise<{ billboardId: string }>}
) {
    try {
        const { billboardId } = await params;
        if(!billboardId) {
            return new NextResponse("Billboard id is required", { status: 400 });
        }

        const billboard = await prismadb.billboard.findUnique({
            where: {
                id: billboardId,
            }
        })

        return NextResponse.json(billboard);
    } catch (err) {
        console.log('[BILLBOARD_GET]', err)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function PATCH (
    req: Request,
    { params }: { params: Promise<{ storeId: string, billboardId: string }>}
) {
    try {
        const { userId } = await auth();
        const body = await req.json();

        const { storeId, billboardId } = await params;

        const { label, imageUrl, isHomePage } = body;
        
        console.log('PATCH request body:', body);
        console.log('Image URL:', imageUrl);

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if (!label) {
            return new NextResponse("Label is required", { status: 400 });
        }

        // if (!imageUrl) {
        //     return new NextResponse("Image URL is required", { status: 400 });
        // }

        if(!billboardId) {
            return new NextResponse("Billboard id is required", { status: 400 });
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
                    isHomePage: true,
                    id: {
                        not: billboardId
                    }
                },
                data: {
                    isHomePage: false
                }
            });
        }

        const billboard = await prismadb.billboard.update({
            where: {
                id: billboardId
            },
            data: {
                label,
                imageUrl,
                isHomePage: isHomePage || false
            }
        })

        console.log('Updated billboard:', billboard);
        return NextResponse.json(billboard);
    } catch (err) {
        console.log('[BILLBOARD_PATCH]', err)
        return new NextResponse('Internal error', { status: 500 })
    }
}

//// Delete Method

export async function DELETE (
    req: Request,
    { params }: { params: Promise<{ storeId: string, billboardId: string }>}
) {
    try {
        const { userId } = await auth();
        const { billboardId, storeId } = await params;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if(!billboardId) {
            return new NextResponse("Billboard id is required", { status: 400 });
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

        const billboard = await prismadb.billboard.deleteMany({
            where: {
                id: billboardId,
            }
        })

        return NextResponse.json(billboard);
    } catch (err) {
        console.log('[BILLBOARD_DELETE]', err)
        return new NextResponse('Internal error', { status: 500 })
    }
}