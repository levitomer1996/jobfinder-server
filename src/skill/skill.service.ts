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

  async findSkillByRegexSearch(payload: string) {
    const found = await this.skillModel.find({
      name: { $regex: new RegExp(payload, 'i') },
    });

    return found;
  }

  async createSkill(name: string): Promise<Skill> {
    this.logger.log(`Creating new skill - ${name} -  Already exist`);

    try {
      const foundSkill = await this.skillModel.findOne({ name });
      if (!foundSkill) {
        this.logger.log(`Skill was not found Creating new skill - ${name}`);
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

          throw new Error(
            'An unexpected error occurred while saving the skill.',
          );
        }
      } else {
        return foundSkill;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async createMultipleSkills(skills: string[]): Promise<Skill[]> {
    const skillsToReturn = [];
    for (let i = 0; i < skills.length; i++) {
      const name = skills[i].trim();
      this.logger.log(`Trying to find skill: ${name}`);

      const foundSkill = await this.skillModel.findOne({
        name: { $regex: `^${name}$`, $options: 'i' },
      });

      if (foundSkill) {
        this.logger.log(`Skill "${name}" already exists`);
        skillsToReturn.push(foundSkill);
      } else {
        const newSkill = await this.createSkill(name);
        skillsToReturn.push(newSkill);
      }
    }
    return skillsToReturn;
  }
}
