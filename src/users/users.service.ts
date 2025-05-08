import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
  Type,
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
import { CompanyService } from 'src/company/company.service';
import { Job } from 'src/jobs/schemas/job.schema';
import {
  Application,
  ApplicationDocument,
} from 'src/applications/schemas/application.schema';
import { ApplicationService } from 'src/applications/applications.service';
import { JobsService } from 'src/jobs/jobs.service';
import { JobseekersService } from 'src/jobseekers/jobseekers.service';

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
  ) {}

  // ✅ Register JobSeeker with detailed logs
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

  async registerEmployer(
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    companyName: string,
  ) {
    this.logger.log(`🔍 Checking if email is already in use: ${email}`);

    // 🔥 Add this check
    if (!email) {
      this.logger.error(
        `❌ Registration failed: Email is required but received null`,
      );
      throw new BadRequestException('Email is required');
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      this.logger.warn(
        `❌ Registration failed: Email already in use - ${email}`,
      );
      throw new BadRequestException('Email already in use');
    }

    if (!companyName) {
      this.logger.warn(`❌ Registration failed: Company name is required`);
      throw new BadRequestException('Company name is required for employers');
    }

    this.logger.log(`🔑 Hashing password for employer: ${email}`);
    const hashedPassword = await bcrypt.hash(password, 10);

    this.logger.log(`🛠 Creating new Employer user: ${email}`);
    const newUser = new this.userModel({
      name,
      email,
      passwordHash: hashedPassword,
      role: 'employer',
      phoneNumber,
    });

    await newUser.save();
    this.logger.log(
      `✅ Employer user created successfully with ID: ${newUser._id}`,
    );

    this.logger.log(`🛠 Creating Employer profile for user: ${newUser._id}`);

    // 🔥 Add an explicit email check

    const employerProfile = new this.employerModel({
      user: newUser._id,
      companyName,
    });

    await employerProfile.save();
    this.logger.log(
      `✅ Employer profile created successfully for user: ${newUser._id}`,
    );

    this.logger.log(`🔗 Linking Employer profile to user: ${newUser._id}`);
    newUser.employerProfile = employerProfile.id;

    this.logger.log(`✅ Employer profile linked to user: ${newUser._id}`);
    return this.generateToken(newUser);
  }

  // ✅ User Login with detailed logs
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

  // ✅ Generate JWT Token with logs
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

  //Functions of suggesting jobs to users
  async makeSuggestedJobsByContentBasedFiltering(
    user: User,
    jobseekerId: any,
  ): Promise<Job[]> {
    // 1. שליפת משרות שהמשתמש הגיש אליהן
    const appliedJobs =
      await this.jobSeekerSevice.getAppliedJobsByJobSeekerId(jobseekerId);

    // 2. בניית מפת skills לפי תדירות הופעה
    const skillMap = new Map<string, number>();

    for (const job of appliedJobs) {
      for (const skill of job.requiredSkills || []) {
        const id = skill._id.toString(); // הפיכת ObjectId למחרוזת
        skillMap.set(id, (skillMap.get(id) || 0) + 1);
      }
    }

    // 3. שליפת משרות שלא הוגשו
    const notAppliedJobs =
      await this.jobSeekerSevice.getNotAppliedJobsByJobSeekerId(jobseekerId);

    // 4. חישוב ציון התאמה לכל משרה חדשה
    const scoredJobs = notAppliedJobs.map((job) => {
      const score = (job.requiredSkills || []).reduce((acc, skill) => {
        const id = skill._id.toString();
        return acc + (skillMap.get(id) || 0);
      }, 0);
      return { job, score };
    });

    // 5. מיון לפי ציון התאמה (מהגבוה לנמוך)
    scoredJobs.sort((a, b) => b.score - a.score);

    // 6. החזרת רק את המשרות עצמן, לפי הסדר

    return scoredJobs.map((item) => item.job);
  }

  async getUserById(userId: Types.ObjectId) {
    return await this.userModel.findById(userId);
  }
  async getUserByEmployerId(empId: Types.ObjectId) {
    this.logger.log(`ID: ${empId}`);
    const foundEmployer = await this.employerModel.findById(empId);
    if (foundEmployer) {
      const foundUser = await this.getUserById(foundEmployer.user);
      return { name: foundUser.name, email: foundUser.email };
    } else {
      this.logger.warn(`Employer ID was not found`);
      return;
    }
  }
}
