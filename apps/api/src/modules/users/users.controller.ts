import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('mentors')
  @ApiOperation({ summary: 'Find mentors with filters' })
  @ApiResponse({ 
    status: 200, 
    description: 'Mentors retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        mentors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              profile: {
                type: 'object',
                properties: {
                  displayName: { type: 'string' },
                  avatarUrl: { type: 'string' },
                  bio: { type: 'string' },
                  languages: { type: 'array', items: { type: 'string' } },
                  country: { type: 'string' },
                  city: { type: 'string' },
                },
              },
              mentorProfile: {
                type: 'object',
                properties: {
                  headline: { type: 'string' },
                  hourlyRate: { type: 'number' },
                  experienceYears: { type: 'number' },
                  specializations: { type: 'array', items: { type: 'string' } },
                  rating: { type: 'number' },
                  totalSessions: { type: 'number' },
                  totalReviews: { type: 'number' },
                  responseTimeHours: { type: 'number' },
                },
              },
              skills: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    category: { type: 'string' },
                    level: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        total: { type: 'number' },
        hasMore: { type: 'boolean' },
      },
    }
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name, headline, or specializations' })
  @ApiQuery({ name: 'skills', required: false, description: 'Comma-separated list of skills' })
  @ApiQuery({ name: 'maxRate', required: false, description: 'Maximum hourly rate in dollars' })
  @ApiQuery({ name: 'experienceYears', required: false, description: 'Minimum years of experience' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of results to skip (default: 0)' })
  async findMentors(
    @Query('search') search?: string,
    @Query('skills') skills?: string,
    @Query('maxRate') maxRate?: string,
    @Query('experienceYears') experienceYears?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const query: any = {};
    
    if (search) query.search = search;
    if (skills) query.skills = skills.split(',').map(s => s.trim());
    if (maxRate) query.maxRate = parseFloat(maxRate);
    if (experienceYears) query.experienceYears = parseInt(experienceYears);
    if (limit) query.limit = parseInt(limit);
    if (offset) query.offset = parseInt(offset);

    return this.usersService.findMentors(query);
  }

  @Public()
  @Get('mentors/:id')
  @ApiOperation({ summary: 'Get mentor by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Mentor retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        profile: {
          type: 'object',
          properties: {
            displayName: { type: 'string' },
            avatarUrl: { type: 'string' },
            bio: { type: 'string' },
            languages: { type: 'array', items: { type: 'string' } },
            country: { type: 'string' },
            city: { type: 'string' },
            website: { type: 'string' },
            socialLinks: { type: 'object' },
          },
        },
        mentorProfile: {
          type: 'object',
          properties: {
            headline: { type: 'string' },
            hourlyRate: { type: 'number' },
            experienceYears: { type: 'number' },
            specializations: { type: 'array', items: { type: 'string' } },
            rating: { type: 'number' },
            totalSessions: { type: 'number' },
            totalReviews: { type: 'number' },
            responseTimeHours: { type: 'number' },
            education: { type: 'object' },
            certifications: { type: 'object' },
            achievements: { type: 'object' },
            availability: { type: 'object' },
          },
        },
        skills: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              category: { type: 'string' },
              level: { type: 'string' },
            },
          },
        },
        offerings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              type: { type: 'string' },
              durationMinutes: { type: 'number' },
              price: { type: 'number' },
              currency: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        reviews: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              rating: { type: 'number' },
              comment: { type: 'string' },
              createdAt: { type: 'string' },
              rater: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  displayName: { type: 'string' },
                  avatarUrl: { type: 'string' },
                },
              },
            },
          },
        },
      },
    }
  })
  @ApiResponse({ status: 404, description: 'Mentor not found' })
  async getMentorById(@Param('id') id: string) {
    const mentor = await this.usersService.getMentorById(id);
    if (!mentor) {
      return { error: 'Mentor not found' };
    }
    return mentor;
  }

  @Public()
  @Get('skills')
  @ApiOperation({ summary: 'Get all available skills' })
  @ApiResponse({ 
    status: 200, 
    description: 'Skills retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
        },
      },
    }
  })
  async getSkills() {
    return this.usersService.getSkills();
  }
}
