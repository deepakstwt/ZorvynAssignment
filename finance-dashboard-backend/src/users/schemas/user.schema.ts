import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  VIEWER = 'viewer',
  ANALYST = 'analyst',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.VIEWER })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, default: 'Zorvyn Financial' })
  organizationName: string;

  @Prop({ type: String, default: '69d13d90b1157372c5c51395' }) // Global Org ID fallback
  organizationId: string;
  
  // createdAt is automatically managed by timestamps: true, but we type it
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
