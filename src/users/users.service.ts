import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import {
  JobSeeker,
  JobSeekerDocument,
} from '../jobseekers/schemas/jobseeker.schema';
import {
  Employer,
  EmployerDocument,
} from '../employers/schemas/employer.schema';
import { JwtService } from '@nestjs/jwt';

import { Job } from 'src/jobs/schemas/job.schema';

import { ApplicationService } from 'src/applications/applications.service';
import { JobsService } from 'src/jobs/jobs.service';
import { JobseekersService } from 'src/jobseekers/jobseekers.service';
import { GoogleProfileData } from './DTO/GoogleProfileData.dto';
import { ChatService } from 'src/chat/chat.service';
import { CreateEmployerDto } from './DTO/SignupDTO';
import { CompanyService } from 'src/company/company.service';

export interface GoogleAuthPayload {
  email: string;
  name: string;
  role?: 'jobseeker' | 'employer';
  companyName?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(JobSeeker.name)
    private jobSeekerModel: Model<JobSeekerDocument>,

    @InjectModel(Employer.name) private employerModel: Model<EmployerDocument>,
    private jwtService: JwtService,
    private applicationService: ApplicationService,
    private jobService: JobsService,
    private jobSeekerSevice: JobseekersService,
    private chatService: ChatService,
    private companyService: CompanyService,
  ) {}

  async registerJobSeeker(
    name: string,
    email: string,
    password: string,
    phoneNumber?: string,
  ) {
    this.logger.log(`🔍 Checking if email is already in use: ${email}`);

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      this.logger.warn(
        `❌ Registration failed: Email already in use - ${email}`,
      );
      throw new BadRequestException('Email already in use');
    }

    this.logger.log(`🔑 Hashing password for user: ${email}`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = new Types.ObjectId();

    this.logger.log(`🛠 Creating new JobSeeker user: ${email}`);
    const newUser = new this.userModel({
      _id: newUserId,
      name,
      email,
      passwordHash: hashedPassword,
      role: 'jobseeker',
      phoneNumber,
    });

    await newUser.save();
    this.logger.log(`✅ User created successfully with ID: ${newUserId}`);

    this.logger.log(`🛠 Creating JobSeeker profile for user: ${newUserId}`);
    const jobSeekerProfile = new this.jobSeekerModel({
      user: newUserId,
    });

    await jobSeekerProfile.save();
    this.logger.log(
      `✅ JobSeeker profile created successfully for user: ${newUserId}`,
    );

    this.logger.log(`🔗 Linking JobSeeker profile to user: ${newUserId}`);
    newUser.jobSeekerProfile = jobSeekerProfile.id;
    await newUser.save();

    this.logger.log(`✅ JobSeeker profile linked to user: ${newUserId}`);
    return this.generateToken(newUser);
  }

  async registerEmployer(dto: CreateEmployerDto) {
    const { name, email, password, phoneNumber, company } = dto;

    this.logger.log(`🔍 Checking if email is already in use: ${email}`);
    if (!email) {
      this.logger.error(`❌ Registration failed: Email is required`);
      throw new BadRequestException('Email is required');
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      this.logger.warn(`❌ Email already in use - ${email}`);
      throw new BadRequestException('Email already in use');
    }

    if (!company) {
      this.logger.warn(`❌ Registration failed: Company info is missing`);
      throw new BadRequestException('Company information is required');
    }

    this.logger.log(`🔑 Hashing password`);
    const hashedPassword = await bcrypt.hash(password, 10);

    this.logger.log(`🛠 Creating user document`);
    const newUser = new this.userModel({
      name,
      email,
      passwordHash: hashedPassword,
      role: 'employer',
      phoneNumber,
    });
    await newUser.save();

    let companyDoc;

    if (company.found === true) {
      this.logger.log(
        `🔍 Fetching existing company by ID: ${company.companyId}`,
      );
      companyDoc = await this.companyService.findCompanyById(company.companyId);

      if (!companyDoc) {
        throw new BadRequestException('Company not found');
      }
    } else {
      const { name: companyName, description, location } = company;
      this.logger.log(`🏗 Creating new company: ${companyName}`);

      companyDoc = await this.companyService.createCompany({
        name: companyName,
        description,
        location,
      });
    }

    this.logger.log(`🛠 Creating Employer profile`);
    const employerProfile = new this.employerModel({
      user: newUser._id,
      company: companyDoc._id,
    });
    await employerProfile.save();

    this.logger.log(`🔗 Linking employer profile to user`);
    newUser.employerProfile = employerProfile._id;
    await newUser.save();

    this.logger.log(
      `Adding employer ${employerProfile._id} to new comapny - ${companyDoc._id}`,
    );
    await this.companyService.addEmployerToCompany(
      companyDoc._id,
      employerProfile._id,
    );
    this.logger.log(
      `Added successfuly employer ${employerProfile._id} to new comapny - ${companyDoc._id}`,
    );

    this.logger.log(`➕ Adding employer to company's recruiters`);
    await this.companyService.addEmployerToCompany(
      companyDoc._id,
      employerProfile._id,
    );

    this.logger.log(`✅ Employer registration completed`);
    return this.generateToken(newUser);
  }

  async login(email: string, password: string) {
    this.logger.log(`🔍 Checking if user exists for email: ${email}`);

    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.warn(`❌ Login failed: User not found - ${email}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`🔑 Verifying password for user: ${email}`);
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`❌ Login failed: Invalid credentials for ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`✅ Login successful for user: ${email}`);
    return this.generateToken(user);
  }

  private generateToken(user: UserDocument) {
    this.logger.log(`🔑 Generating JWT token for user: ${user.email}`);

    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      name: user.name,
    };

    const token = this.jwtService.sign(payload);
    this.logger.log(`✅ JWT token generated for user: ${user.email}`);

    return {
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async makeSuggestedJobsByContentBasedFiltering(
    user: User,
    jobseekerId: any,
  ): Promise<Job[]> {
    const appliedJobs =
      await this.jobSeekerSevice.getAppliedJobsByJobSeekerId(jobseekerId);

    const skillMap = new Map<string, number>();

    for (const job of appliedJobs) {
      for (const skill of job.requiredSkills || []) {
        const id = skill._id.toString();
        skillMap.set(id, (skillMap.get(id) || 0) + 1);
      }
    }

    const notAppliedJobs =
      await this.jobSeekerSevice.getNotAppliedJobsByJobSeekerId(jobseekerId);

    const scoredJobs = notAppliedJobs.map((job) => {
      const score = (job.requiredSkills || []).reduce((acc, skill) => {
        const id = skill._id.toString();
        return acc + (skillMap.get(id) || 0);
      }, 0);
      return { job, score };
    });

    scoredJobs.sort((a, b) => b.score - a.score);

    return scoredJobs.map((item) => item.job);
  }

  async getUserById(userId: Types.ObjectId) {
    return await this.userModel.findById(userId);
  }

  async getUserByEmployerId(empId: Types.ObjectId) {
    const foundEmployer = await this.employerModel.findById(empId);
    if (foundEmployer) {
      const foundUser = await this.getUserById(foundEmployer.user);

      return {
        name: foundUser.name,
        email: foundUser.email,
        _id: foundUser._id,
      };
    } else {
      this.logger.warn(`Employer ID was not found`);
      return;
    }
  }

  async getApliedUsersByJobId(jobId: Types.ObjectId): Promise<User[]> {
    this.logger.log(`Fetching applications for job ID: ${jobId}`);

    const foundApplications =
      await this.applicationService.getApplicationsByJobId(jobId);
    this.logger.log(`Found ${foundApplications.length} applications`);

    const jobSeekerIds = foundApplications.map((app) => app.jobSeekerId);
    this.logger.log(`Extracted JobSeeker IDs: ${jobSeekerIds}`);

    const uniqueJobSeekerIds = [
      ...new Set(jobSeekerIds.map((id) => id.toString())),
    ];
    this.logger.log(`Unique JobSeeker IDs: ${uniqueJobSeekerIds}`);

    const jobSeekers = await this.jobSeekerModel.find({
      _id: { $in: uniqueJobSeekerIds },
    });

    const userIds = jobSeekers.map((js) => js.user.toString());
    const uniqueUserIds = [...new Set(userIds)];

    this.logger.log(`Mapped to User IDs: ${uniqueUserIds}`);

    const users = await this.userModel.find({
      _id: { $in: uniqueUserIds },
    });

    this.logger.log(`Retrieved ${users.length} user profiles`);
    return users;
  }

  async googleLoginOrRegister(user: GoogleAuthPayload) {
    this.logger.log(`Google user arrived ${user}`);
    const role = user.role || 'jobseeker';

    let existing = await this.userModel.findOne({ email: user.email });
    if (!existing) {
      existing = new this.userModel({
        name: user.name,
        email: user.email,
        role,
      });
      await existing.save();

      if (role === 'jobseeker') {
        const js = new this.jobSeekerModel({ user: existing._id });
        await js.save();
        existing.jobSeekerProfile = js._id;
      } else if (role === 'employer') {
        if (!user.companyName) {
          throw new BadRequestException(
            'Company name is required for employers',
          );
        }
        const emp = new this.employerModel({
          user: existing._id,
          companyName: user.companyName,
        });
        await emp.save();
        existing.employerProfile = emp._id;
      }

      await existing.save();
    }

    return this.generateToken(existing).access_token;
  }

  async getUserUndreadedChats(userId: Types.ObjectId) {
    return await this.chatService.getUnreadedChatByUserId(userId);
  }
  async getUsersChats(userId: Types.ObjectId) {
    return this.chatService.getChatsByUserId(userId);
  }
}
