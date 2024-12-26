import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatCurrency } from "@/lib/utils";
import { userQueryKey } from "@/lib/query-keys";
import { getUser } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { COUNTRIES_MAP, MISSING_VALUE_SYMBOL } from "@/lib/constants";

export const Route = createFileRoute('/_layout/payment')({
    component: () => PaymentPage(),
})

/**
 * Query options for retrieving the signed in user.
 * @returns Query options.
 */
function userQueryOptions() {
    return queryOptions({
        queryKey: userQueryKey,
        async queryFn() {
            const token = getToken();
            const payload = decodeTokenPayload(token);

            const userId = payload.sub;
            const user = await getUser(userId);

            return user;
        },
    });
}

const cartItems = [
    { name: 'Game Title 1', price: 79.99 },
    { name: 'Game Title 2', price: 19.99 },
    { name: 'Game Title 1', price: 79.99 },
    { name: 'Game Title 2', price: 19.99 },
    { name: 'Game Title 1', price: 79.99 },
    { name: 'Game Title 2', price: 19.99 },
    { name: 'Game Title 1', price: 79.99 },
    { name: 'Game Title 2', price: 19.99 },
]

export default function PaymentPage() {
    const query = useSuspenseQuery(userQueryOptions());
    const user = query.data;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold mb-6 ml-4">Complete Your Purchase</h1>
                <div className="text-lg mr-4">
                    Account Balance:{" "}
                    <span className="font-semibold">{formatCurrency(user.balance)}</span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <PaymentForm />
                <PurchaseSummary />
            </div>
        </div>
    )
}

export function PaymentForm() {
    const query = useSuspenseQuery(userQueryOptions());
    const user = query.data;
    const country =
        COUNTRIES_MAP[user.country.toUpperCase() as keyof typeof COUNTRIES_MAP]
            ?.name ?? MISSING_VALUE_SYMBOL;

    return (
        <Card className='ml-4 h-fit col-span-2'>
            <CardHeader>
                <CardTitle>Billing Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Username</p>
                            <p className="text-lg">{user.username}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p className="text-lg">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Country</p>
                            <p className="text-lg">{country}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">VAT</p>
                            <p className="text-lg">{user.vatin}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                            <p className="text-lg">{user.address}</p>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    )
}

export function PurchaseSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
    const tax = subtotal * 0.23;
    const total = subtotal + tax;

    /*     function onSubmit(values: z.infer<typeof formSchema>) {
            setIsSubmitting(true)
            // Here you would typically send the form data to your server or a payment processor
            console.log(values)
            setTimeout(() => {
                setIsSubmitting(false)
                alert('Payment submitted successfully!')
                form.reset()
            }, 2000)
        } */

    return (
        <Card className='mr-4'>
            <CardHeader>
                <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {cartItems.map((item, index) => (
                        <div key={index} className="flex justify-between">
                            <span>{item.name}</span>
                            <span>{formatCurrency(item.price)}</span>
                        </div>
                    ))}
                    <div className="border-t pt-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-4">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
                <Button className="w-full mt-4">
                    Complete Payment
                </Button>
            </CardContent>
        </Card>
    )
}