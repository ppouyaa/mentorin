import { z } from 'zod';

// Booking status
export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled',
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

// Offering types
export const OfferingType = {
  ONE_ON_ONE: 'one_on_one',
  GROUP: 'group',
  COHORT: 'cohort',
  OFFICE_HOURS: 'office_hours',
} as const;

export type OfferingType = typeof OfferingType[keyof typeof OfferingType];

// Offering interface
export interface Offering {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  type: OfferingType;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  isGroup: boolean;
  maxParticipants?: number;
  tags: string[];
  skills: number[]; // skill IDs
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Booking interface
export interface Booking {
  id: string;
  offeringId?: string;
  mentorId: string;
  menteeId: string;
  startsAt: Date;
  endsAt: Date;
  status: BookingStatus;
  priceCents: number;
  currency: string;
  meetingUrl?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Availability slots
export interface AvailabilitySlot {
  id: string;
  mentorId: string;
  weekday: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  bufferMinutes: number;
  isActive: boolean;
}

// Booking request
export interface BookingRequest {
  offeringId: string;
  menteeId: string;
  startsAt: Date;
  notes?: string;
}

// Booking update
export interface BookingUpdate {
  status?: BookingStatus;
  startsAt?: Date;
  endsAt?: Date;
  notes?: string;
  cancellationReason?: string;
}

// Zod schemas
export const BookingStatusSchema = z.enum([
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.CANCELLED,
  BookingStatus.COMPLETED,
  BookingStatus.NO_SHOW,
  BookingStatus.RESCHEDULED,
]);

export const OfferingTypeSchema = z.enum([
  OfferingType.ONE_ON_ONE,
  OfferingType.GROUP,
  OfferingType.COHORT,
  OfferingType.OFFICE_HOURS,
]);

export const OfferingSchema = z.object({
  id: z.string().uuid(),
  mentorId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  type: OfferingTypeSchema,
  durationMinutes: z.number().min(15).max(480), // 15 min to 8 hours
  priceCents: z.number().min(0),
  currency: z.string().length(3),
  isGroup: z.boolean(),
  maxParticipants: z.number().min(2).max(50).optional(),
  tags: z.array(z.string()),
  skills: z.array(z.number()),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const BookingSchema = z.object({
  id: z.string().uuid(),
  offeringId: z.string().uuid().optional(),
  mentorId: z.string().uuid(),
  menteeId: z.string().uuid(),
  startsAt: z.date(),
  endsAt: z.date(),
  status: BookingStatusSchema,
  priceCents: z.number().min(0),
  currency: z.string().length(3),
  meetingUrl: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
  cancellationReason: z.string().max(500).optional(),
  cancelledBy: z.string().uuid().optional(),
  cancelledAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AvailabilitySlotSchema = z.object({
  id: z.string().uuid(),
  mentorId: z.string().uuid(),
  weekday: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  bufferMinutes: z.number().min(0).max(60),
  isActive: z.boolean(),
});

export const BookingRequestSchema = z.object({
  offeringId: z.string().uuid(),
  menteeId: z.string().uuid(),
  startsAt: z.date(),
  notes: z.string().max(1000).optional(),
});

export const BookingUpdateSchema = z.object({
  status: BookingStatusSchema.optional(),
  startsAt: z.date().optional(),
  endsAt: z.date().optional(),
  notes: z.string().max(1000).optional(),
  cancellationReason: z.string().max(500).optional(),
});