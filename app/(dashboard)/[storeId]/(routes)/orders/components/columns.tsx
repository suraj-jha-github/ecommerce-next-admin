"use client"
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Truck, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export type OrderColumn = {
    id: string
    phone: string
    address: string
    customerName: string
    isPaid: boolean
    totalPrice: string
    products: string
    createdAt: string
    storeId: string
    status: string
    trackingNumber: string
    paymentMethod: string
}

const StatusUpdateCell = ({ row }: { row: any }) => {
    const [status, setStatus] = useState(row.original.status);
    const [trackingNumber, setTrackingNumber] = useState(row.original.trackingNumber || '');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async () => {
        setIsUpdating(true);
        try {
            await fetch(`/api/${row.original.storeId}/orders/${row.original.id}/update-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status,
                    trackingNumber
                }),
            });
            window.location.reload();
        } catch (error) {
            console.error('Error updating order status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="w-4 h-4" />;
            case 'CONFIRMED':
                return <CheckCircle className="w-4 h-4" />;
            case 'PROCESSING':
                return <Package className="w-4 h-4" />;
            case 'SHIPPED':
                return <Truck className="w-4 h-4" />;
            case 'DELIVERED':
                return <CheckCircle className="w-4 h-4" />;
            case 'CANCELLED':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                {getStatusIcon(status)}
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Input
                placeholder="Tracking Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-32"
            />
            <Button
                size="sm"
                variant="outline"
                onClick={handleStatusUpdate}
                disabled={isUpdating}
            >
                {isUpdating ? 'Updating...' : 'Update'}
            </Button>
        </div>
    );
};

export const columns: ColumnDef<OrderColumn>[] = [
    {
        accessorKey: 'products',
        header: 'Products',
    },
    {
        id: 'customerDetails',
        header: 'Customer Details',
        cell: ({ row }) => {
            // Access data directly from row.original
            const customerName = row.original.customerName || '';
            const phone = row.original.phone || '';
            const address = row.original.address || '';
            const paymentMethod = row.original.paymentMethod || '';
            
            return (
                <div className="space-y-2 max-w-xs">
                    <div className="border-b pb-2">
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-gray-500">Name:</span>
                            <span className="text-sm font-medium">{customerName || 'Not provided'}</span>
                        </div>
                    </div>
                    <div className="border-b pb-2">
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-gray-500">Phone:</span>
                            <span className="text-sm">{phone || 'Not provided'}</span>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-start gap-1">
                            <span className="text-xs font-medium text-gray-500 mt-0.5">Address:</span>
                            <span className="text-sm text-gray-600 break-words">{address || 'Not provided'}</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-400">
                        Store: {row.original.storeId?.slice(0, 8)}...
                    </div>
                </div>
            );
        },
    },

    {
        accessorKey: 'totalPrice',
        header: 'Total Price',
    },
    {
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
        cell: ({ row }) => {
            const paymentMethod = row.getValue('paymentMethod') as string;
            return (
                <Badge variant={paymentMethod === 'COD' ? 'secondary' : 'default'}>
                    {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit Card'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'isPaid',
        header: 'Paid',
        cell: ({ row }) => {
            const isPaid = row.getValue('isPaid') as boolean;
            return (
                <div className="flex items-center gap-2">
                    <Badge variant={isPaid ? 'default' : 'secondary'}>
                        {isPaid ? 'Paid' : 'Unpaid'}
                    </Badge>
                    {!isPaid && (
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                    const orderId = row.original.id;
                                    try {
                                        await fetch(`/api/${row.original.storeId}/orders/${orderId}/mark-paid`, {
                                            method: 'PATCH',
                                        });
                                        window.location.reload();
                                    } catch (error) {
                                        console.error('Error marking order as paid:', error);
                                    }
                                }}
                            >
                                <Check className="w-4 h-4 mr-1" />
                                Mark Paid
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={async () => {
                                    const orderId = row.original.id;
                                    try {
                                        await fetch('/api/test-payment', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({ orderId }),
                                        });
                                        window.location.reload();
                                    } catch (error) {
                                        console.error('Error simulating payment:', error);
                                    }
                                }}
                            >
                                Simulate Payment
                            </Button>
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status & Tracking',
        cell: ({ row }) => <StatusUpdateCell row={row} />,
    },
    {
        accessorKey: 'createdAt',
        header: 'Date',
    }
]