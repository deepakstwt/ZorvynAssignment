import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
    
    try {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        let organizationId: Types.ObjectId;
        let inviteCode: string;
        let role: UserRole;

        if (registerDto.inviteCode) {
            // SECURITY: Enforcing role assignment strictly from invite context
            // Blocking any attempt to assign ADMIN role during invite-based signup
            if (registerDto.role === UserRole.ADMIN) {
                throw new ForbiddenException('Admin role cannot be assigned via invite link to prevent privilege escalation.');
            }

            const organizer = await this.usersService.findByInviteCode(registerDto.inviteCode);
            if (!organizer) {
                throw new BadRequestException('Invalid invite code. Please check with your team admin.');
            }

            // Using role from invite link (query param) - Defaulting to VIEWER if not provided
            organizationId = organizer.organizationId;
            inviteCode = organizer.inviteCode; // Inherit organization's invite code
            role = (registerDto.role as UserRole) || UserRole.VIEWER;
        } else {
            // COMPLIANCE: Only Admin role can start a new organization
            if (registerDto.role && registerDto.role !== UserRole.ADMIN) {
                throw new BadRequestException('Viewer and Analyst roles require a Team Invite Code to join an existing organization.');
            }

            // New Organization - This user is the Admin/Owner
            organizationId = new Types.ObjectId();
            inviteCode = `CASHFLOWOS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            role = UserRole.ADMIN; 
        }

        const newUser = await this.usersService.create({
            name: registerDto.name,
            email: registerDto.email,
            password: hashedPassword,
            role: role as UserRole,
            organizationId,
            inviteCode,
        });

        return { 
          message: 'User registered successfully', 
          userId: newUser._id,
          inviteCode: newUser.inviteCode,
          organizationId: newUser.organizationId
        };
    } catch (error: any) {
        if (error instanceof BadRequestException || error instanceof ForbiddenException) throw error;
        if (error.name === 'ValidationError' || error.code === 11000) {
            throw new BadRequestException(error.message || 'Validation failed');
        }
        throw new InternalServerErrorException('Error registering user');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Ensure the ID is a string for JWT signing - this prevents 500 errors
    const token = this.jwtService.sign({ 
      userId: user._id.toString(), 
      organizationId: user.organizationId.toString(),
      inviteCode: user.inviteCode,
      name: user.name,
      role: user.role 
    });

    return { 
      access_token: token, 
      user: { 
        id: user._id.toString(), 
        name: user.name, 
        email: user.email, 
        role: user.role,
        inviteCode: user.inviteCode
      } 
    };
  }
}


