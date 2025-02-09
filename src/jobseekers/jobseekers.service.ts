import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobSeeker, JobSeekerDocument } from './schemas/jobseeker.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { info } from 'console';

@Injectable()
export class JobseekersService {
  constructor(
    @InjectModel(JobSeeker.name)
    private jobSeekerModel: Model<JobSeekerDocument>,
  ) {}
  logger = new Logger('Jobseeker-service');
  async getJobSeekerByUser(user: UserDocument): Promise<JobSeeker> {
    this.logger.log(`Looking for jobseeker attached to user - ${user._id}`);

    const jobSeeker = await this.jobSeekerModel
      .findOne({ user: user._id }) // ✅ Find by user reference
      .populate('user', '-passwordHash'); // ✅ Populate user details without password

    if (!jobSeeker) {
      this.logger.warn(`Job Seeker profile not found for user - ${user._id}`);
      throw new NotFoundException('Job Seeker profile not found');
    }

    this.logger.log(`Found jobseeker for user - ${user._id}`);
    return jobSeeker;
  }
}
