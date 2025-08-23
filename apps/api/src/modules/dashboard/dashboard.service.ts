import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DashboardService {
  private prisma: PrismaClient;

  constructor(private readonly configService: ConfigService) {
    this.prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async getDashboardStats(userId: string) {
    try {
      // Get user's role
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isMentor = user.role === 'mentor';

      // Get real statistics based on user role
      const [
        totalSessions,
        activeConnections,
        totalHours,
        averageRating
      ] = await Promise.all([
        // Total sessions (bookings)
        this.prisma.booking.count({
          where: isMentor 
            ? { mentorId: userId }
            : { menteeId: userId }
        }),

        // Active connections (unique mentors/mentees)
        isMentor 
          ? this.prisma.booking.findMany({
              where: { mentorId: userId },
              select: { menteeId: true },
              distinct: ['menteeId']
            }).then(bookings => bookings.length)
          : this.prisma.booking.findMany({
              where: { menteeId: userId },
              select: { mentorId: true },
              distinct: ['mentorId']
            }).then(bookings => bookings.length),

        // Total hours (sum of session durations)
        this.prisma.booking.aggregate({
          where: isMentor 
            ? { mentorId: userId }
            : { menteeId: userId },
          _sum: { durationMinutes: true }
        }).then(result => (result._sum.durationMinutes || 0) / 60), // Convert minutes to hours

        // Average rating
        this.prisma.review.aggregate({
          where: isMentor 
            ? { rateeId: userId }
            : { raterId: userId },
          _avg: { rating: true }
        }).then(result => result._avg.rating || 0)
      ]);

      return {
        totalSessions,
        activeConnections,
        totalHours,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        role: user.role
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      // Return zero values if there's an error
      return {
        totalSessions: 0,
        activeConnections: 0,
        totalHours: 0,
        averageRating: 0,
        role: 'mentee'
      };
    }
  }

  async getRecentActivity(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) return [];

      const isMentor = user.role === 'mentor';

      // Get recent bookings
      const recentBookings = await this.prisma.booking.findMany({
        where: isMentor 
          ? { mentorId: userId }
          : { menteeId: userId },
        include: {
          offering: {
            include: {
              mentor: {
                include: {
                  profile: true
                }
              }
            }
          },
          mentee: {
            include: {
              profile: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      return recentBookings.map(booking => ({
        id: booking.id,
        type: 'session',
        title: booking.offering.title,
        date: booking.scheduledAt,
        status: booking.status,
        with: isMentor 
          ? booking.mentee.profile?.displayName || booking.mentee.email
          : booking.offering.mentor.profile?.displayName || booking.offering.mentor.email
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }
}
