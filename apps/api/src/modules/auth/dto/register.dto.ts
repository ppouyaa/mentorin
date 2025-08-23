import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  MENTEE = 'mentee',
  MENTOR = 'mentor',
}

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.MENTEE,
    default: UserRole.MENTEE,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.MENTEE;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2, { message: 'Display name must be at least 2 characters long' })
  displayName: string;

  @ApiProperty({
    description: 'User timezone',
    example: 'America/New_York',
    required: false,
  })
  @IsString()
  @IsOptional()
  timezone?: string = 'UTC';
}