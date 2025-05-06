import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { ApplicationService } from './applications.service';
import { AppController } from 'src/app.controller';
import { ApplicationController } from './applications.controller';
import { JobsService } from 'src/jobs/jobs.service';
import { Job, JobSchema } from 'src/jobs/schemas/job.schema';
import {
  Employer,
  EmployerSchema,
} from 'src/employers/schemas/employer.schema';
import { EmployersService } from 'src/employers/employers.service';
import { SkillService } from 'src/skill/skill.service';
import { Skill, SkillSchema } from 'src/skill/schemas/skill.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: Job.name, schema: JobSchema },
      { name: Employer.name, schema: EmployerSchema },
      { name: Skill.name, schema: SkillSchema },
    ]),
  ],
  providers: [ApplicationService, JobsService, EmployersService, SkillService],
  controllers: [ApplicationController],
  exports: [ApplicationService],
})
export class ApplicationsModule {}
