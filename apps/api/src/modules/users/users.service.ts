import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UsersService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async findMentors(query?: {
    search?: string;
    skills?: string[];
    maxRate?: number;
    experienceYears?: number;
    limit?: number;
    offset?: number;
  }) {
    const {
      search,
      skills,
      maxRate,
      experienceYears,
      limit = 20,
      offset = 0
    } = query || {};

    const where: any = {
      role: 'mentor',
      status: 'active',
      mentorProfile: {
        isPublic: true,
      },
    };

    // Add search filter
    if (search) {
      where.OR = [
        {
          profile: {
            displayName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          mentorProfile: {
            headline: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          mentorProfile: {
            specializations: {
              hasSome: [search],
            },
          },
        },
      ];
    }

    // Add skills filter
    if (skills && skills.length > 0) {
      where.userSkills = {
        some: {
          skill: {
            name: {
              in: skills,
            },
          },
        },
      };
    }

    // Add max rate filter
    if (maxRate) {
      where.mentorProfile = {
        ...where.mentorProfile,
        hourlyRateCents: {
          lte: maxRate * 100, // Convert dollars to cents
        },
      };
    }

    // Add experience years filter
    if (experienceYears) {
      where.mentorProfile = {
        ...where.mentorProfile,
        experienceYears: {
          gte: experienceYears,
        },
      };
    }

    const [mentors, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          profile: {
            select: {
              displayName: true,
              avatarUrl: true,
              bio: true,
              languages: true,
              country: true,
              city: true,
            },
          },
          mentorProfile: {
            select: {
              headline: true,
              hourlyRateCents: true,
              experienceYears: true,
              specializations: true,
              rating: true,
              totalSessions: true,
              totalReviews: true,
              responseTimeHours: true,
            },
          },
          userSkills: {
            include: {
              skill: {
                select: {
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: [
          { mentorProfile: { rating: 'desc' } },
          { mentorProfile: { totalSessions: 'desc' } },
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      mentors: mentors.map(mentor => ({
        id: mentor.id,
        email: mentor.email,
        profile: mentor.profile,
        mentorProfile: mentor.mentorProfile ? {
          ...mentor.mentorProfile,
          hourlyRate: mentor.mentorProfile.hourlyRateCents / 100, // Convert cents to dollars
        } : null,
        skills: mentor.userSkills.map(us => ({
          name: us.skill.name,
          category: us.skill.category,
          level: us.level,
        })),
      })),
      total,
      hasMore: offset + limit < total,
    };
  }

  async getMentorById(id: string) {
    const mentor = await this.prisma.user.findUnique({
      where: {
        id,
        role: 'mentor',
        status: 'active',
      },
      include: {
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            bio: true,
            languages: true,
            country: true,
            city: true,
            website: true,
            socialLinks: true,
          },
        },
        mentorProfile: {
          select: {
            headline: true,
            hourlyRateCents: true,
            experienceYears: true,
            specializations: true,
            rating: true,
            totalSessions: true,
            totalReviews: true,
            responseTimeHours: true,
            education: true,
            certifications: true,
            achievements: true,
            availability: true,
          },
        },
        userSkills: {
          include: {
            skill: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
        offerings: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            durationMinutes: true,
            priceCents: true,
            currency: true,
            tags: true,
          },
        },
        receivedReviews: {
          include: {
            rater: {
              include: {
                profile: {
                  select: {
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!mentor) {
      return null;
    }

    return {
      id: mentor.id,
      email: mentor.email,
      profile: mentor.profile,
      mentorProfile: mentor.mentorProfile ? {
        ...mentor.mentorProfile,
        hourlyRate: mentor.mentorProfile.hourlyRateCents / 100,
      } : null,
      skills: mentor.userSkills.map(us => ({
        name: us.skill.name,
        category: us.skill.category,
        level: us.level,
      })),
      offerings: mentor.offerings.map(offering => ({
        ...offering,
        price: offering.priceCents / 100,
      })),
      reviews: mentor.receivedReviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        rater: {
          id: review.rater.id,
          displayName: review.rater.profile?.displayName,
          avatarUrl: review.rater.profile?.avatarUrl,
        },
      })),
    };
  }

  async getSkills() {
    return this.prisma.skill.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }
}
