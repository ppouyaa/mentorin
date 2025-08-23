import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { LoginDto, RegisterDto, UserResponseDto, LoginResponseDto, RegisterResponseDto } from './dto';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        profile: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    const access_token = this.jwtService.sign(payload);
    const expires_in = this.configService.get<string>('JWT_EXPIRES_IN', '7d');

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      displayName: user.profile?.displayName || user.email,
      avatarUrl: user.profile?.avatarUrl,
      createdAt: user.createdAt,
      lastLoginAt: new Date(),
    };

    return {
      access_token,
      user: userResponse,
      expires_in,
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // Create user with profile in a transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: registerDto.email,
          passwordHash,
          role: registerDto.role || 'mentee',
          status: 'active', // For testing - normally would be 'pending'
        },
      });

      await tx.profile.create({
        data: {
          userId: newUser.id,
          displayName: registerDto.displayName,
          timezone: registerDto.timezone || 'UTC',
        },
      });

      return newUser;
    });

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      displayName: registerDto.displayName,
      avatarUrl: null,
      createdAt: user.createdAt,
      lastLoginAt: null,
    };

    return {
      message: 'User registered successfully!',
      user: userResponse,
    };
  }

  async validateUser(userId: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user || user.status !== 'active') {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      displayName: user.profile?.displayName || user.email,
      avatarUrl: user.profile?.avatarUrl,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });
  }
}