import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './types/jwt-payload';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private async hashPassword(password: string) {
    // bcrypt max input length is 72 bytes; DTO enforces <=72 chars.
    const rounds = 12;
    return bcrypt.hash(password, rounds);
  }

  async register(params: { email: string; password: string; fullName: string }) {
    const email = params.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) throw new ConflictException('Email is already registered');

    const passwordHash = await this.hashPassword(params.password);
    const user = await this.users.create({
      email,
      passwordHash,
      fullName: params.fullName.trim(),
    });

    const tokens = await this.issueTokens(user.id);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(params: { email: string; password: string }) {
    const email = params.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(params.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async issueTokens(userId: string) {
    const user = await this.users.findById(userId);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid user');

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const expiresIn = this.config.get<string>('jwt.accessExpiresIn', '15m') as StringValue;

    const accessToken = await this.jwt.signAsync(payload, { expiresIn });
    return { accessToken, tokenType: 'Bearer' as const, expiresIn };
  }

  sanitizeUser(user: { passwordHash: string } & Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

