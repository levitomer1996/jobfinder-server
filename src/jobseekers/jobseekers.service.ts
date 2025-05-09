import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { JobSeeker, JobSeekerDocument } from './schemas/jobseeker.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { info } from 'console';
import JwtPayload from 'src/auth/JwtPayload';
import { ApplicationService } from 'src/applications/applications.service';
import { Job } from 'src/jobs/schemas/job.schema';
import { JobsService } from 'src/jobs/jobs.service';
import { SkillService } from 'src/skill/skill.service';
import { Skill } from 'src/skill/schemas/skill.schema';

@Injectable()
export class JobseekersService {
  constructor(
    @InjectModel(JobSeeker.name)
    private jobSeekerModel: Model<JobSeekerDocument>,
    private applicationService: ApplicationService,
    private jobService: JobsService,
    private skillService: SkillService,
  ) {}
  logger = new Logger('Jobseeker-service');

  async getJobSeekerByUser(user: JwtPayload): Promise<JobSeeker> {
    this.logger.log(`Looking for jobseeker attached to user ID- ${user._id}`);

    const jobSeeker = await this.jobSeekerModel.findOne({
      user: new Types.ObjectId(user._id.toString()),
    }); // ✅ Find by user reference

    if (!jobSeeker) {
      this.logger.warn(`Job Seeker profile not found for user - ${user.email}`);
      throw new NotFoundException('Job Seeker profile not found');
    }

    this.logger.log(`Found jobseeker for user - ${user.email}`); ///
    return jobSeeker;
  }

  async addResumeToJobSeeker(
    userId: string,
    fileName: string,
  ): Promise<JobSeeker> {
    const foundUser = await this.jobSeekerModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { $push: { resume: fileName } },
      { new: true },
    );
    this.logger.log(`Resume saved for ${foundUser}, file: ${fileName}`);
    return foundUser;
  }

  async getJobSeekerProfileByUserId(id: any): Promise<JobSeeker> {
    this.logger.log(`Getting jobseeker for user: ${id}`);

    if (!Types.ObjectId.isValid(id)) {
      this.logger.warn(`Invalid ObjectId passed: ${id}`);
      return null;
    }

    const objectId = typeof id === 'string' ? new Types.ObjectId(id) : id;

    const jobseeker = await this.jobSeekerModel.findOne({ user: objectId });

    if (!jobseeker) {
      this.logger.warn(`No JobSeeker found for user: ${id}`);
    }

    return jobseeker;
  }
  async getAppliedJobsByJobSeekerId(id: any): Promise<Job[]> {
    const applications =
      await this.applicationService.getApllicationByJobSeekerId(id);

    let arrToReturn = [];
    for (let i = 0; i < applications.length; i++) {
      arrToReturn.push(await this.jobService.getJobById(applications[i].jobId));
    }

    return arrToReturn;
  }

  async getNotAppliedJobsByJobSeekerId(id: any): Promise<Job[]> {
    // 1. Get all applications by this jobseeker
    const applications =
      await this.applicationService.getApllicationByJobSeekerId(id);

    // 2. Extract job IDs to remove (those already applied to)
    const idsToRemove = applications.map((app) => app.jobId.toString());

    // 3. Get all jobs
    const allJobs = await this.jobService.getAllJobs();

    // 4. Filter out jobs where the job._id is in idsToRemove
    const notAppliedJobs = allJobs.filter(
      (job) => !idsToRemove.includes(job._id.toString()),
    );

    return notAppliedJobs;
  }

  async addSkillToJobSeeker(
    jobseekerId: Types.ObjectId,
    skillNames: string[],
  ): Promise<JobSeeker> {
    console.log(
      `📥 Received request to add skills to JobSeeker ${jobseekerId}`,
    );
    console.log(`🔎 Skill names to add:`, skillNames);

    const foundSkills =
      await this.skillService.createMultipleSkills(skillNames);
    console.log(
      `✅ Created/Retrieved Skills:`,
      foundSkills.map((s) => ({ _id: s._id, name: s.name })),
    );

    const skillIds = foundSkills.map((s) => s._id);
    const updatedJobSeeker = await this.jobSeekerModel.findByIdAndUpdate(
      jobseekerId,
      { $push: { skills: { $each: skillIds } } }, // 💡 safer for multiple pushes
      { new: true },
    );

    if (!updatedJobSeeker) {
      console.warn(`❌ JobSeeker with ID ${jobseekerId} not found`);
    } else {
      console.log(`✅ Updated JobSeeker ${jobseekerId} with new skills.`);
    }

    return updatedJobSeeker;
  }
  async getSkillsByJobSeekerID(jobseekerId: Types.ObjectId): Promise<Skill[]> {
    const foundJobSeeker = await this.jobSeekerModel.findById(jobseekerId);

    return await this.skillService.findMultipleSkillsByIds(
      foundJobSeeker.skills.map((s) => s._id),
    );
  }
}
