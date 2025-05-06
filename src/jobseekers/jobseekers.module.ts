import { Module } from '@nestjs/common';
import { JobseekersService } from './jobseekers.service';
import { JobseekersController } from './jobseekers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JobSeeker, JobSeekerSchema } from './schemas/jobseeker.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  Application,
  ApplicationSchema,
} from 'src/applications/schemas/application.schema';
import { ApplicationService } from 'src/applications/applications.service';
import { Job, JobSchema } from 'src/jobs/schemas/job.schema';
import { JobsService } from 'src/jobs/jobs.service';
import { JobsModule } from 'src/jobs/jobs.module';
import {
  Employer,
  EmployerSchema,
} from 'src/employers/schemas/employer.schema';
import { EmployersModule } from 'src/employers/employers.module';
import { Skill, SkillSchema } from 'src/skill/schemas/skill.schema';
import { SkillModule } from 'src/skill/skill.module';

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
      signOptions: { expiresIn: '24h' }, // ✅ Set token expiration
    }),
    EmployersModule,
    SkillModule,
  ],
  providers: [JobseekersService, ApplicationService, JobsService],
  controllers: [JobseekersController],
  exports: [JobseekersService],
})
export class JobseekersModule {}
