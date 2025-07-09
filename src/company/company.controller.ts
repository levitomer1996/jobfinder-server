import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Types } from 'mongoose';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  private readonly logger = new Logger(CompanyController.name);
  @Post()
  async createCompany(@Body() dto: CreateCompanyDto): Promise<Company> {
    return this.companyService.createCompany(dto);
  }

  @Get('search')
  async searchCompaniesByName(@Query('name') name: string): Promise<Company[]> {
    return this.companyService.findCompaniesNameByName(name);
  }

  @Get(':id')
  async getCompanyById(@Param('id') id: string): Promise<Company> {
    return this.companyService.findCompanyById(id);
  }

  @Get(':id/profile-image')
  async getCompanyProfileImage(@Param('id') id: string): Promise<string> {
    this.logger.log(`Searching for ID - ${id}`);
    return await this.companyService.getCompanyProfileImageById(
      new Types.ObjectId(id),
    );
  }
}
