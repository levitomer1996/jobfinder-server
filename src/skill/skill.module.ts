import { Module } from '@nestjs/common';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Skill, SkillSchema } from './schemas/skill.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Skill.name, schema: SkillSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService, MongooseModule],
})
export class SkillModule {}
