import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}
  logger = new Logger('User service');
  async register(
    name: string,
    email: string,
    password: string,
    role: string,
    phoneNumber?: string,
  ) {
    this.logger.log(`New user with mail ${email} is trying to register`);
    this.logger.log(`Searching for user existance by mail: ${email}`);
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    this.logger.log(`User name is free. ${email}`);
    this.logger.log(`Hashing password`);
    const hashedPassword = await bcrypt.hash(password, 10);
    this.logger.log(`Creating new user in MongoDB cluster.`);
    const newUser = new this.userModel({
      name,
      email,
      passwordHash: hashedPassword,
      role,
      phoneNumber,
    });
    await newUser.save();
    this.logger.log(`User ${email} is saved successfuly.`);
    return this.generateToken(newUser);
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private generateToken(user: UserDocument) {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
