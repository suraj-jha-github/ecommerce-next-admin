import prismadb from '@/lib/prismadb';

const TestOrdersPage = async () => {
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

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Test Orders Data</h1>
            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border p-4 rounded">
                        <h3 className="font-bold">Order ID: {order.id}</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <strong>Customer Name:</strong> {order.customerName || 'Empty'}
                            </div>
                            <div>
                                <strong>Phone:</strong> {order.phone || 'Empty'}
                            </div>
                            <div>
                                <strong>Address:</strong> {order.address || 'Empty'}
                            </div>
                            <div>
                                <strong>Payment Method:</strong> {order.paymentMethod}
                            </div>
                            <div>
                                <strong>Store ID:</strong> {order.storeId}
                            </div>
                            <div>
                                <strong>Products:</strong> {order.orderItems.map(item => item.product.name).join(', ')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestOrdersPage; 