import { z } from 'zod';

// General user profile
export interface Profile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  languages: string[]; // ISO language codes
  timezone: string;
  country?: string;
  city?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  updatedAt: Date;
}

// Mentor-specific profile
export interface MentorProfile {
  userId: string;
  headline: string;
  hourlyRateCents: number;
  experienceYears: number;
  introVideoUrl?: string;
  isPublic: boolean;
  specializations: string[];
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    year: number;
    url?: string;
  }[];
  achievements?: {
    title: string;
    description: string;
    year: number;
  }[];
  availability: {
    weekdays: number[]; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    bufferMinutes: number;
  };
  responseTimeHours: number;
  rating: number;
  totalSessions: number;
  totalReviews: number;
}

// Skills and expertise
export interface Skill {
  id: number;
  slug: string;
  nameEn: string;
  nameFa: string;
  category: string;
  level: 1 | 2 | 3 | 4 | 5; // 1=Beginner, 5=Expert
}

export interface UserSkill {
  userId: string;
  skillId: number;
  level: number; // 1-5
  yearsOfExperience: number;
  isVerified: boolean;
}

// Zod schemas
export const ProfileSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  languages: z.array(z.string().length(2)), // ISO codes
  timezone: z.string(),
  country: z.string().optional(),
  city: z.string().optional(),
  website: z.string().url().optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
  }).optional(),
  updatedAt: z.date(),
});

export const MentorProfileSchema = z.object({
  userId: z.string().uuid(),
  headline: z.string().min(10).max(200),
  hourlyRateCents: z.number().min(0),
  experienceYears: z.number().min(0),
  introVideoUrl: z.string().url().optional(),
  isPublic: z.boolean(),
  specializations: z.array(z.string()),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number().min(1900).max(new Date().getFullYear()),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number().min(1900).max(new Date().getFullYear()),
    url: z.string().url().optional(),
  })).optional(),
  achievements: z.array(z.object({
    title: z.string(),
    description: z.string(),
    year: z.number().min(1900).max(new Date().getFullYear()),
  })).optional(),
  availability: z.object({
    weekdays: z.array(z.number().min(0).max(6)),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    bufferMinutes: z.number().min(0).max(60),
  }),
  responseTimeHours: z.number().min(0),
  rating: z.number().min(0).max(5),
  totalSessions: z.number().min(0),
  totalReviews: z.number().min(0),
});

export const SkillSchema = z.object({
  id: z.number(),
  slug: z.string(),
  nameEn: z.string(),
  nameFa: z.string(),
  category: z.string(),
  level: z.number().min(1).max(5),
});

export const UserSkillSchema = z.object({
  userId: z.string().uuid(),
  skillId: z.number(),
  level: z.number().min(1).max(5),
  yearsOfExperience: z.number().min(0),
  isVerified: z.boolean(),
});