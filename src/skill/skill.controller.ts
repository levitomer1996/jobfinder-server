import { Controller, Get, Query } from '@nestjs/common';
import { SkillService } from './skill.service';

@Controller('skill')
export class SkillController {
  constructor(private skillService: SkillService) {}

  @Get('regexsearch')
  async findSkillByRegexSearch(@Query('q') query: string) {
    return await this.skillService.findSkillByRegexSearch(query);
  }
}
