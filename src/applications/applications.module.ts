import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { ApplicationService } from './applications.service';
import { ApplicationController } from './applications.controller';

import { JobsModule } from 'src/jobs/jobs.module'; // ✅ Add
import { EmployersModule } from 'src/employers/employers.module'; // ✅ Add
import { SkillModule } from 'src/skill/skill.module'; // ✅ Add
import { NotificationService } from 'src/notification/notification.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
    ]),
    JobsModule,
    EmployersModule,
    SkillModule,
    NotificationModule, // ✅ מספק את NotificationService כבר
  ],
  providers: [ApplicationService], // ✅ הסרה של NotificationService
  controllers: [ApplicationController],
  exports: [ApplicationService],
})
export class ApplicationsModule {}
