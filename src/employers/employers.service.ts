import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employer, EmployerDocument } from './schemas/employer.schema';

@Injectable()
export class EmployersService {
  constructor(
    @InjectModel(Employer.name)
    private employerModel: Model<EmployerDocument>,
  ) {}

  async getEmployerByUser(userId: Types.ObjectId): Promise<Employer> {
    const employer = await this.employerModel
      .findOne({ user: userId }) // ✅ Ensure the query matches ObjectId
      .populate('user', '-passwordHash');

    if (!employer) {
      throw new NotFoundException('Employer profile not found');
    }

    return employer;
  }
}
