import { Controller, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from './schemas/user.schema';

@ApiTags('User Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users in organization (Admin Only)' })
  @ApiResponse({ status: 200, description: 'List of all users in the organization' })
  @Get()
  async getAllUsers(@CurrentUser() user: any) {
    return this.usersService.findAll(user.organizationId);
  }

  @ApiOperation({ summary: 'Update user role' })
  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(id, role);
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
