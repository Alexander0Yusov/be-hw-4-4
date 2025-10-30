import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  _id: false,
})
export class CommentatorInfo {
  @Prop({ type: Types.ObjectId, required: false, default: null })
  userId: Types.ObjectId | null;

  @Prop({ type: String, required: false, default: null })
  userLogin: string | null;
}

export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);
