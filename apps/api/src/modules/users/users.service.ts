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
    experienceYears?: number;
    limit?: number;
    offset?: number;
  }) {
    const {
      search,
      skills,
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

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        mentorProfile: true,
        matchPreferences: true,
      },
    });

    if (!user || !user.profile) {
      return null;
    }

    const socialLinks = user.profile.socialLinks as any;
    const mentorEducation = user.mentorProfile?.education as any;
    const mentorAvailability = user.mentorProfile?.availability as any;
    const menteeAvailability = user.matchPreferences?.availability as any;

    return {
      id: user.id,
      displayName: user.profile.displayName,
      bio: user.profile.bio,
      location: user.profile.city,
      timezone: user.profile.timezone,
      avatarUrl: user.profile.avatarUrl,
      website: user.profile.website,
      linkedin: socialLinks?.linkedin,
      github: socialLinks?.github,
      role: user.role,
      isPublic: user.mentorProfile?.isPublic || false,
      // Mentor-specific fields
      expertise: user.mentorProfile?.specializations || [],
      experience: user.mentorProfile?.experienceYears,
      education: mentorEducation?.degree,
      availability: mentorAvailability?.times || [],
      languages: user.profile.languages || [],
      // Mentee-specific fields (stored in matchPreferences)
      goals: user.matchPreferences?.goals || [],
      currentRole: menteeAvailability?.currentRole,
      skills: menteeAvailability?.skillsToDevelop || [],
      preferredMentoringStyle: menteeAvailability?.preferredMentoringStyle,
      budget: user.matchPreferences?.budgetCents ? 
        (user.matchPreferences.budgetCents <= 5000 ? 'low' : 
         user.matchPreferences.budgetCents <= 10000 ? 'medium' : 'high') : 'flexible',
      timeCommitment: menteeAvailability?.timeCommitment,
    };
  }

  async createProfile(userId: string, profileData: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.profile) {
      throw new Error('Profile already exists');
    }

    const { role, ...profileFields } = profileData;

    // Create base profile
    const profile = await this.prisma.profile.create({
      data: {
        userId,
        displayName: profileFields.displayName,
        bio: profileFields.bio,
        city: profileFields.location,
        timezone: profileFields.timezone,
        avatarUrl: profileFields.avatarUrl,
        website: profileFields.website,
        socialLinks: {
          linkedin: profileFields.linkedin,
          github: profileFields.github,
        },
        languages: profileFields.languages || [],
      },
    });

    // Create role-specific profile
    if (role === 'mentor') {
      await this.prisma.mentorProfile.create({
        data: {
          userId,
          headline: profileFields.bio,
          hourlyRateCents: 0, // Default to 0 since we're removing hourly rate
          experienceYears: profileFields.experience,
          specializations: profileFields.expertise,
          education: {
            degree: profileFields.education,
            institution: '',
            year: new Date().getFullYear(),
          },
          availability: {
            times: profileFields.availability,
          },
          isPublic: false, // Default to private
        },
      });
    } else if (role === 'mentee') {
      // For mentees, store preferences in MatchPreferences
      await this.prisma.matchPreferences.create({
        data: {
          userId,
          goals: profileFields.goals,
          preferredLanguages: profileFields.languages || [],
          budgetCents: profileFields.budget === 'low' ? 5000 : 
                       profileFields.budget === 'medium' ? 10000 : 
                       profileFields.budget === 'high' ? 20000 : null,
          availability: {
            times: profileFields.availability,
            timeCommitment: profileFields.timeCommitment,
            preferredMentoringStyle: profileFields.preferredMentoringStyle,
            currentRole: profileFields.currentRole,
            skillsToDevelop: profileFields.skills,
          },
        },
      });
    }

    return this.getProfile(userId);
  }

  async updateProfile(userId: string, profileData: any) {
    // Debug: Log the received data
    console.log('Backend received profile data:', profileData);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        profile: true,
        mentorProfile: true,
        matchPreferences: true,
      },
    });

    if (!user || !user.profile) {
      throw new Error('Profile not found');
    }

    // Update base profile
    await this.prisma.profile.update({
      where: { userId },
      data: {
        displayName: profileData.displayName,
        bio: profileData.bio,
        city: profileData.location,
        website: profileData.website,
        socialLinks: {
          linkedin: profileData.linkedin,
          github: profileData.github,
        },
        languages: profileData.languages || user.profile.languages,
      },
    });

    // Update role-specific profile
    if (user.role === 'mentor') {
      if (user.mentorProfile) {
        await this.prisma.mentorProfile.update({
          where: { userId },
          data: {
            headline: profileData.bio,
            hourlyRateCents: 0, // Default to 0 since we're removing hourly rate
            experienceYears: profileData.experience,
            specializations: profileData.expertise,
            education: {
              degree: profileData.education,
              institution: '',
              year: new Date().getFullYear(),
            },
            availability: {
              times: profileData.availability,
            },
            // Don't change isPublic status here - only when explicitly requested
          },
        });
      } else {
        // Create mentor profile if it doesn't exist
        await this.prisma.mentorProfile.create({
          data: {
            userId,
            headline: profileData.bio,
            hourlyRateCents: 0, // Default to 0 since we're removing hourly rate
            experienceYears: profileData.experience,
            specializations: profileData.expertise,
            education: {
              degree: profileData.education,
              institution: '',
              year: new Date().getFullYear(),
            },
            availability: {
              times: profileData.availability,
            },
            isPublic: false,
          },
        });
      }
    } else if (user.role === 'mentee') {
      if (user.matchPreferences) {
        await this.prisma.matchPreferences.update({
          where: { userId },
          data: {
            goals: profileData.goals,
            preferredLanguages: profileData.languages || [],
            budgetCents: profileData.budget === 'low' ? 5000 : 
                         profileData.budget === 'medium' ? 10000 : 
                         profileData.budget === 'high' ? 20000 : null,
            availability: {
              times: profileData.availability,
              timeCommitment: profileData.timeCommitment,
              preferredMentoringStyle: profileData.preferredMentoringStyle,
              currentRole: profileData.currentRole,
              skillsToDevelop: profileData.skills,
            },
          },
        });
      } else {
        // Create match preferences if they don't exist
        await this.prisma.matchPreferences.create({
          data: {
            userId,
            goals: profileData.goals,
            preferredLanguages: profileData.languages || [],
            budgetCents: profileData.budget === 'low' ? 5000 : 
                         profileData.budget === 'medium' ? 10000 : 
                         profileData.budget === 'high' ? 20000 : null,
            availability: {
              times: profileData.availability,
              timeCommitment: profileData.timeCommitment,
              preferredMentoringStyle: profileData.preferredMentoringStyle,
              currentRole: profileData.currentRole,
              skillsToDevelop: profileData.skills,
            },
          },
        });
      }
    }

    return this.getProfile(userId);
  }

  async makeProfilePublic(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { mentorProfile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'mentor') {
      throw new Error('Only mentors can make their profile public');
    }

    if (!user.mentorProfile) {
      throw new Error('Mentor profile not found');
    }

    await this.prisma.mentorProfile.update({
      where: { userId },
      data: {
        isPublic: true,
      },
    });

    return { message: 'Profile made public successfully' };
  }
}
