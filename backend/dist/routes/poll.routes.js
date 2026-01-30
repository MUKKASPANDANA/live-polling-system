"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const poll_controller_1 = require("../controllers/poll.controller");
const router = (0, express_1.Router)();
console.log('📡 Registering poll routes...');
// Create a new poll
router.post('/create', (req, res) => {
    console.log('📝 POST /api/polls/create');
    poll_controller_1.pollController.createPoll(req, res);
});
// Get active poll
router.get('/active', (req, res) => {
    console.log('📋 GET /api/polls/active');
    poll_controller_1.pollController.getActivePoll(req, res);
});
// Get poll results
router.get('/:pollId/results', (req, res) => {
    console.log(`📊 GET /api/polls/${req.params.pollId}/results`);
    poll_controller_1.pollController.getPollResults(req, res);
});
// Get poll history
router.get('/history', (req, res) => {
    console.log('📚 GET /api/polls/history');
    poll_controller_1.pollController.getPollHistory(req, res);
});
// Check if student voted
router.get('/:pollId/student/:studentId/voted', (req, res) => {
    console.log(`✅ GET /api/polls/${req.params.pollId}/student/${req.params.studentId}/voted`);
    poll_controller_1.pollController.hasStudentVoted(req, res);
});
// Close active poll
router.post('/close', (req, res) => {
    console.log('🔴 POST /api/polls/close');
    poll_controller_1.pollController.closePoll(req, res);
});
exports.default = router;
