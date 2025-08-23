import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from '../auth/dto';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalSessions: { type: 'number' },
        activeConnections: { type: 'number' },
        totalHours: { type: 'number' },
        averageRating: { type: 'number' },
        role: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@CurrentUser() user: UserResponseDto) {
    return this.dashboardService.getDashboardStats(user.id);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recent activity retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          title: { type: 'string' },
          date: { type: 'string' },
          status: { type: 'string' },
          with: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRecentActivity(@CurrentUser() user: UserResponseDto) {
    return this.dashboardService.getRecentActivity(user.id);
  }
}
