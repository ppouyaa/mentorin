'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeConnections: 0,
    totalHours: 0,
    averageRating: 0,
    role: 'mentee'
  });
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetchDashboardStats();
      checkProfileStatus();
    }
  }, [session]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkProfileStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/users/profile`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        setProfileComplete(true);
      } else if (response.status === 404) {
        setProfileComplete(false);
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      setProfileComplete(false);
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statsData = [
    { 
      name: stats.role === 'mentor' ? 'Total Sessions Led' : 'Total Sessions', 
      value: stats.totalSessions.toString(), 
      change: '', 
      changeType: 'neutral' 
    },
    { 
      name: stats.role === 'mentor' ? 'Active Mentees' : 'Active Mentors', 
      value: stats.activeConnections.toString(), 
      change: '', 
      changeType: 'neutral' 
    },
    { 
      name: 'Total Hours', 
      value: stats.totalHours.toString(), 
      change: '', 
      changeType: 'neutral' 
    },
    { 
      name: 'Average Rating', 
      value: stats.averageRating > 0 ? stats.averageRating.toString() : 'N/A', 
      change: '', 
      changeType: 'neutral' 
    },
  ];

  return (
    <AppLayout>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              {stat.change && (
                <div className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
          {!profileComplete && (
            <a
              href="/profile/setup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Complete Profile
            </a>
          )}
        </div>
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
        {!profileComplete && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Profile Incomplete
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Complete your profile to start connecting with {session.user?.role === 'mentor' ? 'mentees' : 'mentors'} and unlock all platform features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {profileComplete && session.user?.role === 'mentor' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Mentor Profile Ready
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Your profile is complete! Make sure to set it as public so mentees can find you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/mentors" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <svg className="h-6 w-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900">Find a Mentor</h3>
              <p className="text-sm text-gray-600">Browse available mentors</p>
            </div>
          </a>
          <a href="/bookings" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <svg className="h-6 w-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900">Schedule Session</h3>
              <p className="text-sm text-gray-600">Book your next session</p>
            </div>
          </a>
          <a href="/chat" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900">Messages</h3>
              <p className="text-sm text-gray-600">Check your inbox</p>
            </div>
          </a>
        </div>
      </div>
    </AppLayout>
  );
}