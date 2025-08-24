'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@mentorship/ui';
import { Button } from '@mentorship/ui';
import { Badge } from '@mentorship/ui';
import { Calendar, Clock, User, Video, MessageSquare } from 'lucide-react';
import AppLayout from '@/components/layout/app-layout';

interface Booking {
  id: string;
  offering: {
    title: string;
    mentor: {
      profile: {
        displayName: string;
      };
    };
  };
  mentee: {
    profile: {
      displayName: string;
    };
  };
  scheduledAt: string;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
  totalCents: number;
  currency: string;
  notes?: string;
}

export default function BookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'pending'>('all');

  useEffect(() => {
    if (session?.user) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(cents / 100);
  };

  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    const bookingDate = new Date(booking.scheduledAt);
    
    switch (filter) {
      case 'upcoming':
        return bookingDate > now && booking.status !== 'cancelled';
      case 'past':
        return bookingDate < now;
      case 'pending':
        return booking.status === 'pending';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <Button onClick={() => window.location.href = '/mentors'}>
          Book New Session
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' },
          { key: 'pending', label: 'Pending' }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            onClick={() => setFilter(tab.key as any)}
            className="px-4 py-2"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? "You don't have any bookings yet."
                : `No ${filter} bookings found.`
              }
            </p>
            {filter === 'all' && (
              <Button onClick={() => window.location.href = '/mentors'}>
                Find a Mentor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {booking.offering.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <User className="h-4 w-4 mr-2" />
                      <span>
                        {session?.user?.role === 'mentor' 
                          ? booking.mentee.profile?.displayName || 'Mentee'
                          : booking.offering.mentor.profile?.displayName || 'Mentor'
                        }
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(booking.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(booking.scheduledAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} ({booking.durationMinutes} min)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">
                      {formatCurrency(booking.totalCents, booking.currency)}
                    </span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <p className="text-sm text-gray-700">{booking.notes}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  {booking.status === 'confirmed' && (
                    <>
                      <Button size="sm" className="flex items-center">
                        <Video className="h-4 w-4 mr-2" />
                        Join Call
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                  {booking.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline">
                        Reschedule
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      Leave Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
