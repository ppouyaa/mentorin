import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  avatarUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  lastLoginAt?: Date;
}

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty()
  expires_in: string;
}

export class RegisterResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
