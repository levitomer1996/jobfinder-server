import { Types } from 'mongoose';

export default class UserProfilePublicDTO {
  _id: Types.ObjectId;
  profileImageUrl: string;
  name: string;
  email: string;
}
