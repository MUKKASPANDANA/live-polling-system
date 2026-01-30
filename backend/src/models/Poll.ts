import mongoose, { Schema, Document } from 'mongoose';

export interface IOption {
  id: string;
  text: string;
}

export interface IPoll extends Document {
  question: string;
  options: IOption[];
  startTime: Date;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<IOption>({
  id: { type: String, required: true },
  text: { type: String, required: true },
});

const PollSchema = new Schema<IPoll>(
  {
    question: { type: String, required: true },
    options: { type: [OptionSchema], required: true, validate: (opts: IOption[]) => opts.length >= 2 },
    startTime: { type: Date, default: () => new Date() },
    duration: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PollModel = mongoose.model<IPoll>('Poll', PollSchema);
