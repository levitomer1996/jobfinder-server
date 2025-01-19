import { Module } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Employer, EmployerSchema } from 'src/employers/schemas/employer.schema';

@Module({
   imports: [MongooseModule.forFeature([{ name: Employer.name, schema: EmployerSchema}])],
  providers: [InterviewsService],
  controllers: [InterviewsController]
})
export class InterviewsModule {}
