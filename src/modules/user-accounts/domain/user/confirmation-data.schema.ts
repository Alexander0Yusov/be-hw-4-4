import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class ConfirmationData {
  @Prop({ type: [String], required: false, default: null })
  sentEmails: string[] | null;

  @Prop({ type: String, required: false, default: null })
  confirmationCode: string | null;

  @Prop({ type: Date, required: false, default: null })
  expirationDate: Date | null;

  @Prop({ type: Boolean, required: true, default: false })
  isConfirmed: boolean;
}

export const ConfirmationDataSchema =
  SchemaFactory.createForClass(ConfirmationData);
