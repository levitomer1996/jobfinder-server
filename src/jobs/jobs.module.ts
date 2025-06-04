import { Module, forwardRef } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Skill, SkillSchema } from 'src/skill/schemas/skill.schema';
import {
  Employer,
  EmployerSchema,
} from 'src/employers/schemas/employer.schema';
import {
  JobSeeker,
  JobSeekerSchema,
} from 'src/jobseekers/schemas/jobseeker.schema';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { EmployersModule } from 'src/employers/employers.module';
import { SkillModule } from 'src/skill/skill.module';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: User.name, schema: UserSchema },
      { name: Skill.name, schema: SkillSchema },
      { name: Employer.name, schema: EmployerSchema },
      { name: JobSeeker.name, schema: JobSeekerSchema },
    ]),
    forwardRef(() => EmployersModule),
    SkillModule,
    CompanyModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'tomer',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [JobsService], // ✅ רק JobsService
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
