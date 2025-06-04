import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { ApplicationService } from './applications.service';
import { ApplicationController } from './applications.controller';

import { JobsModule } from 'src/jobs/jobs.module';
import { EmployersModule } from 'src/employers/employers.module';
import { SkillModule } from 'src/skill/skill.module';
import { NotificationModule } from 'src/notification/notification.module';
import { JobseekersModule } from 'src/jobseekers/jobseekers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
    ]),
    forwardRef(() => JobsModule),
    forwardRef(() => EmployersModule), // ✅ השתמש רק בזה
    SkillModule,
    NotificationModule,
    forwardRef(() => JobseekersModule),
  ],
  providers: [ApplicationService],
  controllers: [ApplicationController],
  exports: [ApplicationService],
})
export class ApplicationsModule {}
