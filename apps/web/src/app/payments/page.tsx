'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@mentorship/ui';
import { Button } from '@mentorship/ui';
import { Badge } from '@mentorship/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mentorship/ui';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Download,
  Eye
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'payment' | 'payout' | 'refund';
  description: string;
  bookingId?: string;
  offeringTitle?: string;
  mentorName?: string;
  menteeName?: string;
  createdAt: string;
  processedAt?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

export default function PaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchPayments();
      fetchPaymentMethods();
    }
  }, [session]);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payments/methods', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'payout': return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'refund': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadInvoice = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${paymentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const isMentor = session?.user?.role === 'mentor';
    return isMentor ? payment.type === 'payout' : payment.type === 'payment';
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Payments</h1>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {session?.user?.role === 'mentor' ? 'Payout History' : 'Payment History'}
            </h2>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>

          {filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No payments found
                </h3>
                <p className="text-gray-500">
                  {session?.user?.role === 'mentor' 
                    ? "You haven't received any payouts yet."
                    : "You haven't made any payments yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(payment.type)}
                        <div>
                          <h3 className="font-semibold">{payment.description}</h3>
                          {payment.offeringTitle && (
                            <p className="text-sm text-gray-600">
                              Session: {payment.offeringTitle}
                            </p>
                          )}
                          {payment.mentorName && (
                            <p className="text-sm text-gray-600">
                              Mentor: {payment.mentorName}
                            </p>
                          )}
                          {payment.menteeName && (
                            <p className="text-sm text-gray-600">
                              Mentee: {payment.menteeName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(payment.createdAt)}</span>
                      </div>
                      {payment.processedAt && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Processed: {formatDate(payment.processedAt)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      {payment.status === 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadInvoice(payment.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download Invoice
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payment Methods</h2>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          {paymentMethods.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No payment methods
                </h3>
                <p className="text-gray-500 mb-4">
                  Add a payment method to make bookings easier.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                        <div>
                          <h3 className="font-semibold">
                            {method.type === 'card' ? 'Credit Card' : 'Bank Account'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {method.type === 'card' 
                              ? `${method.brand} •••• ${method.last4}`
                              : `•••• ${method.last4}`
                            }
                          </p>
                          {method.expiryMonth && method.expiryYear && (
                            <p className="text-sm text-gray-600">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {method.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Payment Security Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Secure Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Security Features</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• SSL encrypted transactions</li>
                    <li>• PCI DSS compliant</li>
                    <li>• Secure payment processing</li>
                    <li>• Fraud protection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Accepted Payment Methods</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Visa, Mastercard, American Express</li>
                    <li>• PayPal</li>
                    <li>• Bank transfers (for payouts)</li>
                    <li>• Digital wallets</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
}
