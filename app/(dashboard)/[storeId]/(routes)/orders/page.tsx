import { format } from 'date-fns'
import prismadb from '@/lib/prismadb'
import { OrderClient } from './components/client'
import { OrderColumn } from './components/columns'
import { formatter } from '@/lib/utils'

const OrdersPage = async ({ 
    params
}: { 
    params: Promise<{ storeId: string }>
}) => {

    const { storeId } = await params;
    
    // Temporarily get all orders to see the data
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
    })

    const formattedOrders: OrderColumn[] = orders.map(item => ({
            id: item.id,
            phone: item.phone || '',
            address: item.address || '',
            customerName: item.customerName || '',
            products: item.orderItems.map((orderItem) => orderItem.product.name).join(', '),
            totalPrice: formatter.format(item.orderItems.reduce((total, item) => total + Number(item.product.price), 0)),
            isPaid: item.isPaid,
            status: item.status,
            trackingNumber: item.trackingNumber,
            paymentMethod: item.paymentMethod,
            createdAt: format(item.createdAt, "MMMM do, yyyy"),
            storeId: item.storeId,
        }));

    return (
        <div className="flex-col">
            <div className="flex-1 p-8 pt-6 space-y-4">
                <OrderClient data={formattedOrders} />
            </div>
        </div>
    )
}

export default OrdersPage;