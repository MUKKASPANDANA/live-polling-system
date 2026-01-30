import { Router } from 'express';
import { pollController } from '../controllers/poll.controller';

const router = Router();

console.log('📡 Registering poll routes...');

// Create a new poll
router.post('/create', (req, res) => {
  console.log('📝 POST /api/polls/create');
  pollController.createPoll(req, res);
});

// Get active poll
router.get('/active', (req, res) => {
  console.log('📋 GET /api/polls/active');
  pollController.getActivePoll(req, res);
});

// Get poll results
router.get('/:pollId/results', (req, res) => {
  console.log(`📊 GET /api/polls/${req.params.pollId}/results`);
  pollController.getPollResults(req, res);
});

// Get poll history
router.get('/history', (req, res) => {
  console.log('📚 GET /api/polls/history');
  pollController.getPollHistory(req, res);
});

// Check if student voted
router.get('/:pollId/student/:studentId/voted', (req, res) => {
  console.log(`✅ GET /api/polls/${req.params.pollId}/student/${req.params.studentId}/voted`);
  pollController.hasStudentVoted(req, res);
});

// Close active poll
router.post('/close', (req, res) => {
  console.log('🔴 POST /api/polls/close');
  pollController.closePoll(req, res);
});

export default router;
