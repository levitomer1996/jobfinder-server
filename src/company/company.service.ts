import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>,
  ) {}

  async createCompany(dto: CreateCompanyDto): Promise<Company> {
    const newCompany = new this.companyModel(dto);
    return await newCompany.save();
  }

  async findCompaniesNameByName(name: string): Promise<string[]> {
    const companies = await this.companyModel
      .find({ name: { $regex: name } }) // case-sensitive
      .select('name');

    return companies.map((c) => c.name);
  }
  async findCompanyByName(name: string): Promise<CompanyDocument> {
    return await this.companyModel.findOne({ name });
  }
}
