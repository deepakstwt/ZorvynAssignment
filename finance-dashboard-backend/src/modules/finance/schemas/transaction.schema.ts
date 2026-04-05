import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../../users/schemas/user.schema';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, required: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, enum: TransactionType })
  type: TransactionType;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: String })
  notes?: string;

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexing Performance for Dashboard Aggregations and Ledger Queries
TransactionSchema.index({ isDeleted: 1, date: -1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ isDeleted: 1, type: 1, date: -1 });
