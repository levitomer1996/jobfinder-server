import { forwardRef, Module } from '@nestjs/common';
import { JobseekersService } from './jobseekers.service';
import { JobseekersController } from './jobseekers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JobSeeker, JobSeekerSchema } from './schemas/jobseeker.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { Job, JobSchema } from 'src/jobs/schemas/job.schema';
import {
  Employer,
  EmployerSchema,
} from 'src/employers/schemas/employer.schema';
import { Skill, SkillSchema } from 'src/skill/schemas/skill.schema';
import {
  Application,
  ApplicationSchema,
} from 'src/applications/schemas/application.schema';

import { EmployersModule } from 'src/employers/employers.module';
import { SkillModule } from 'src/skill/skill.module';
import { CompanyModule } from 'src/company/company.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { ApplicationsModule } from 'src/applications/applications.module';
import { UsersModule } from 'src/users/users.module'; // תלות מעגלית

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: JobSeeker.name, schema: JobSeekerSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Job.name, schema: JobSchema },
      { name: Employer.name, schema: EmployerSchema },
      { name: Skill.name, schema: SkillSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'tomer',
      signOptions: { expiresIn: '24h' },
    }),
    forwardRef(() => UsersModule), // ✅ כדי לשבור תלות מעגלית
    forwardRef(() => ApplicationsModule), // ✅ גם כאן
    JobsModule,
    EmployersModule,
    SkillModule,
    CompanyModule,
  ],
  providers: [JobseekersService],
  controllers: [JobseekersController],
  exports: [JobseekersService],
})
export class JobseekersModule {}
