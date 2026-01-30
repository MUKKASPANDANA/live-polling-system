import { Request, Response } from 'express';
import { pollService, CreatePollInput, VoteResult } from '../services/poll.service';
import { IPoll } from '../models/Poll';

export class PollController {
  /**
   * Create a new poll
   * POST /api/polls
   */
  async createPoll(req: Request, res: Response): Promise<void> {
    try {
      const { question, options, duration } = req.body;

      if (!question || !options || !Array.isArray(options) || options.length < 2 || !duration) {
        res.status(400).json({ error: 'Invalid input: question, options (array, min 2), and duration required' });
        return;
      }

      const input: CreatePollInput = { question, options, duration };
      const poll = await pollService.createPoll(input);

      res.status(201).json({
        success: true,
        data: poll,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Failed to create poll',
      });
    }
  }

  /**
   * Get active poll
   * GET /api/polls/active
   */
  async getActivePoll(req: Request, res: Response): Promise<void> {
    try {
      const poll = await pollService.getActivePoll();
      res.json({
        success: true,
        data: poll,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to fetch active poll',
      });
    }
  }

  /**
   * Get poll results
   * GET /api/polls/:pollId/results
   */
  async getPollResults(req: Request, res: Response): Promise<void> {
    try {
      const { pollId } = req.params;
      const results = await pollService.getPollResults(pollId);

      res.json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to fetch results',
      });
    }
  }

  /**
   * Get poll history
   * GET /api/polls/history
   */
  async getPollHistory(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const history = await pollService.getPollHistory(limit);

      res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to fetch history',
      });
    }
  }

  /**
   * Check if student has voted
   * GET /api/polls/:pollId/student/:studentId/voted
   */
  async hasStudentVoted(req: Request, res: Response): Promise<void> {
    try {
      const { pollId, studentId } = req.params;
      const hasVoted = await pollService.hasStudentVoted(pollId, studentId);

      res.json({
        success: true,
        data: { hasVoted },
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to check vote status',
      });
    }
  }

  /**
   * Close active poll
   * POST /api/polls/close
   */
  async closePoll(req: Request, res: Response): Promise<void> {
    try {
      await pollService.closePoll();
      res.json({
        success: true,
        message: 'Poll closed successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to close poll',
      });
    }
  }
}

export const pollController = new PollController();
