import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
        const newUser = await this.usersService.create({
            name: registerDto.name,
            email: registerDto.email,
            password: hashedPassword,
            role: registerDto.role as UserRole,
        });

        return { message: 'User registered successfully', userId: newUser._id };
    } catch (error: any) {
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
      role: user.role 
    });

    return { 
      access_token: token, 
      user: { 
        id: user._id.toString(), 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    };
  }
}


