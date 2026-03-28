import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './types/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {
    const secret = config.get<string>('jwt.accessSecret');
    if (!secret) {
      throw new Error('JWT access secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    // This becomes req.user
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
    };
  }
}
