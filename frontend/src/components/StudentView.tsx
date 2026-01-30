import React, { useState, useEffect } from 'react';
import { usePoll } from '../context/PollContext';
import { usePollTimer } from '../hooks/usePollTimer';

export const StudentView: React.FC = () => {
  const { activePoll, submitVote, studentId, hasVoted, isConnected, results } = usePoll();
  const { formattedTime, isExpired } = usePollTimer(
    activePoll?.startTime || null,
    activePoll?.duration || null
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [showResults, setShowResults] = useState(false);

  // Track question changes
  useEffect(() => {
    if (activePoll) {
      const savedPollId = sessionStorage.getItem('currentPollId');
      if (savedPollId !== activePoll._id) {
        setQuestionNumber((prev) => prev + 1);
        setSelectedOption(null);
        setShowResults(false);
        sessionStorage.setItem('currentPollId', activePoll._id);
      }
    }
  }, [activePoll?._id]);

  // Show results after voting
  useEffect(() => {
    if (hasVoted && results && results.length > 0) {
      setShowResults(true);
    }
  }, [hasVoted, results]);

  if (!isConnected) {
    return (
      <div style={styles.waitingPage}>
        <div style={styles.loader} aria-label="waiting" />
        <h2 style={styles.waitingHeadline}>Wait for the teacher to ask questions..</h2>
      </div>
    );
  }

  if (!activePoll) {
    return (
      <div style={styles.waitingPage}>
        <div style={styles.loader} aria-label="waiting" />
        <h2 style={styles.waitingHeadline}>Wait for the teacher to ask questions..</h2>
      </div>
    );
  }

  const handleVote = async (optionId: string) => {
    if (!studentId || hasVoted || isExpired) return;

    setSelectedOption(optionId);
    setVoteError('');

    try {
      setIsVoting(true);
      await submitVote(activePoll._id, optionId);
    } catch (error: any) {
      setVoteError(error.message || 'Failed to vote');
      setSelectedOption(null);
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      handleVote(selectedOption);
    }
  };

  const totalVotes = results ? results.reduce((sum, r) => sum + r.count, 0) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.centerWrapper}>
        <div style={styles.headerRow}>
          <span style={styles.questionLabel}>Question {questionNumber}</span>
          <span style={styles.timer}>🕐 {formattedTime}</span>
        </div>

        <div style={styles.mainBox}>
          <div style={styles.questionBox}>
            <h2 style={styles.questionText}>{activePoll.question}</h2>
          </div>

          <div style={styles.divider}></div>

          {isExpired && !hasVoted && (
            <div style={styles.expiredMessage}>⏰ Poll has ended</div>
          )}

          {hasVoted && (
            <div style={styles.votedMessage}>✅ Your vote has been recorded</div>
          )}

          <div style={styles.optionsContainer}>
            {activePoll.options.map((option, index) => {
              const optionResults = results?.find((r) => r.id === option.id);
              const votes = optionResults?.count || 0;
              const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

              return (
                <div key={option.id}>
                  <button
                    onClick={() => setSelectedOption(option.id)}
                    disabled={hasVoted || isExpired}
                    style={{
                      ...styles.optionButton,
                      ...(selectedOption === option.id ? styles.optionButtonSelected : {}),
                      ...(hasVoted || isExpired ? styles.optionButtonDisabled : {}),
                    }}
                  >
                    <div style={styles.optionNumberCircle}>{index + 1}</div>
                    <span style={styles.optionText}>{option.text}</span>
                  </button>

                  {showResults && (
                    <div style={styles.resultBar}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${percentage}%`,
                        }}
                      />
                      <span style={styles.barPercentage}>{percentage}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {showResults && (
            <div style={styles.totalVotesBox}>
              Total Votes: <strong>{totalVotes}</strong>
            </div>
          )}
        </div>

        {voteError && <div style={styles.error}>{voteError}</div>}

        <div style={styles.submitContainer}>
          {!hasVoted && !isExpired && (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || isVoting}
              style={{
                ...styles.submitButton,
                opacity: !selectedOption || isVoting ? 0.6 : 1,
                cursor: !selectedOption || isVoting ? 'not-allowed' : 'pointer',
              }}
            >
              {isVoting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  // ...existing styles...
  resultBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
    height: '20px',
  } as React.CSSProperties,
  barFill: {
    height: '100%',
    background: '#667eea',
    borderRadius: '4px',
    minWidth: '2px',
    transition: 'width 0.3s ease',
  } as React.CSSProperties,
  barPercentage: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#0f172a',
    minWidth: '35px',
  },
  totalVotesBox: {
    padding: '12px 16px',
    background: '#f0f4ff',
    borderRadius: '6px',
    textAlign: 'center' as const,
    fontSize: '13px',
    color: '#0f172a',
    marginTop: '12px',
    borderTop: '1px solid #e5e7eb',
  } as React.CSSProperties,
  container: {
    minHeight: '100vh',
    background: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
  } as React.CSSProperties,
  centerWrapper: {
    width: '727px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
  } as React.CSSProperties,
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  } as React.CSSProperties,
  questionLabel: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
  },
  timer: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#ef4444',
  },
  mainBox: {
    border: '1px solid #e5e7eb',
    borderRadius: '9px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
  questionBox: {
    background: '#555555',
    color: 'white',
    padding: '12px 16px',
  } as React.CSSProperties,
  questionText: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  divider: {
    height: '1px',
    background: '#e5e7eb',
  } as React.CSSProperties,
  waitingPage: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '26px',
    background: '#ffffff',
    color: '#111827',
    padding: '40px 20px',
  } as React.CSSProperties,
  loader: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '6px solid #ece9ff',
    borderTopColor: '#6366f1',
    animation: 'spin 1s linear infinite',
  } as React.CSSProperties,
  waitingHeadline: {
    fontSize: '28px',
    fontWeight: 700,
    textAlign: 'center' as const,
    lineHeight: 1.3,
    margin: 0,
  },
  expiredMessage: {
    padding: '10px',
    background: '#fff3e0',
    color: '#e65100',
    margin: '12px 16px 0',
    borderRadius: '6px',
    textAlign: 'center' as const,
    fontSize: '13px',
    fontWeight: 700,
  },
  votedMessage: {
    padding: '10px',
    background: '#d4f0dd',
    color: '#1b7e34',
    margin: '12px 16px 0',
    borderRadius: '6px',
    textAlign: 'center' as const,
    fontSize: '13px',
    fontWeight: 700,
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
    padding: '16px',
    flex: 1,
    overflow: 'auto',
  },
  optionButton: {
    padding: '12px 14px',
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    color: '#0f172a',
    fontWeight: 500,
  } as React.CSSProperties,
  optionButtonSelected: {
    background: '#f0f4ff',
    border: '2px solid #667eea',
    color: '#0f172a',
  } as React.CSSProperties,
  optionButtonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.7,
  } as React.CSSProperties,
  optionNumberCircle: {
    width: '28px',
    height: '28px',
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
  optionText: {
    flex: 1,
    textAlign: 'left' as const,
  },
  error: {
    padding: '10px',
    background: '#ffebee',
    color: '#c62828',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '12px',
    marginTop: '12px',
  } as React.CSSProperties,
  submitContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '8px',
  } as React.CSSProperties,
  submitButton: {
    padding: '10px 40px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    fontWeight: 700,
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    cursor: 'pointer',
  } as React.CSSProperties,
};

// Inject keyframes
if (typeof document !== 'undefined') {
  const sheet = document.styleSheets[0] || ((): CSSStyleSheet => {
    const style = document.createElement('style');
    document.head.appendChild(style);
    return style.sheet as CSSStyleSheet;
  })();

  const hasSpin = Array.from(sheet.cssRules).some((rule) => {
    return (rule as CSSRule).cssText?.startsWith('@keyframes spin');
  });

  if (!hasSpin) {
    sheet.insertRule('@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }', sheet.cssRules.length);
  }
}