import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SkillService } from './skill.service';
import { Types } from 'mongoose';

@Controller('skill')
export class SkillController {
  constructor(private skillService: SkillService) {}

  @Get('regexsearch')
  async findSkillByRegexSearch(@Query('q') query: string) {
    return await this.skillService.findSkillByRegexSearch(query);
  }

  @Post('by-ids')
  async findSkillsByIds(@Body('ids') ids: string[]) {
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    return await this.skillService.findMultipleSkillsByIds(objectIds);
  }
}
