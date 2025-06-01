import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Request } from 'express';
import { GoogleAuthPayload } from 'src/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const state = req.query.state as string;
    const [role, companyName] = (state || '').split('|');

    const user: GoogleAuthPayload = {
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      role: role === 'employer' ? 'employer' : 'jobseeker',
      companyName: companyName || undefined,
      picture: profile.photos?.[0]?.value, // ✅ add this line
    };

    done(null, user);
  }
}
