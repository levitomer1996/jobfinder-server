import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';

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

  // ✅ New route: Get company by ID
  @Get(':id')
  async getCompanyById(@Param('id') id: string): Promise<Company> {
    return this.companyService.findCompanyById(id);
  }
}
