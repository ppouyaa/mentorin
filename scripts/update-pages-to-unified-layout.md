# Unified Layout Implementation Guide

## Overview
We've successfully created a unified header and layout system for the mentorship platform. The new system provides:

1. **Consistent Navigation**: Role-based navigation that adapts for mentors and mentees
2. **Unified Headers**: Consistent page titles, subtitles, and breadcrumbs
3. **Responsive Design**: Mobile-friendly navigation with collapsible menu
4. **User Profile Integration**: Avatar, notifications, and user menu

## Components Created

### 1. Header Component (`apps/web/src/components/layout/header.tsx`)
- Role-based navigation (mentor/mentee specific menu items)
- Dynamic page titles and subtitles
- Breadcrumb navigation
- User profile dropdown
- Mobile-responsive design

### 2. App Layout Component (`apps/web/src/components/layout/app-layout.tsx`)
- Wraps all authenticated pages
- Handles authentication checks
- Provides consistent layout structure

## Pages Updated

✅ **Completed:**
- Dashboard (`apps/web/src/app/dashboard/page.tsx`)
- Mentors (`apps/web/src/app/mentors/page.tsx`)
- Bookings (`apps/web/src/app/bookings/page.tsx`)
- Chat (`apps/web/src/app/chat/page.tsx`)
- Profile (`apps/web/src/app/profile/page.tsx`)
- Offerings (`apps/web/src/app/offerings/page.tsx`)

## Remaining Pages to Update

### 1. Reviews Page (`apps/web/src/app/reviews/page.tsx`)
```typescript
// Add import
import AppLayout from '@/components/layout/app-layout';

// Replace return statement
return (
  <AppLayout>
    {/* existing content */}
  </AppLayout>
);
```

### 2. Settings Page (`apps/web/src/app/settings/page.tsx`)
```typescript
// Add import
import AppLayout from '@/components/layout/app-layout';

// Replace return statement
return (
  <AppLayout>
    {/* existing content */}
  </AppLayout>
);
```

### 3. Notifications Page (`apps/web/src/app/notifications/page.tsx`)
```typescript
// Add import
import AppLayout from '@/components/layout/app-layout';

// Replace return statement
return (
  <AppLayout>
    {/* existing content */}
  </AppLayout>
);
```

### 4. Payments Page (`apps/web/src/app/payments/page.tsx`)
```typescript
// Add import
import AppLayout from '@/components/layout/app-layout';

// Replace return statement
return (
  <AppLayout>
    {/* existing content */}
  </AppLayout>
);
```

## Key Changes Made

### 1. Remove Old Navigation
- Remove custom navigation bars
- Remove authentication checks (handled by AppLayout)
- Remove page titles (handled by Header)

### 2. Update Imports
- Replace `@/components/ui/*` with `@mentorship/ui`
- Add `AppLayout` import

### 3. Wrap Content
- Wrap main content with `<AppLayout>`
- Remove container divs (handled by AppLayout)

### 4. Update Loading States
- Simplify loading states (remove full-screen wrappers)
- Use consistent loading patterns

## Benefits

1. **Consistency**: All pages now have the same navigation and header structure
2. **Maintainability**: Single source of truth for navigation and layout
3. **User Experience**: Role-based navigation that adapts to user type
4. **Mobile Responsive**: Consistent mobile experience across all pages
5. **Accessibility**: Proper ARIA labels and semantic HTML

## Role-Based Navigation

### For Mentors:
- Dashboard
- My Mentees
- Bookings
- Chat
- My Offerings
- Reviews
- Notifications
- Settings

### For Mentees:
- Dashboard
- Find Mentors
- Bookings
- Chat
- Offerings
- Reviews
- Notifications
- Settings

## Page Titles and Subtitles

The header automatically provides appropriate titles and subtitles based on the current page and user role:

- **Dashboard**: "Dashboard" + role-specific subtitle
- **Mentors**: "Find Mentors" + "Discover experienced mentors in your field"
- **Bookings**: "Bookings" + role-specific subtitle
- **Chat**: "Messages" + "Connect with your mentors and mentees"
- **Profile**: "Profile" + "Manage your account and preferences"
- **Settings**: "Settings" + "Customize your account settings"

This unified system ensures a consistent and professional user experience across the entire platform.
