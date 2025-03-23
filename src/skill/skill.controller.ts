import { Controller, Get, Query } from '@nestjs/common';
import { SkillService } from './skill.service';

@Controller('skill')
export class SkillController {
  constructor(private skillService: SkillService) {}

  @Get('regexsearch')
  findSkillByRegexSearch(@Query('q') query: string) {
    return this.skillService.findSkillByRegexSearch(query);
  }
}
