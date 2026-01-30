import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  pollId: mongoose.Types.ObjectId;
  studentId: string;
  optionId: string;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    studentId: { type: String, required: true },
    optionId: { type: String, required: true },
  },
  { timestamps: true }
);

// Ensure one vote per student per poll
VoteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

export const VoteModel = mongoose.model<IVote>('Vote', VoteSchema);
