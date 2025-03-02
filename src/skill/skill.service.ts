import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { JobSeekerDocument } from 'src/jobseekers/schemas/jobseeker.schema';
import { Skill } from './schemas/skill.schema';
import splitStringByComma from 'src/Helpers/splitStringByComma';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SkillService {
  constructor(@InjectModel(Skill.name) private skillModel: Model<Skill>) {}
  private readonly logger = new Logger('Skill-Service');

  async createSkill(name: string): Promise<Skill> {
    this.logger.log(`Creating new skill - ${name}`);
    const skill = new this.skillModel({ name });

    try {
      this.logger.log(`Trying to save skill - ${name}`);
      await skill.save();
      this.logger.log(`✅ New skill has been saved - ${name}`);
      return skill;
    } catch (error) {
      this.logger.error(
        `❌ Error saving skill - ${name}: ${error.message}`,
        error.stack,
      );

      // Handle specific MongoDB duplicate key error
      if (error.code === 11000) {
        throw new BadRequestException(`Skill "${name}" already exists.`);
      }

      throw new Error('An unexpected error occurred while saving the skill.');
    }
  }
  async createMultipleSkills(skills: string): Promise<Skill[]> {
    const skillsAsArray = splitStringByComma(skills);
    let skillsToReturn = [];
    for (let i = 0; i < skillsAsArray.length; i++) {
      skillsToReturn.push(await this.createSkill(skillsAsArray[i]));
    }
    return skillsToReturn;
  }
}
