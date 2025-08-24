'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@mentorship/ui';
import { Button } from '@mentorship/ui';
import { Badge } from '@mentorship/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@mentorship/ui';
import { 
  Bell, 
  Check, 
  Trash2, 
  Clock, 
  MessageSquare, 
  Calendar, 
  DollarSign,
  Star,
  User,
  Settings
} from 'lucide-react';

interface Notification {
  id: string;
  kind: string;
  payload: {
    title: string;
    message: string;
    actionUrl?: string;
    mentorName?: string;
    menteeName?: string;
    bookingId?: string;
    offeringTitle?: string;
    amount?: number;
    currency?: string;
  };
  channel: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (kind: string) => {
    switch (kind) {
      case 'booking_confirmed':
      case 'booking_request':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'message_received':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'payment_received':
      case 'payment_processed':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'review_received':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'mentor_matched':
        return <User className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (kind: string) => {
    switch (kind) {
      case 'booking_confirmed':
      case 'payment_received':
        return 'bg-green-50 border-green-200';
      case 'booking_request':
      case 'message_received':
        return 'bg-blue-50 border-blue-200';
      case 'review_received':
        return 'bg-yellow-50 border-yellow-200';
      case 'mentor_matched':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'read':
        return notification.isRead;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 mt-2">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'read', label: 'Read', count: notifications.length - unreadCount }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            onClick={() => setFilter(tab.key as any)}
            className="px-4 py-2"
          >
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="secondary" className="ml-2">
                {tab.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You're all caught up! No notifications yet."
                : `No ${filter} notifications found.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${
                notification.isRead ? 'opacity-75' : ''
              } ${getNotificationColor(notification.kind)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.kind)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {notification.payload.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.payload.message}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    {/* Additional context based on notification type */}
                    {notification.payload.mentorName && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-2" />
                        <span>Mentor: {notification.payload.mentorName}</span>
                      </div>
                    )}

                    {notification.payload.offeringTitle && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span>Session: {notification.payload.offeringTitle}</span>
                      </div>
                    )}

                    {notification.payload.amount && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: notification.payload.currency || 'USD'
                          }).format(notification.payload.amount / 100)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 mt-3">
                      {notification.payload.actionUrl && (
                        <Button 
                          size="sm" 
                          onClick={() => window.location.href = notification.payload.actionUrl!}
                        >
                          View Details
                        </Button>
                      )}
                      
                      {!notification.isRead && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Notification Settings Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Email Notifications</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Booking confirmations and updates</li>
                <li>• New messages from mentors/mentees</li>
                <li>• Payment confirmations</li>
                <li>• Weekly activity summaries</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">In-App Notifications</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Real-time booking requests</li>
                <li>• Instant messages</li>
                <li>• Session reminders</li>
                <li>• Mentor matching suggestions</li>
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              Manage Notification Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
}
