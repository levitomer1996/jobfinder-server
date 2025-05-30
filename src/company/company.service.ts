import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);
  constructor(
    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>,
  ) {}

  async createCompany(dto: CreateCompanyDto): Promise<Company> {
    const newCompany = new this.companyModel(dto);
    return await newCompany.save();
  }

  async findCompaniesNameByName(name: string): Promise<Company[]> {
    return await this.companyModel.find({
      name: { $regex: name, $options: 'i' },
    });
  }

  async findCompanyByName(name: string): Promise<CompanyDocument> {
    this.logger.log(name);
    return await this.companyModel.findOne({ name });
  }

  async addEmployerToCompany(
    companyId: Types.ObjectId,
    employerId: Types.ObjectId,
  ): Promise<CompanyDocument> {
    return await this.companyModel.findByIdAndUpdate(
      companyId,
      { $addToSet: { recruiters: employerId } },
      { new: true },
    );
  }
  async findCompanyById(id: string): Promise<CompanyDocument> {
    return this.companyModel.findById(id);
  }
  async findCompanyByEmployer(empId: Types.ObjectId) {
    return await this.companyModel.findOne({
      recruiters: empId,
    });
  }
}
