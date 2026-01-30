"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollService = exports.PollService = void 0;
const uuid_1 = require("uuid");
const Poll_1 = require("../models/Poll");
const Vote_1 = require("../models/Vote");
const timer_1 = require("../utils/timer");
class PollService {
    /**
     * Create a new poll (only if no active poll exists)
     */
    async createPoll(input) {
        const activePoll = await Poll_1.PollModel.findOne({ isActive: true });
        if (activePoll) {
            throw new Error('An active poll already exists');
        }
        const options = input.options.map((text) => ({
            id: (0, uuid_1.v4)(),
            text,
        }));
        const poll = await Poll_1.PollModel.create({
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
    async getActivePoll() {
        const poll = await Poll_1.PollModel.findOne({ isActive: true });
        if (!poll) {
            return null;
        }
        const remainingTime = (0, timer_1.getRemainingTime)(poll.startTime, poll.duration);
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
    async submitVote(pollId, studentId, optionId) {
        // Check poll exists and is active
        const poll = await Poll_1.PollModel.findById(pollId);
        if (!poll || !poll.isActive) {
            throw new Error('Poll is not active');
        }
        // Check option exists
        const optionExists = poll.options.some((opt) => opt.id === optionId);
        if (!optionExists) {
            throw new Error('Invalid option');
        }
        // Check timer
        const remainingTime = (0, timer_1.getRemainingTime)(poll.startTime, poll.duration);
        if (remainingTime === 0) {
            poll.isActive = false;
            await poll.save();
            throw new Error('Poll has expired');
        }
        // Attempt to create vote (unique constraint on pollId + studentId enforced at DB)
        try {
            const vote = await Vote_1.VoteModel.create({
                pollId,
                studentId,
                optionId,
            });
            return vote;
        }
        catch (error) {
            if (error.code === 11000) {
                throw new Error('You have already voted in this poll');
            }
            throw error;
        }
    }
    /**
     * Get poll results
     */
    async getPollResults(pollId) {
        const poll = await Poll_1.PollModel.findById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }
        const votes = await Vote_1.VoteModel.find({ pollId });
        const totalVotes = votes.length;
        const results = poll.options.map((option) => {
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
    async getPollHistory(limit = 10) {
        return Poll_1.PollModel.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
    /**
     * Get vote count by option for a poll
     */
    async getVoteCountByOption(pollId) {
        const votes = await Vote_1.VoteModel.find({ pollId });
        const counts = new Map();
        votes.forEach((vote) => {
            counts.set(vote.optionId, (counts.get(vote.optionId) || 0) + 1);
        });
        return counts;
    }
    /**
     * Check if a student has already voted in a poll
     */
    async hasStudentVoted(pollId, studentId) {
        const vote = await Vote_1.VoteModel.findOne({ pollId, studentId });
        return !!vote;
    }
    /**
     * Close the active poll
     */
    async closePoll() {
        const activePoll = await Poll_1.PollModel.findOne({ isActive: true });
        if (activePoll) {
            activePoll.isActive = false;
            await activePoll.save();
        }
    }
}
exports.PollService = PollService;
exports.pollService = new PollService();
