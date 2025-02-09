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

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService'); // ✅ Logger initialized

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(JobSeeker.name)
    private jobSeekerModel: Model<JobSeekerDocument>,
    @InjectModel(Employer.name) private employerModel: Model<EmployerDocument>,
    private jwtService: JwtService,
  ) {}

  // ✅ Register JobSeeker
  async registerJobSeeker(
    name: string,
    email: string,
    password: string,
    phoneNumber?: string,
  ) {
    this.logger.log(`Attempting to register jobseeker with email: ${email}`);

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      this.logger.warn(`Registration failed: Email already in use - ${email}`);
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = new Types.ObjectId();

    const newUser = new this.userModel({
      _id: newUserId,
      name,
      email,
      passwordHash: hashedPassword,
      role: 'jobseeker',
      phoneNumber,
    });

    await newUser.save();
    this.logger.log(`User created successfully with ID: ${newUserId}`);

    const jobSeekerProfile = new this.jobSeekerModel({
      user: newUserId,
    });

    await jobSeekerProfile.save();
    this.logger.log(`JobSeeker profile created for user: ${newUserId}`);

    newUser.jobSeekerProfile = jobSeekerProfile.id;
    await newUser.save();

    this.logger.log(`JobSeeker profile linked to user: ${newUserId}`);

    return this.generateToken(newUser);
  }

  // ✅ Register Employer
  async registerEmployer(
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    companyName: string,
  ) {
    this.logger.log(`Attempting to register employer with email: ${email}`);

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      this.logger.warn(`Registration failed: Email already in use - ${email}`);
      throw new BadRequestException('Email already in use');
    }

    if (!companyName) {
      this.logger.warn(`Registration failed: Company name is required`);
      throw new BadRequestException('Company name is required for employers');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = new Types.ObjectId();

    const newUser = new this.userModel({
      _id: newUserId,
      name,
      email,
      passwordHash: hashedPassword,
      role: 'employer',
      phoneNumber,
    });

    await newUser.save();
    this.logger.log(`Employer user created with ID: ${newUserId}`);

    const employerProfile = new this.employerModel({
      user: newUserId,
      companyName,
    });

    await employerProfile.save();
    this.logger.log(`Employer profile created for user: ${newUserId}`);

    newUser.employerProfile = employerProfile.id;
    await newUser.save();

    this.logger.log(`Employer profile linked to user: ${newUserId}`);

    return this.generateToken(newUser);
  }

  // ✅ User Login
  async login(email: string, password: string) {
    this.logger.log(`Login attempt for email: ${email}`);

    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.warn(`Login failed: User not found - ${email}`);
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid credentials for ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`Login successful for user: ${email}`);
    return this.generateToken(user);
  }

  // ✅ Generate JWT Token
  private generateToken(user: UserDocument) {
    this.logger.log(`Generating JWT token for user: ${user.email}`);

    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      name: user.name,
    };

    const token = this.jwtService.sign(payload);
    this.logger.log(`JWT token generated for user: ${user.email}`);

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
}
