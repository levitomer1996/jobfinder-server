import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'tomer',
    });
  }

  async validate(payload: any) {
    return {
      _id: payload.sub, // ✅ now controller sees _id
      email: payload.email,
      role: payload.role,
      name: payload.name,
      profileImageUrl: payload.profileImageUrl,
      company: payload.company,
    };
  }
}
