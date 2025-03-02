import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Skill extends Document {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;
  @Prop({ type: String, required: true, unique: true })
  name: string;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
