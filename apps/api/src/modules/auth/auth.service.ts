import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(loginDto: { email: string; password: string }) {
    // TODO: Implement actual user lookup and password verification
    if (loginDto.email === 'test@example.com' && loginDto.password === 'password') {
      const payload = { email: loginDto.email, sub: 'user-id' };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: 'user-id',
          email: loginDto.email,
          role: 'mentee',
        },
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async register(registerDto: { email: string; password: string; role: string }) {
    // TODO: Implement actual user creation
    if (registerDto.email === 'test@example.com') {
      throw new BadRequestException('User already exists');
    }
    
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    
    return {
      message: 'User registered successfully',
      user: {
        id: 'new-user-id',
        email: registerDto.email,
        role: registerDto.role,
      },
    };
  }
}