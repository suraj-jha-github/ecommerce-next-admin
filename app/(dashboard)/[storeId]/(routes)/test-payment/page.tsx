"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function TestPaymentPage() {
    const [testResult, setTestResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const simulatePayment = async () => {
        setIsLoading(true);
        try {
            // Create a test order first
            const response = await fetch('/api/test-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    orderId: 'test-order-id' // This will be replaced with actual order ID
                }),
            });
            
            const result = await response.json();
            setTestResult(result);
        } catch (error) {
            setTestResult({ error: 'Failed to simulate payment' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Test Payment System</h2>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Simulation</CardTitle>
                        <CardDescription>
                            Test the payment system without setting up Stripe webhooks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={simulatePayment}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Simulating...' : 'Simulate Payment'}
                            </Button>
                            
                            <Badge variant="outline">
                                Local Development
                            </Badge>
                        </div>

                        {testResult && (
                            <div className="mt-4 p-4 border rounded-lg">
                                {testResult.success ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">Payment Simulation Successful!</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="font-medium">Payment Simulation Failed</span>
                                    </div>
                                )}
                                
                                <pre className="mt-2 text-sm bg-gray-100 p-2 rounded">
                                    {JSON.stringify(testResult, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div className="mt-6 space-y-2">
                            <h3 className="text-lg font-semibold">How to Test:</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Create an order through the store frontend</li>
                                <li>Go to Admin → Orders</li>
                                <li>Click "Simulate Payment" on any unpaid order</li>
                                <li>Check that the order status changes to "Paid"</li>
                                <li>Verify the order appears as paid in the user orders page</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 