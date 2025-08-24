'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@mentorship/ui';
import { Button } from '@mentorship/ui';
import { Input } from '@mentorship/ui';
import { Switch } from '@mentorship/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mentorship/ui';
import { Badge } from '@mentorship/ui';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Moon, 
  Sun,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: {
      bookingUpdates: boolean;
      messages: boolean;
      payments: boolean;
      weeklySummary: boolean;
    };
    push: {
      bookingUpdates: boolean;
      messages: boolean;
      reminders: boolean;
      matches: boolean;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'mentors_only';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
    allowMatching: boolean;
  };
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (session?.user) {
      fetchPreferences();
    }
  }, [session]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/users/preferences', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        // Show success message
        console.log('Preferences saved successfully');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        alert('Password changed successfully');
      } else {
        alert('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/users/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      if (response.ok) {
        // Redirect to logout or home page
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/users/export-data', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user-data.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input value={session?.user?.email || ''} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="flex items-center">
                    <Badge variant="secondary">
                      {session?.user?.role === 'mentor' ? 'Mentor' : 'Mentee'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value
                  })}
                />
              </div>
              <Button onClick={changePassword}>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {preferences && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Booking Updates</h4>
                      <p className="text-sm text-gray-600">Get notified about booking confirmations and changes</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.email.bookingUpdates}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          email: {
                            ...preferences.notifications.email,
                            bookingUpdates: checked
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New Messages</h4>
                      <p className="text-sm text-gray-600">Receive email notifications for new messages</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.email.messages}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          email: {
                            ...preferences.notifications.email,
                            messages: checked
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Payment Confirmations</h4>
                      <p className="text-sm text-gray-600">Get notified about payment transactions</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.email.payments}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          email: {
                            ...preferences.notifications.email,
                            payments: checked
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Summary</h4>
                      <p className="text-sm text-gray-600">Receive a weekly summary of your activity</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.email.weeklySummary}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          email: {
                            ...preferences.notifications.email,
                            weeklySummary: checked
                          }
                        }
                      })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {preferences && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Booking Updates</h4>
                      <p className="text-sm text-gray-600">Real-time booking notifications</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.push.bookingUpdates}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          push: {
                            ...preferences.notifications.push,
                            bookingUpdates: checked
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Messages</h4>
                      <p className="text-sm text-gray-600">Instant message notifications</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.push.messages}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          push: {
                            ...preferences.notifications.push,
                            messages: checked
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Session Reminders</h4>
                      <p className="text-sm text-gray-600">Reminders for upcoming sessions</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.push.reminders}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          push: {
                            ...preferences.notifications.push,
                            reminders: checked
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mentor Matches</h4>
                      <p className="text-sm text-gray-600">New mentor matching suggestions</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.push.matches}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          push: {
                            ...preferences.notifications.push,
                            matches: checked
                          }
                        }
                      })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {preferences && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={preferences.privacy.profileVisibility}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        privacy: {
                          ...preferences.privacy,
                          profileVisibility: e.target.value as any
                        }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="public">Public - Anyone can see my profile</option>
                      <option value="mentors_only">Mentors Only - Only mentors can see my profile</option>
                      <option value="private">Private - Only I can see my profile</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show Email Address</h4>
                      <p className="text-sm text-gray-600">Allow others to see your email address</p>
                    </div>
                    <Switch
                      checked={preferences.privacy.showEmail}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        privacy: {
                          ...preferences.privacy,
                          showEmail: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show Phone Number</h4>
                      <p className="text-sm text-gray-600">Allow others to see your phone number</p>
                    </div>
                    <Switch
                      checked={preferences.privacy.showPhone}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        privacy: {
                          ...preferences.privacy,
                          showPhone: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Allow Direct Messages</h4>
                      <p className="text-sm text-gray-600">Allow others to send you direct messages</p>
                    </div>
                    <Switch
                      checked={preferences.privacy.allowMessages}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        privacy: {
                          ...preferences.privacy,
                          allowMessages: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Allow Mentor Matching</h4>
                      <p className="text-sm text-gray-600">Allow the system to suggest mentor matches</p>
                    </div>
                    <Switch
                      checked={preferences.privacy.allowMatching}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        privacy: {
                          ...preferences.privacy,
                          allowMatching: checked
                        }
                      })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Export Your Data</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Download a copy of all your data including profile, bookings, messages, and preferences.
                </p>
                <Button variant="outline" onClick={exportData} className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={deleteAccount}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </AppLayout>
  );
}
