"use client"
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Home } from 'lucide-react';
import { CellAction } from './cell-action';

export type BillboardColumn = {
    id: string
    label: string
    isHomePage: boolean
    createdAt: string
}

export const columns: ColumnDef<BillboardColumn>[] = [
    {
        accessorKey: 'label',
        header: 'Label',
    },
    {
        accessorKey: 'isHomePage',
        header: 'Home Page',
        cell: ({ row }) => {
            const isHomePage = row.getValue('isHomePage') as boolean;
            return (
                <div className="flex items-center gap-2">
                    {isHomePage && (
                        <Badge variant="default" className="flex items-center gap-1">
                            <Home className="w-3 h-3" />
                            Home Page
                        </Badge>
                    )}
                    {!isHomePage && (
                        <span className="text-sm text-gray-500">Regular</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        header: 'Date',
    },
    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />
    }
]