import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute('/_layout/payment')({
    component: () => PaymentPage(),
})

const formSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    country: z.string().min(2, 'Country must be at least 2 characters'),
    vat: z.string().min(9, 'Vat must be 9 characters').max(9, 'Vat must be 9 characters'),
    cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
    cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
})

const purchaseItems = [
    { name: 'Game Title 1', price: 79.99 },
    { name: 'Game Title 2', price: 19.99 },
]

let userTestData = {
    name: "Antonio",
    email: "antonio@gmail.com",
    address: "Rua da asjasjdoa",
    city: "Barcelona",
    country: "Ucrain",
    vat: "123456789",
}


export default function PaymentPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6 ml-4">Complete Your Purchase</h1>
            <div className="grid md:grid-cols-2 gap-6">
                <PaymentForm />
                <PurchaseSummary />
            </div>
        </div>
    )
}

export function PaymentForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            email: '',
            address: '',
            city: '',
            country: '',
            vat: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        // Here you would typically send the form data to your server or a payment processor
        console.log(values)
        setTimeout(() => {
            setIsSubmitting(false)
            alert('Payment submitted successfully!')
            form.reset()
        }, 2000)
    }

    return (
        <Card className='ml-4'>
            <CardHeader>
                <CardTitle>Billing Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe@example.com" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Gaming Street" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="New York" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="United States" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="vat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>VAT</FormLabel>
                                        <FormControl>
                                            <Input placeholder="999999999" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button className="w-full" disabled={isSubmitting} type="submit">
                                {isSubmitting ? 'Processing...' : 'Complete Payment'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </CardContent>
        </Card>
    )
}

export function PurchaseSummary() {
    const subtotal = purchaseItems.reduce((sum, item) => sum + item.price, 0)
    const tax = subtotal * 0.08 // Assuming 8% tax rate
    const total = subtotal + tax

    return (
        <Card className='mr-4'>
            <CardHeader>
                <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {purchaseItems.map((item, index) => (
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
            </CardContent>
        </Card>
    )
}