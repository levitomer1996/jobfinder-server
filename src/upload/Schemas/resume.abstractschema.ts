// src/common/schemas/base.schema.ts
import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export abstract class ResumeBase {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ default: Date.now })
  createdDate: Date;
}
