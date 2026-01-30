"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollController = exports.PollController = void 0;
const poll_service_1 = require("../services/poll.service");
class PollController {
    /**
     * Create a new poll
     * POST /api/polls
     */
    async createPoll(req, res) {
        try {
            const { question, options, duration } = req.body;
            if (!question || !options || !Array.isArray(options) || options.length < 2 || !duration) {
                res.status(400).json({ error: 'Invalid input: question, options (array, min 2), and duration required' });
                return;
            }
            const input = { question, options, duration };
            const poll = await poll_service_1.pollService.createPoll(input);
            res.status(201).json({
                success: true,
                data: poll,
            });
        }
        catch (error) {
            res.status(400).json({
                error: error.message || 'Failed to create poll',
            });
        }
    }
    /**
     * Get active poll
     * GET /api/polls/active
     */
    async getActivePoll(req, res) {
        try {
            const poll = await poll_service_1.pollService.getActivePoll();
            res.json({
                success: true,
                data: poll,
            });
        }
        catch (error) {
            res.status(500).json({
                error: error.message || 'Failed to fetch active poll',
            });
        }
    }
    /**
     * Get poll results
     * GET /api/polls/:pollId/results
     */
    async getPollResults(req, res) {
        try {
            const { pollId } = req.params;
            const results = await poll_service_1.pollService.getPollResults(pollId);
            res.json({
                success: true,
                data: results,
            });
        }
        catch (error) {
            res.status(500).json({
                error: error.message || 'Failed to fetch results',
            });
        }
    }
    /**
     * Get poll history
     * GET /api/polls/history
     */
    async getPollHistory(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const history = await poll_service_1.pollService.getPollHistory(limit);
            res.json({
                success: true,
                data: history,
            });
        }
        catch (error) {
            res.status(500).json({
                error: error.message || 'Failed to fetch history',
            });
        }
    }
    /**
     * Check if student has voted
     * GET /api/polls/:pollId/student/:studentId/voted
     */
    async hasStudentVoted(req, res) {
        try {
            const { pollId, studentId } = req.params;
            const hasVoted = await poll_service_1.pollService.hasStudentVoted(pollId, studentId);
            res.json({
                success: true,
                data: { hasVoted },
            });
        }
        catch (error) {
            res.status(500).json({
                error: error.message || 'Failed to check vote status',
            });
        }
    }
    /**
     * Close active poll
     * POST /api/polls/close
     */
    async closePoll(req, res) {
        try {
            await poll_service_1.pollService.closePoll();
            res.json({
                success: true,
                message: 'Poll closed successfully',
            });
        }
        catch (error) {
            res.status(500).json({
                error: error.message || 'Failed to close poll',
            });
        }
    }
}
exports.PollController = PollController;
exports.pollController = new PollController();
