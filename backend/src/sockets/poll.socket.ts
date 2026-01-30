import { Server, Socket } from 'socket.io';
import { pollService } from '../services/poll.service';

export interface ServerToClientEvents {
  'poll:created': (data: any) => void;
  'poll:updated': (data: any) => void;
  'poll:results': (data: any) => void;
  'poll:state_sync': (data: any) => void;
  'poll:error': (error: string) => void;
}

export interface ClientToServerEvents {
  'teacher:create_poll': (data: { question: string; options: string[]; duration: number }, callback: (error?: string) => void) => void;
  'student:join': (data: { studentId: string }, callback: (error?: string) => void) => void;
  'student:vote': (data: { pollId: string; studentId: string; optionId: string }, callback: (error?: string) => void) => void;
  'request:state': (callback: (error?: string, data?: any) => void) => void;
}

export const setupPollSocket = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  console.log('⚡ Setting up Socket.io event handlers...');

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`\n📱 Client connected: ${socket.id}`);
    console.log(`👥 Total connected clients: ${io.engine.clientsCount}`);

    // Student joins (requests current poll state)
    socket.on('student:join', async (data, callback) => {
      console.log(`\n✋ Student joining: ${data.studentId} (Socket: ${socket.id})`);
      try {
        const activePoll = await pollService.getActivePoll();

        if (activePoll) {
          console.log(`📋 Active poll found: "${activePoll.question}"`);
          const results = await pollService.getPollResults(activePoll._id.toString());
          socket.emit('poll:state_sync', {
            poll: activePoll,
            results,
          });
          console.log(`✅ Poll state synced to student`);
        } else {
          console.log(`⏳ No active poll available`);
        }

        callback();
      } catch (error: any) {
        console.error('❌ Error in student:join:', error.message);
        callback(error.message);
      }
    });

    // Teacher creates a poll
    socket.on('teacher:create_poll', async (data, callback) => {
      console.log(`\n👨‍🏫 Teacher creating poll...`);
      console.log(`   Question: "${data.question}"`);
      console.log(`   Options: ${data.options.length}`);
      console.log(`   Duration: ${data.duration}s`);
      try {
        const poll = await pollService.createPoll(data);

        // Broadcast to all students that a new poll is available
        io.emit('poll:created', {
          _id: poll._id,
          question: poll.question,
          options: poll.options,
          duration: poll.duration,
          startTime: poll.startTime,
          remainingTime: poll.duration,
        });

        console.log(`✅ Poll created and broadcast to all clients`);
        callback();
      } catch (error: any) {
        console.error('❌ Error creating poll:', error.message);
        callback(error.message);
      }
    });

    // Student submits a vote
    socket.on('student:vote', async (data, callback) => {
      console.log(`\n🗳️ Vote received: ${data.studentId}`);
      try {
        const { pollId, studentId, optionId } = data;

        await pollService.submitVote(pollId, studentId, optionId);
        console.log(`✅ Vote recorded for option: ${optionId}`);

        // Get updated results
        const results = await pollService.getPollResults(pollId);

        // Broadcast updated results to all clients
        io.emit('poll:results', {
          pollId,
          results,
        });

        console.log(`📊 Results broadcast to all clients`);
        callback();
      } catch (error: any) {
        console.error('❌ Error voting:', error.message);
        callback(error.message);
      }
    });

    // Request current state (for reconnects)
    socket.on('request:state', async (callback) => {
      console.log(`\n🔄 State sync requested: ${socket.id}`);
      try {
        const activePoll = await pollService.getActivePoll();

        if (activePoll) {
          const results = await pollService.getPollResults(activePoll._id.toString());
          console.log(`✅ State provided to client`);
          callback(undefined, {
            poll: activePoll,
            results,
          });
        } else {
          console.log(`⏳ No active poll to sync`);
          callback(undefined, null);
        }
      } catch (error: any) {
        console.error('❌ Error in request:state:', error.message);
        callback(error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`\n📱 Client disconnected: ${socket.id}`);
      console.log(`👥 Remaining connected: ${io.engine.clientsCount}`);
    });
  });

  console.log('✅ Socket.io event handlers ready\n');
};
