'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
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
  Search,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { Button, Badge } from '@mentorship/ui';
import { Avatar, AvatarImage, AvatarFallback } from '@mentorship/ui';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBreadcrumbs?: boolean;
}

export default function Header({ title, subtitle, showBreadcrumbs = true }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const userRole = session?.user?.role || 'mentee';
  const isMentor = userRole === 'mentor';

  // Navigation items based on user role
  const navigationItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home, 
      current: pathname === '/dashboard',
      roles: ['mentor', 'mentee']
    },
    { 
      name: isMentor ? 'My Mentees' : 'Find Mentors', 
      href: isMentor ? '/mentees' : '/mentors', 
      icon: Users, 
      current: pathname === (isMentor ? '/mentees' : '/mentors'),
      roles: ['mentor', 'mentee']
    },
    { 
      name: 'Bookings', 
      href: '/bookings', 
      icon: Calendar, 
      current: pathname === '/bookings',
      roles: ['mentor', 'mentee']
    },
    { 
      name: 'Chat', 
      href: '/chat', 
      icon: MessageCircle, 
      current: pathname === '/chat',
      roles: ['mentor', 'mentee']
    },
    { 
      name: isMentor ? 'My Offerings' : 'Offerings', 
      href: '/offerings', 
      icon: BookOpen, 
      current: pathname === '/offerings',
      roles: ['mentor', 'mentee']
    },
    { 
      name: 'Reviews', 
      href: '/reviews', 
      icon: Star, 
      current: pathname === '/reviews',
      roles: ['mentor', 'mentee']
    },
    { 
      name: 'Notifications', 
      href: '/notifications', 
      icon: Bell, 
      current: pathname === '/notifications',
      roles: ['mentor', 'mentee']
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings, 
      current: pathname === '/settings',
      roles: ['mentor', 'mentee']
    },
  ].filter(item => item.roles.includes(userRole));

  // Page titles and breadcrumbs
  const getPageInfo = () => {
    const pageMap: Record<string, { title: string; subtitle?: string; breadcrumbs?: string[] }> = {
      '/dashboard': {
        title: 'Dashboard',
        subtitle: isMentor ? 'Manage your mentorship sessions' : 'Track your learning journey',
        breadcrumbs: ['Dashboard']
      },
      '/mentors': {
        title: 'Find Mentors',
        subtitle: 'Discover experienced mentors in your field',
        breadcrumbs: ['Mentors']
      },
      '/mentees': {
        title: 'My Mentees',
        subtitle: 'Manage your mentee relationships',
        breadcrumbs: ['Mentees']
      },
      '/bookings': {
        title: 'Bookings',
        subtitle: isMentor ? 'Manage your scheduled sessions' : 'View your upcoming sessions',
        breadcrumbs: ['Bookings']
      },
      '/chat': {
        title: 'Messages',
        subtitle: 'Connect with your mentors and mentees',
        breadcrumbs: ['Chat']
      },
      '/offerings': {
        title: isMentor ? 'My Offerings' : 'Offerings',
        subtitle: isMentor ? 'Manage your mentorship offerings' : 'Browse available mentorship sessions',
        breadcrumbs: ['Offerings']
      },
      '/reviews': {
        title: 'Reviews',
        subtitle: isMentor ? 'View feedback from your mentees' : 'Read reviews from other mentees',
        breadcrumbs: ['Reviews']
      },
      '/notifications': {
        title: 'Notifications',
        subtitle: 'Stay updated with important updates',
        breadcrumbs: ['Notifications']
      },
      '/profile': {
        title: 'Profile',
        subtitle: 'Manage your account and preferences',
        breadcrumbs: ['Profile']
      },
      '/settings': {
        title: 'Settings',
        subtitle: 'Customize your account settings',
        breadcrumbs: ['Settings']
      },
      '/payments': {
        title: 'Payments',
        subtitle: 'Manage your payment methods and transactions',
        breadcrumbs: ['Payments']
      }
    };

    return pageMap[pathname] || {
      title: title || 'Page',
      subtitle: subtitle,
      breadcrumbs: showBreadcrumbs ? ['Page'] : undefined
    };
  };

  const pageInfo = getPageInfo();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  if (!session) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar with logo and user menu */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            
            <Link href="/dashboard" className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-indigo-600">Mentorin</h1>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link
              href="/notifications"
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md relative"
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                3
              </Badge>
            </Link>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user?.image || '/default-avatar.png'}
                    alt={session.user?.name || 'User'}
                  />
                  <AvatarFallback>
                    {session.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {session.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {userRole}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page header with title and breadcrumbs */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {showBreadcrumbs && pageInfo.breadcrumbs && (
            <nav className="flex mb-2" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {pageInfo.breadcrumbs.map((crumb, index) => (
                  <li key={crumb} className="flex items-center">
                    {index > 0 && (
                      <span className="mx-2 text-gray-400">/</span>
                    )}
                    <span className="text-sm text-gray-500 capitalize">
                      {crumb}
                    </span>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {pageInfo.title}
            </h1>
            {pageInfo.subtitle && (
              <p className="mt-1 text-sm text-gray-600">
                {pageInfo.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    item.current
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
