import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

interface PollData {
  _id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  duration: number;
  startTime: string;
  remainingTime?: number;
}

interface VoteResult {
  id: string;
  optionId: string;
  text: string;
  count: number;
  percentage: number;
}

interface PollContextType {
  studentId: string | null;
  setStudentId: (id: string) => void;
  isTeacher: boolean;
  setIsTeacher: (val: boolean) => void;
  activePoll: PollData | null;
  results: VoteResult[] | null;
  createPoll: (data: { question: string; options: string[]; duration: number }) => Promise<void>;
  submitVote: (pollId: string, optionId: string) => Promise<void>;
  isConnected: boolean;
  error: string | null;
  hasVoted: boolean;
  setHasVoted: (val: boolean) => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentId, setStudentId] = useState<string | null>(() => {
    return sessionStorage.getItem('studentId');
  });
  const [isTeacher, setIsTeacher] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const { activePoll, results: socketResults, createPoll, submitVote, joinStudent, requestStateSync, isConnected, error } = useSocket(
    'http://localhost:5000'
  );

  const results = socketResults?.map(result => ({
    id: result.optionId,
    optionId: result.optionId,
    text: result.text,
    count: result.count,
    percentage: result.percentage,
  })) || null;

  // Sync state and join when connection is ready
  useEffect(() => {
    if (!isConnected) return;

    const syncState = async () => {
      try {
        await requestStateSync();
        if (studentId) {
          await joinStudent(studentId);
        }
      } catch (syncError) {
        console.error('Failed to sync poll state:', syncError);
      }
    };

    syncState();
  }, [isConnected, studentId, requestStateSync, joinStudent]);

  const handleCreatePoll = useCallback(
    async (data: { question: string; options: string[]; duration: number }) => {
      await createPoll(data);
    },
    [createPoll]
  );

  // Reset vote status whenever a new poll arrives
  useEffect(() => {
    if (activePoll) {
      setHasVoted(false);
    }
  }, [activePoll]);

  const handleSubmitVote = useCallback(
    async (pollId: string, optionId: string) => {
      if (!studentId) throw new Error('No student ID');
      await submitVote(pollId, studentId, optionId);
      setHasVoted(true);
    },
    [studentId, submitVote]
  );

  return (
    <PollContext.Provider
      value={{
        studentId,
        setStudentId,
        isTeacher,
        setIsTeacher,
        activePoll,
        results,
        createPoll: handleCreatePoll,
        submitVote: handleSubmitVote,
        isConnected,
        error,
        hasVoted,
        setHasVoted,
      }}
    >
      {children}
    </PollContext.Provider>
  );
};

export const usePoll = (): PollContextType => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePoll must be used within PollProvider');
  }
  return context;
};
