import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employer, EmployerDocument } from './schemas/employer.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class EmployersService {
  constructor(
    @InjectModel(Employer.name)
    private employerModel: Model<EmployerDocument>,
  ) {}
  private readonly logger = new Logger(EmployersService.name);

  async getEmployerById(id: Types.ObjectId): Promise<Employer> {
    return await this.employerModel.findById(id);
  }

  async getEmployerByUser(userId: Types.ObjectId): Promise<Employer> {
    const employer = await this.employerModel
      .findOne({ user: userId }) // ✅ Ensure the query matches ObjectId
      .populate('user', '-passwordHash');

    if (!employer) {
      throw new NotFoundException('Employer profile not found');
    }

    return employer;
  }

  async findEmployerByUser(userId: string): Promise<Employer> {
    this.logger.log(`🔍 Searching for employer with user ID: ${userId}`);

    // Convert userId to ObjectId for MongoDB search
    const employer = await this.employerModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!employer) {
      this.logger.warn(`❌ Employer not found for user ID: ${userId}`);
      throw new NotFoundException(`Employer not found for user ID: ${userId}`);
    }

    this.logger.log(`✅ Employer found: ${JSON.stringify(employer)}`);
    return employer;
  }

  async addJobToEmployerById(eid: Types.ObjectId, jid: Types.ObjectId) {
    this.logger.log(`Searching for Employer ID - ${eid}`);
    const e = await this.employerModel.findById(eid);
    this.logger.log(`Found Employer ID - ${eid}`);
    let tempSkillsArray = [...e.jobPostings, jid];
    e.jobPostings = tempSkillsArray;
    this.logger.log(
      ` Job was added to Object...Trying to save new jobs list- ${eid}`,
    );
    await e.save();
  }

  async getEmployerByUserId(id: any): Promise<Employer> {
    this.logger.log(`Getting Employer for user: ${id}`);

    if (!Types.ObjectId.isValid(id)) {
      this.logger.warn(`Invalid ObjectId passed: ${id}`);
      return null;
    }

    const objectId = typeof id === 'string' ? new Types.ObjectId(id) : id;

    const employer = await this.employerModel.findOne({ user: objectId });

    if (!employer) {
      this.logger.warn(`No Employer found for user: ${id}`);
    }

    return employer;
  }
}
