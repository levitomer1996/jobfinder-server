import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { ApplicationService } from './applications.service';
import { ApplicationController } from './applications.controller';

import { JobsModule } from 'src/jobs/jobs.module'; // ✅ Add
import { EmployersModule } from 'src/employers/employers.module'; // ✅ Add
import { SkillModule } from 'src/skill/skill.module'; // ✅ Add

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
    ]),
    JobsModule, // ✅ brings in JobsService correctly
    EmployersModule, // ✅ brings in EmployersService correctly
    SkillModule, // ✅ brings in SkillService correctly
  ],
  providers: [ApplicationService], // ✅ Only your service here
  controllers: [ApplicationController],
  exports: [ApplicationService],
})
export class ApplicationsModule {}
