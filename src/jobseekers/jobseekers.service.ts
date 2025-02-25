import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobSeeker, JobSeekerDocument } from './schemas/jobseeker.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { info } from 'console';
import JwtPayload from 'src/auth/JwtPayload';

@Injectable()
export class JobseekersService {
  constructor(
    @InjectModel(JobSeeker.name)
    private jobSeekerModel: Model<JobSeekerDocument>,
  ) {}
  logger = new Logger('Jobseeker-service');
  async getJobSeekerByUser(user: JwtPayload): Promise<JobSeeker> {
    this.logger.log(
      `Looking for jobseeker attached to user ID- ${user.userId}`,
    );

    const jobSeeker = await this.jobSeekerModel.findOne({
      user: new Types.ObjectId(user.userId.toString()),
    }); // ✅ Find by user reference

    if (!jobSeeker) {
      this.logger.warn(`Job Seeker profile not found for user - ${user.email}`);
      throw new NotFoundException('Job Seeker profile not found');
    }

    this.logger.log(`Found jobseeker for user - ${user.email}`); ///
    return jobSeeker;
  }
}
