import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { QueryDashboardDto } from './dto/query-dashboard.dto';

@ApiTags('Dashboard Analytics')
@ApiBearerAuth()
@SkipThrottle()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get overall financial summary (Total Income, Expense, Balance)' })
  @Get('summary')
  async getSummary(@CurrentUser() user: any, @Query() query: QueryDashboardDto) {
    return this.dashboardService.getSummary(user.organizationId, query);
  }

  @Get('categories')
  async getCategoryBreakdown(@CurrentUser() user: any, @Query() query: QueryDashboardDto) {
    return this.dashboardService.getCategoryBreakdown(user.organizationId, query);
  }

  @Get('trends')
  async getMonthlyTrends(@CurrentUser() user: any, @Query() query: QueryDashboardDto) {
    return this.dashboardService.getMonthlyTrends(user.organizationId, query);
  }

  @ApiOperation({ summary: 'Get unified dashboard dataset (Summary + Categories + Trends) in a single request' })
  @Get('all')
  async getDashboardData(@CurrentUser() user: any, @Query() query: QueryDashboardDto) {
    return this.dashboardService.getDashboardData(user.organizationId, query);
  }
}


