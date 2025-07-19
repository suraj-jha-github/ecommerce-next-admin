"use client"

import { useState } from 'react'
import * as z from 'zod'
import { Billboard } from "@prisma/client";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash, Home } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { AlertModal } from '@/components/modals/alert-modal';
import ImageUpload from '@/components/ui/image-upload';

interface SettingsFromProps {
    initialData: Billboard | null; 
}

const formSchema = z.object({
    label: z.string().min(1),
    imageUrl: z.string().optional(),
    isHomePage: z.boolean(),
})

type BillboardFormValues = z.infer<typeof formSchema>;

export const BillboardForm: React.FC<SettingsFromProps> = ({ initialData }) => {

    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? 'Edit billboard' : 'Create billboard'
    const description = initialData ? 'Edit a billboard' : 'Add a new billboard'
    const toastMessage = initialData ? 'Billboard updated.' : 'Billboard created.'
    const action = initialData ? 'Save changes' : 'Create'

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            label: '',
            imageUrl: '',
            isHomePage: false
        }
    });

    const onSubmit = async (data: BillboardFormValues) => {
        try {
            setLoading(true);
            console.log('Form data being submitted:', data);
            if (initialData) {
                const response = await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data)
                console.log('PATCH response:', response.data);
            } else {
                const response = await axios.post(`/api/${params.storeId}/billboards`, data)
                console.log('POST response:', response.data);
            }
            router.refresh();
            router.push(`/${params.storeId}/billboards`);
            if (data.isHomePage) {
                toast.success('Billboard set as home page banner!');
            } else {
                toast.success(toastMessage);
            }
        } catch(err) {
            console.error('Form submission error:', err);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false)
        }
    }

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`)
            router.refresh();
            router.push(`/${params.storeId}/billboards`)
            toast.success("Billboard deleted.")
        } catch(err) {
            toast.error("Make sure you removed all categories using this billboard first.");
        } finally {
            setLoading(false)
            setOpen(false);
        }
    }

    return (
        <>
            <AlertModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
            />
            <div className="flex items-center justify-between">
                <Heading title={title} description={description} />
                {initialData && (
                    <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={loading}>
                        <Trash className="w-4 h-4" />
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
                    <FormField
                        control={form.control} 
                        name="imageUrl"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Background Image</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        value={field.value ? [field.value] : []}
                                        disabled={loading}
                                        onChange={(url) => field.onChange(url)}
                                        onRemove={() => field.onChange('')}
                                        single={true}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className='grid grid-cols-3 gap-8'>
                        <FormField
                            control={form.control} 
                            name="label"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder='Billboard label' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control} 
                            name="isHomePage"
                            render={({field}) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="flex items-center gap-2">
                                            <Home className="w-4 h-4" />
                                            Set as Home Page Billboard
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            {field.value ? 
                                                "This billboard is currently set as the home page banner" : 
                                                "Check this to set as the home page banner (will replace any existing home page billboard)"
                                            }
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} className='ml-auto' type='submit'>{action}</Button>
                </form>
            </Form>
            {/* <Separator /> */}
        </>
    )
}