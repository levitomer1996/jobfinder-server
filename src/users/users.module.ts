import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import {
  JobSeeker,
  JobSeekerSchema,
} from 'src/jobseekers/schemas/jobseeker.schema';
import {
  Employer,
  EmployerSchema,
} from 'src/employers/schemas/employer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: JobSeeker.name, schema: JobSeekerSchema },
      { name: Employer.name, schema: EmployerSchema },
    ]),

    JwtModule.register({
      secret: 'tomer',
      signOptions: { expiresIn: '24h' }, // ✅ Set token expiration
    }),
  ],

  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
