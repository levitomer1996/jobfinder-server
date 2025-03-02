import { Module } from '@nestjs/common';
import { JobseekersService } from './jobseekers.service';
import { JobseekersController } from './jobseekers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JobSeeker, JobSeekerSchema } from './schemas/jobseeker.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: JobSeeker.name, schema: JobSeekerSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'tomer',
      signOptions: { expiresIn: '24h' }, // ✅ Set token expiration
    }),
  ],
  providers: [JobseekersService],
  controllers: [JobseekersController],
  exports: [JobseekersService],
})
export class JobseekersModule {}
