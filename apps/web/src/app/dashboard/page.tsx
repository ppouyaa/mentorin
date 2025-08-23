'use client';

import { useState } from 'react';
import { Button } from '@mentorship/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mentorship/ui';
import { 
  Calendar, 
  MessageCircle, 
  Video, 
  Users, 
  TrendingUp, 
  Clock,
  Star,
  DollarSign,
  BookOpen,
  Target
} from 'lucide-react';

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<'mentor' | 'mentee'>('mentee');

  const upcomingSessions = [
    {
      id: '1',
      title: 'React Advanced Patterns',
      mentor: 'Sarah Johnson',
      date: '2024-01-15T10:00:00Z',
      duration: 60,
      type: 'one_on_one',
    },
    {
      id: '2',
      title: 'TypeScript Best Practices',
      mentor: 'Mike Chen',
      date: '2024-01-17T14:00:00Z',
      duration: 45,
      type: 'group',
    },
  ];

  const stats = userRole === 'mentor' 
    ? [
        { label: 'Total Sessions', value: '127', icon: Video, color: 'text-blue-600' },
        { label: 'Active Mentees', value: '8', icon: Users, color: 'text-green-600' },
        { label: 'Average Rating', value: '4.9', icon: Star, color: 'text-yellow-600' },
        { label: 'Monthly Earnings', value: '$2,450', icon: DollarSign, color: 'text-purple-600' },
      ]
    : [
        { label: 'Sessions Completed', value: '23', icon: BookOpen, color: 'text-blue-600' },
        { label: 'Skills Learned', value: '12', icon: Target, color: 'text-green-600' },
        { label: 'Hours Spent', value: '34', icon: Clock, color: 'text-yellow-600' },
        { label: 'Goals Achieved', value: '7', icon: TrendingUp, color: 'text-purple-600' },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userRole === 'mentor' ? 'Sarah' : 'Ali'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your mentorship journey
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={userRole === 'mentee' ? 'default' : 'outline'}
              onClick={() => setUserRole('mentee')}
            >
              Mentee View
            </Button>
            <Button
              variant={userRole === 'mentor' ? 'default' : 'outline'}
              onClick={() => setUserRole('mentor')}
            >
              Mentor View
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Sessions
                </CardTitle>
                <CardDescription>
                  Your next {userRole === 'mentor' ? 'mentoring' : 'learning'} sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming sessions</p>
                    <Button className="mt-4">
                      {userRole === 'mentor' ? 'Create Offering' : 'Find a Mentor'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-mentor-100 rounded-full">
                            <Video className="h-4 w-4 text-mentor-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{session.title}</h3>
                            <p className="text-sm text-gray-600">
                              with {session.mentor} • {new Date(session.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{session.duration}m</span>
                          <Button size="sm" variant="outline">
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  View Messages
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  {userRole === 'mentor' ? 'View Mentees' : 'Find Mentors'}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Resources
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Session completed with Mike Chen</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>New message from Sarah Johnson</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Goal milestone achieved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}