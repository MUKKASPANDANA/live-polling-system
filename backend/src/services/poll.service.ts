import { v4 as uuidv4 } from 'uuid';
import { PollModel, IPoll, IOption } from '../models/Poll';
import { VoteModel, IVote } from '../models/Vote';
import { getRemainingTime, isPollExpired } from '../utils/timer';

export interface CreatePollInput {
  question: string;
  options: string[];
  duration: number;
}

export interface VoteResult {
  optionId: string;
  text: string;
  count: number;
  percentage: number;
}

export class PollService {
  /**
   * Create a new poll (only if no active poll exists)
   */
  async createPoll(input: CreatePollInput): Promise<IPoll> {
    const activePoll = await PollModel.findOne({ isActive: true });

    if (activePoll) {
      const remainingTime = getRemainingTime(activePoll.startTime, activePoll.duration);

      // Auto-expire stale polls so a new one can be created
      if (remainingTime === 0) {
        activePoll.isActive = false;
        await activePoll.save();
      } else {
        throw new Error('An active poll already exists');
      }
    }

    const options: IOption[] = input.options.map((text) => ({
      id: uuidv4(),
      text,
    }));

    const poll = await PollModel.create({
      question: input.question,
      options,
      duration: input.duration,
      startTime: new Date(),
      isActive: true,
    });

    return poll;
  }

  /**
   * Get active poll with calculated remaining time
   */
  async getActivePoll(): Promise<any> {
    const poll = await PollModel.findOne({ isActive: true });

    if (!poll) {
      return null;
    }

    const remainingTime = getRemainingTime(poll.startTime, poll.duration);

    // Check if expired
    if (remainingTime === 0) {
      poll.isActive = false;
      await poll.save();
      return null;
    }

    return {
      _id: poll._id,
      question: poll.question,
      options: poll.options,
      startTime: poll.startTime,
      duration: poll.duration,
      isActive: poll.isActive,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      remainingTime,
    };
  }

  /**
   * Submit a vote for a poll
   * Enforces: one vote per student per poll
   */
  async submitVote(pollId: string, studentId: string, optionId: string): Promise<IVote> {
    // Check poll exists and is active
    const poll = await PollModel.findById(pollId);
    if (!poll || !poll.isActive) {
      throw new Error('Poll is not active');
    }

    // Check option exists
    const optionExists = poll.options.some((opt) => opt.id === optionId);
    if (!optionExists) {
      throw new Error('Invalid option');
    }

    // Check timer
    const remainingTime = getRemainingTime(poll.startTime, poll.duration);
    if (remainingTime === 0) {
      poll.isActive = false;
      await poll.save();
      throw new Error('Poll has expired');
    }

    // Attempt to create vote (unique constraint on pollId + studentId enforced at DB)
    try {
      const vote = await VoteModel.create({
        pollId,
        studentId,
        optionId,
      });
      return vote;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('You have already voted in this poll');
      }
      throw error;
    }
  }

  /**
   * Get poll results
   */
  async getPollResults(pollId: string): Promise<VoteResult[]> {
    const poll = await PollModel.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    const votes = await VoteModel.find({ pollId });
    const totalVotes = votes.length;

    const results: VoteResult[] = poll.options.map((option) => {
      const count = votes.filter((v) => v.optionId === option.id).length;
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

      return {
        optionId: option.id,
        text: option.text,
        count,
        percentage,
      };
    });

    return results;
  }

  /**
   * Get all poll history
   */
  async getPollHistory(limit: number = 10): Promise<IPoll[]> {
    return PollModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get vote count by option for a poll
   */
  async getVoteCountByOption(pollId: string): Promise<Map<string, number>> {
    const votes = await VoteModel.find({ pollId });
    const counts = new Map<string, number>();

    votes.forEach((vote) => {
      counts.set(vote.optionId, (counts.get(vote.optionId) || 0) + 1);
    });

    return counts;
  }

  /**
   * Check if a student has already voted in a poll
   */
  async hasStudentVoted(pollId: string, studentId: string): Promise<boolean> {
    const vote = await VoteModel.findOne({ pollId, studentId });
    return !!vote;
  }

  /**
   * Close the active poll
   */
  async closePoll(): Promise<void> {
    const activePoll = await PollModel.findOne({ isActive: true });
    if (activePoll) {
      activePoll.isActive = false;
      await activePoll.save();
    }
  }
}

export const pollService = new PollService();
