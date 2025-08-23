import { z } from 'zod';

// User roles
export const UserRole = {
  MENTEE: 'mentee',
  MENTOR: 'mentor',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  FINANCE: 'finance',
  SUPPORT: 'support',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// User status
export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

// User interface
export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
}

// OAuth account
export interface OAuthAccount {
  id: string;
  userId: string;
  provider: 'google' | 'apple' | 'github' | 'linkedin';
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

// User preferences
export interface UserPreferences {
  userId: string;
  language: 'en' | 'fa';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'mentors_only';
    showEmail: boolean;
    showPhone: boolean;
  };
}

// Zod schemas
export const UserRoleSchema = z.enum([
  UserRole.MENTEE,
  UserRole.MENTOR,
  UserRole.ADMIN,
  UserRole.MODERATOR,
  UserRole.FINANCE,
  UserRole.SUPPORT,
]);

export const UserStatusSchema = z.enum([
  UserStatus.ACTIVE,
  UserStatus.INACTIVE,
  UserStatus.SUSPENDED,
  UserStatus.PENDING,
]);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
  emailVerified: z.boolean(),
  phoneVerified: z.boolean(),
});

export const OAuthAccountSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  provider: z.enum(['google', 'apple', 'github', 'linkedin']),
  providerAccountId: z.string(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
});

export const UserPreferencesSchema = z.object({
  userId: z.string().uuid(),
  language: z.enum(['en', 'fa']),
  timezone: z.string(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'mentors_only']),
    showEmail: z.boolean(),
    showPhone: z.boolean(),
  }),
});