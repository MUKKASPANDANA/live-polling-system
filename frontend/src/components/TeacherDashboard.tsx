import React, { useState, useEffect } from 'react';
import { usePoll } from '../context/PollContext';
import { usePollTimer } from '../hooks/usePollTimer';
import { StudentManagement } from './StudentManagement';

interface PollHistory {
  id: string;
  question: string;
  options: Array<{ text: string; count: number }>;
  totalVotes: number;
  startTime?: number;
  duration?: number;
}

export const TeacherDashboard: React.FC = () => {
  const { createPoll, isConnected, activePoll, results } = usePoll();
  const { formattedTime, isExpired } = usePollTimer(
    activePoll?.startTime || null,
    activePoll?.duration || null
  );
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState('30');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [pollHistory, setPollHistory] = useState<PollHistory[]>([]);
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const maxQuestionLength = 100;

  // Clear poll history on component mount (page load)
  useEffect(() => {
    // Clear localStorage on component mount
    localStorage.removeItem('pollHistory');
    setPollHistory([]);
  }, []);

  // Handle page unload - clear history when teacher closes/leaves
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Clear poll history from localStorage
      localStorage.removeItem('pollHistory');
      
      // Optional: Show confirmation message
      event.preventDefault();
      event.returnValue = '';
    };

    const handleUnload = () => {
      // Clear poll history when page is actually closed/unloaded
      localStorage.removeItem('pollHistory');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  // Update poll history when results change
  useEffect(() => {
    if (activePoll && results && pollHistory.length > 0) {
      const updatedHistory = pollHistory.map((poll) => {
        if (poll.question === activePoll.question) {
          const totalVotes = results.reduce((sum, r) => sum + r.count, 0);
          return {
            ...poll,
            options: results.map((r) => ({ text: r.text, count: r.count })),
            totalVotes: totalVotes,
          };
        }
        return poll;
      });
      setPollHistory(updatedHistory);
      localStorage.setItem('pollHistory', JSON.stringify(updatedHistory));
    }
  }, [results, activePoll, pollHistory]);

  // Fetch student count
  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const response = await fetch('/api/students/connected');
        if (response.ok) {
          const data = await response.json();
          let count = 0;
          
          if (Array.isArray(data)) {
            count = data.length;
          } else if (data && typeof data === 'object') {
            const students = data.students || data.data || [];
            count = Array.isArray(students) ? students.length : 0;
          }
          
          setStudentCount(count);
        }
      } catch (error) {
        console.error('Failed to fetch student count:', error);
      }
    };

    fetchStudentCount();
    const interval = setInterval(fetchStudentCount, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      setCorrectAnswers(correctAnswers.filter((i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const toggleCorrectAnswer = (index: number, isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers([...correctAnswers, index]);
    } else {
      setCorrectAnswers(correctAnswers.filter((i) => i !== index));
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!question.trim()) {
      setCreateError('Question is required');
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      setCreateError('At least 2 options are required');
      return;
    }

    if (!duration || parseInt(duration) < 1) {
      setCreateError('Duration must be at least 1 second');
      return;
    }

    try {
      setIsCreating(true);
      await createPoll({
        question: question.trim(),
        options: validOptions,
        duration: parseInt(duration),
      });

      const newPoll: PollHistory = {
        id: Date.now().toString(),
        question: question.trim(),
        options: validOptions.map(text => ({ text, count: 0 })),
        totalVotes: 0,
        startTime: Date.now(),
        duration: parseInt(duration),
      };

      const updated = [newPoll, ...pollHistory];
      setPollHistory(updated);
      localStorage.setItem('pollHistory', JSON.stringify(updated));

      setQuestion('');
      setOptions(['', '']);
      setDuration('30');
      setCorrectAnswers([]);
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create poll');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}/remove`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to remove student`);
      }

      setStudentCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to remove student:', error);
      throw error;
    }
  };

  // Clear all polls manually
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all poll history? This cannot be undone.')) {
      setPollHistory([]);
      localStorage.removeItem('pollHistory');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.brandPill}>
          <span style={styles.brandIcon}>✨</span>
          Intervue Poll
        </div>
        <h1 style={styles.heading}>Let's <span style={styles.headingAccent}>Get Started</span></h1>
        <p style={styles.subheading}>
          you'll have the ability to create and manage polls, ask questions, and monitor
          your students' responses in real-time.
        </p>
      </div>

      <form onSubmit={handleCreatePoll} style={styles.formCard}>
        <div style={styles.questionRow}>
          <div style={styles.questionLabel}>Enter your question</div>
          <div style={styles.durationSelect}>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={styles.durationDropdown}
            >
              <option value="30">30 seconds</option>
              <option value="45">45 seconds</option>
              <option value="60">60 seconds</option>
              <option value="90">90 seconds</option>
            </select>
          </div>
        </div>

        <div style={styles.textareaWrapper}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, maxQuestionLength))}
            placeholder="Type your question here"
            style={styles.textarea}
            maxLength={maxQuestionLength}
          />
          <span style={styles.charCount}>{question.length}/{maxQuestionLength}</span>
        </div>

        <div style={styles.optionsSection}>
          <div style={styles.optionsHeader}>
            <div style={styles.optionsTitle}>Edit Options</div>
            <div style={styles.correctTitle}>Is it Correct?</div>
          </div>

          <div style={styles.optionsList}>
            {options.map((option, index) => (
              <div key={index} style={styles.optionRowLine}>
                <div style={styles.optionNumber}>{index + 1}</div>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  style={styles.optionInput}
                />
                <div style={styles.optionRadios}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name={`opt-${index}`}
                      checked={correctAnswers.includes(index)}
                      onChange={() => toggleCorrectAnswer(index, true)}
                      style={styles.radio}
                    />
                    Yes
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name={`opt-${index}`}
                      checked={!correctAnswers.includes(index)}
                      onChange={() => toggleCorrectAnswer(index, false)}
                      style={styles.radio}
                    />
                    No
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.addRow}>
          <button type="button" onClick={handleAddOption} style={styles.addButton}>
            + Add More option
          </button>
          {options.length > 2 && (
            <button type="button" onClick={() => handleRemoveOption(options.length - 1)} style={styles.removeLast}>
              Remove last
            </button>
          )}
        </div>

        {createError && <div style={styles.error}>{createError}</div>}

        <div style={styles.footerRow}>
          <div style={styles.footerLeft}>
            <div style={styles.connectionText}>
              {isConnected ? '✅ Connected to students' : '❌ Not connected'}
            </div>
            <button
              type="button"
              onClick={() => setShowStudentManagement(true)}
              style={styles.participantsButton}
            >
              👥 Participants ({studentCount})
            </button>
          </div>
          <button
            type="submit"
            style={{
              ...styles.askButton,
              opacity: isCreating || !isConnected ? 0.7 : 1,
              cursor: isCreating || !isConnected ? 'not-allowed' : 'pointer',
            }}
            disabled={isCreating || !isConnected}
          >
            {isCreating ? 'Posting...' : 'Ask Question'}
          </button>
        </div>
      </form>

      {/* Student Management Modal */}
      <StudentManagement
        isOpen={showStudentManagement}
        onClose={() => setShowStudentManagement(false)}
        onRemoveStudent={handleRemoveStudent}
      />

      {/* Poll History */}
      {pollHistory.length > 0 && (
        <div style={styles.historySection}>
          <div style={styles.historyHeader}>
            <h2 style={styles.historyTitle}>📊 View Poll History</h2>
            <button
              onClick={handleClearHistory}
              style={styles.clearHistoryButton}
              title="Clear all poll history"
            >
              🗑️ Clear History
            </button>
          </div>

          {pollHistory.map((poll, pollIndex) => {
            const isActivePoll = activePoll?.question === poll.question;
            const displayResults = isActivePoll && results ? results : poll.options;
            const totalVotes = isActivePoll && results 
              ? results.reduce((sum, r) => sum + r.count, 0) 
              : poll.totalVotes;
            
            return (
              <div key={poll.id} style={styles.historyCard}>
                <div style={styles.pollHeader}>
                  <h3 style={styles.historyQuestion}>Question {pollIndex + 1}</h3>
                  {isActivePoll && (
                    <div style={styles.liveIndicator}>🔴 LIVE</div>
                  )}
                </div>
                
                <div style={styles.historyQuestionBox}>
                  <p style={styles.historyQuestionText}>{poll.question}</p>
                </div>

                {isActivePoll && (
                  <div style={styles.timerBox}>
                    <div style={{ ...styles.timer, color: isExpired ? '#ff6b6b' : '#667eea' }}>
                      {formattedTime}
                    </div>
                  </div>
                )}

                <div style={styles.resultsContainer}>
                  {displayResults.map((item, optIndex) => {
                    const count = item.count || 0;
                    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const text = item.text;
                    
                    return (
                      <div key={optIndex} style={styles.resultRow}>
                        <div style={styles.resultLabel}>
                          <span style={styles.resultCircle}>{optIndex + 1}</span>
                          <span style={styles.resultText}>{text}</span>
                          {!isActivePoll && (
                            <span style={styles.voteCount}>{count} {count === 1 ? 'vote' : 'votes'}</span>
                          )}
                        </div>
                        <div style={styles.barContainer}>
                          <div
                            style={{
                              ...styles.barFill,
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                        <span style={styles.percentage}>{percentage}%</span>
                      </div>
                    );
                  })}
                </div>

                {isActivePoll && (
                  <div style={styles.stats}>
                    <div style={styles.statBox}>
                      <div style={styles.statValue}>{totalVotes}</div>
                      <div style={styles.statLabel}>Total Votes</div>
                    </div>
                    {isExpired && (
                      <div style={styles.statBox}>
                        <div style={styles.statValue}>✅</div>
                        <div style={styles.statLabel}>Poll Ended</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    background: '#ffffff',
    minHeight: '100vh',
    padding: '40px 20px 80px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '40px',
  } as React.CSSProperties,
  hero: {
    maxWidth: '616px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  brandPill: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#6366f1',
    color: '#fff',
    padding: '10px 24px',
    borderRadius: '999px',
    fontWeight: 700,
    fontSize: '14px',
    boxShadow: '0 6px 18px rgba(99, 102, 241, 0.18)',
    margin: '0 auto',
  } as React.CSSProperties,
  brandIcon: {
    fontSize: '16px',
  },
  heading: {
    fontSize: '40px',
    lineHeight: 1.2,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  headingAccent: {
    color: '#0f172a',
  },
  subheading: {
    fontSize: '16px',
    color: '#4b5563',
    margin: 0,
  },
  formCard: {
    background: 'transparent',
    maxWidth: '616px',
    margin: '0 auto',
    padding: '0',
    borderRadius: '0',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    width: '100%',
  } as React.CSSProperties,
  questionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  } as React.CSSProperties,
  questionLabel: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
    whiteSpace: 'nowrap' as const,
  },
  durationSelect: {
    minWidth: '140px',
  } as React.CSSProperties,
  durationDropdown: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#f4f4f6',
    fontSize: '14px',
    fontWeight: 600,
    color: '#111827',
  } as React.CSSProperties,
  textareaWrapper: {
    position: 'relative' as const,
  },
  textarea: {
    width: '100%',
    minHeight: '140px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    background: '#f3f4f6',
    padding: '16px',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    outline: 'none',
  } as React.CSSProperties,
  charCount: {
    position: 'absolute' as const,
    bottom: '12px',
    right: '16px',
    fontSize: '12px',
    color: '#6b7280',
  },
  optionsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  optionsHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 120px',
    alignItems: 'center',
    fontWeight: 700,
    color: '#0f172a',
    fontSize: '16px',
  } as React.CSSProperties,
  optionsTitle: {
    textAlign: 'left' as const,
  },
  correctTitle: {
    textAlign: 'center' as const,
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  optionRowLine: {
    display: 'grid',
    gridTemplateColumns: '48px 1fr 120px',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,
  optionNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: '#ede9fe',
    color: '#6366f1',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
    fontSize: '14px',
  } as React.CSSProperties,
  optionInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#f5f5f7',
    fontSize: '14px',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  optionRadios: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  } as React.CSSProperties,
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#4b5563',
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,
  radio: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  addRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'flex-start',
  } as React.CSSProperties,
  addButton: {
    padding: '10px 16px',
    background: 'transparent',
    border: '2px dashed #6366f1',
    borderRadius: '8px',
    fontWeight: 700,
    color: '#6366f1',
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,
  removeLast: {
    padding: '10px 14px',
    background: '#fff1f2',
    border: '1px solid #fecdd3',
    color: '#b91c1c',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
  } as React.CSSProperties,
  error: {
    padding: '12px',
    background: '#ffebee',
    color: '#c62828',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
  } as React.CSSProperties,
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '12px',
  } as React.CSSProperties,
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  } as React.CSSProperties,
  connectionText: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: 600,
  },
  participantsButton: {
    padding: '10px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  } as React.CSSProperties,
  askButton: {
    padding: '12px 32px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '16px',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    cursor: 'pointer',
  } as React.CSSProperties,
  historySection: {
    maxWidth: '616px',
    margin: '0 auto',
    width: '100%',
  } as React.CSSProperties,
  historyHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '12px',
  } as React.CSSProperties,
  historyTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 0,
    margin: 0,
  },
  clearHistoryButton: {
    padding: '8px 16px',
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecdd3',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s',
  } as React.CSSProperties,
  historyCard: {
    marginBottom: '24px',
  } as React.CSSProperties,
  pollHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  } as React.CSSProperties,
  historyQuestion: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '0px',
  },
  liveIndicator: {
    background: '#ff4444',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
  } as React.CSSProperties,
  historyQuestionBox: {
    background: '#555555',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '12px',
  } as React.CSSProperties,
  historyQuestionText: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 600,
  },
  timerBox: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px',
  } as React.CSSProperties,
  timer: {
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
  },
  resultRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,
  resultLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '140px',
    fontSize: '13px',
  } as React.CSSProperties,
  resultText: {
    flex: 1,
  },
  resultCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '12px',
    flexShrink: 0,
  } as React.CSSProperties,
  voteCount: {
    marginLeft: 'auto',
    fontSize: '12px',
    color: '#667eea',
    fontWeight: 600,
  } as React.CSSProperties,
  barContainer: {
    flex: 1,
    height: '24px',
    background: '#f0f0f0',
    borderRadius: '6px',
    overflow: 'hidden',
  } as React.CSSProperties,
  barFill: {
    height: '100%',
    background: '#667eea',
    transition: 'width 0.3s ease',
  } as React.CSSProperties,
  percentage: {
    width: '40px',
    textAlign: 'right' as const,
    fontSize: '13px',
    fontWeight: 600,
    color: '#0f172a',
  },
  stats: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
  } as React.CSSProperties,
  statBox: {
    flex: 1,
    textAlign: 'center' as const,
    padding: '12px',
    background: '#f5f5f5',
    borderRadius: '8px',
  } as React.CSSProperties,
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
  },
};