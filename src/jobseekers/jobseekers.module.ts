import { Module } from '@nestjs/common';
import { JobseekersService } from './jobseekers.service';
import { JobseekersController } from './jobseekers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JobSeeker, JobSeekerSchema } from './schemas/jobseeker.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: JobSeeker.name, schema: JobSeekerSchema }])],
  providers: [JobseekersService],
  controllers: [JobseekersController]
})
export class JobseekersModule {}
