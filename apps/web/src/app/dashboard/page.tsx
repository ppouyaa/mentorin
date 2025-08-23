'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  Calendar, 
  MessageCircle, 
  Video, 
  Settings, 
  BookOpen,
  Star,
  Bell,
  Search
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/auth/login'); // Not logged in
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: true },
    { name: 'Find Mentors', href: '/mentors', icon: Search, current: false },
    { name: 'My Sessions', href: '/sessions', icon: Calendar, current: false },
    { name: 'Messages', href: '/messages', icon: MessageCircle, current: false },
    { name: 'Video Calls', href: '/calls', icon: Video, current: false },
    { name: 'My Courses', href: '/courses', icon: BookOpen, current: false },
    { name: 'Reviews', href: '/reviews', icon: Star, current: false },
    { name: 'Notifications', href: '/notifications', icon: Bell, current: false },
    { name: 'Settings', href: '/settings', icon: Settings, current: false },
  ];

  const stats = [
    { name: 'Total Sessions', value: '12', change: '+2.5%', changeType: 'positive' },
    { name: 'Active Mentors', value: '3', change: '+1', changeType: 'positive' },
    { name: 'Hours Learned', value: '24', change: '+8', changeType: 'positive' },
    { name: 'Rating', value: '4.8', change: '+0.2', changeType: 'positive' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Mentorship Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your mentorship journey.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Name:</span> {session.user?.name}</p>
                <p><span className="font-medium">Email:</span> {session.user?.email}</p>
              </div>
              <div>
                <p><span className="font-medium">Role:</span> {session.user?.role || 'Not specified'}</p>
                <p><span className="font-medium">Member Since:</span> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/mentors" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Search className="h-6 w-6 text-indigo-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Find a Mentor</h3>
                  <p className="text-sm text-gray-600">Browse available mentors</p>
                </div>
              </Link>
              <Link href="/sessions" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Calendar className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Schedule Session</h3>
                  <p className="text-sm text-gray-600">Book your next session</p>
                </div>
              </Link>
              <Link href="/messages" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <MessageCircle className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Messages</h3>
                  <p className="text-sm text-gray-600">Check your inbox</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}