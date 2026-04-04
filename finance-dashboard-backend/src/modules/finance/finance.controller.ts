import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import * as Express from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FinanceService } from './finance.service';
import { CreateTransactionDto, UpdateTransactionDto, QueryTransactionDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';

@ApiTags('Finance Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @ApiOperation({ summary: 'Create a new financial record (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Record successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires Admin' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTransaction(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    return this.financeService.createTransaction(user.userId, dto);
  }

  @ApiOperation({ summary: 'Get records or export to CSV (Admin/Analyst Only)' })
  @ApiQuery({ name: 'export', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns records or a CSV file' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  async getTransactions(
    @Query() query: QueryTransactionDto,
    @Query('export') exportFlag: string,
    @CurrentUser() user: any,
    @Res() res: Express.Response,
  ) {
    if (exportFlag === 'true') {
      const csv = await this.financeService.getTransactionsCsv(user.userId, query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=finance-records-${Date.now()}.csv`);
      return res.send(csv);
    }
    
    const result = await this.financeService.getTransactions(user.userId, query);
    return res.json(result);
  }

  @ApiOperation({ summary: 'Update an existing record (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Record successfully updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires Admin role' })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTransaction(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.financeService.updateTransaction(id, dto, user.userId);
  }

  @ApiOperation({ summary: 'Soft delete a record (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Record successfully marked as deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires Admin role' })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteTransaction(@CurrentUser() user: any, @Param('id') id: string) {
    return this.financeService.deleteTransaction(id, user.userId);
  }
}
