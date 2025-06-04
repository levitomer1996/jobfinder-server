import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CompanyService } from './company.service';

import { Company } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
//Change
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  async createCompany(@Body() dto: CreateCompanyDto): Promise<Company> {
    return this.companyService.createCompany(dto);
  }
  @Get('search')
  async searchCompaniesByName(@Query('name') name: string): Promise<Company[]> {
    return this.companyService.findCompaniesNameByName(name);
  }
}
