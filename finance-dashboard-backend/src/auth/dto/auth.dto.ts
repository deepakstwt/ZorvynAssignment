import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    description: 'The unique code provided by an administrator to join an existing organization.',
    example: 'CASHFLOWOS-88', 
    required: false 
  })
  @IsString()
  @IsOptional()
  inviteCode?: string;

  @ApiProperty({ 
    description: 'The role to join as (Analyst or Viewer). Note: ADMIN role cannot be assigned via invite link.',
    example: 'analyst', 
    required: false 
  })
  @IsString()
  @IsOptional()
  role?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
