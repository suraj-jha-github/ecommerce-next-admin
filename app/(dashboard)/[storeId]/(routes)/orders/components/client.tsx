"use client"

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { ApiList } from "@/components/ui/api-list"

import { columns, OrderColumn } from "./columns"

interface OrderClientProps {
  data: OrderColumn[]
}

export const OrderClient: React.FC<OrderClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      await fetch(`/api/${params.storeId}/orders/${orderId}/mark-paid`, {
        method: 'PATCH',
      });
      router.refresh();
    } catch (error) {
      console.error('Error marking order as paid:', error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Orders (${data.length})`} description="Manage orders for your store" />
      </div>
      <Separator />
      <DataTable searchKey="products" columns={columns} data={data} />
      <Separator />
      <ApiList entityName="orders" entityIdName="orderId" />
    </>
  )
}