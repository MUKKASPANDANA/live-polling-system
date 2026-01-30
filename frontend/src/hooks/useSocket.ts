import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface PollData {
  _id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  duration: number;
  startTime: string;
  remainingTime?: number;
}

interface VoteResult {
  optionId: string;
  text: string;
  count: number;
  percentage: number;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  activePoll: PollData | null;
  results: VoteResult[] | null;
  createPoll: (data: { question: string; options: string[]; duration: number }) => Promise<void>;
  submitVote: (pollId: string, studentId: string, optionId: string) => Promise<void>;
  joinStudent: (studentId: string) => Promise<void>;
  requestStateSync: () => Promise<{ poll: PollData; results: VoteResult[] } | null>;
  error: string | null;
}

export const useSocket = (serverUrl: string = 'http://localhost:5000'): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activePoll, setActivePoll] = useState<PollData | null>(null);
  const [results, setResults] = useState<VoteResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('poll:created', (data: PollData) => {
      console.log('📋 New poll created:', data);
      setActivePoll(data);
      setResults(null);
      setError(null);
    });

    newSocket.on('poll:state_sync', (data: { poll: PollData; results: VoteResult[] }) => {
      console.log('🔄 Poll state synced:', data);
      setActivePoll(data.poll);
      setResults(data.results);
    });

    newSocket.on('poll:results', (data: { pollId: string; results: VoteResult[] }) => {
      console.log('📊 Poll results updated:', data);
      setResults(data.results);
    });

    newSocket.on('poll:error', (errorMsg: string) => {
      console.error('⚠️ Socket error:', errorMsg);
      setError(errorMsg);
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('❌ Connection error:', error.message);
      setError(`Connection error: ${error.message}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [serverUrl]);

  const createPoll = useCallback(
    async (data: { question: string; options: string[]; duration: number }): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current) {
          reject(new Error('Socket not connected'));
          return;
        }

        socketRef.current.emit('teacher:create_poll', data, (error?: string) => {
          if (error) {
            setError(error);
            reject(new Error(error));
          } else {
            resolve();
          }
        });
      });
    },
    []
  );

  const submitVote = useCallback(
    async (pollId: string, studentId: string, optionId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current) {
          reject(new Error('Socket not connected'));
          return;
        }

        socketRef.current.emit('student:vote', { pollId, studentId, optionId }, (error?: string) => {
          if (error) {
            setError(error);
            reject(new Error(error));
          } else {
            resolve();
          }
        });
      });
    },
    []
  );

  const joinStudent = useCallback((studentId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('student:join', { studentId }, (error?: string) => {
        if (error) {
          setError(error);
          reject(new Error(error));
        } else {
          resolve();
        }
      });
    });
  }, []);

  const requestStateSync = useCallback((): Promise<{ poll: PollData; results: VoteResult[] } | null> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('request:state', (error?: string, data?: any) => {
        if (error) {
          setError(error);
          reject(new Error(error));
        } else {
          if (data) {
            setActivePoll(data.poll);
            setResults(data.results);
          }
          resolve(data || null);
        }
      });
    });
  }, []);

  return {
    socket,
    isConnected,
    activePoll,
    results,
    createPoll,
    submitVote,
    joinStudent,
    requestStateSync,
    error,
  };
};
