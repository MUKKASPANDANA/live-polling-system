import { FC } from 'react';
import { usePoll } from '../context/PollContext';
import { usePollTimer } from '../hooks/usePollTimer';

export const PollResults: FC = () => {
  const { activePoll, results } = usePoll();
  const { formattedTime, isExpired } = usePollTimer(
    activePoll?.startTime || null,
    activePoll?.duration || null
  );

  if (!activePoll || !results) {
    return null;
  }

  const totalVotes = results.reduce((sum, r) => sum + r.count, 0);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📊 Live Results</h2>
        <p style={styles.question}>{activePoll.question}</p>

        <div style={styles.timerBox}>
          <div style={{ ...styles.timer, color: isExpired ? '#ff6b6b' : '#667eea' }}>
            {formattedTime}
          </div>
        </div>

        <div style={styles.resultsContainer}>
          {results.map((result) => (
            <div key={result.optionId} style={styles.resultItem}>
              <div style={styles.resultLabel}>
                <span style={styles.optionText}>{result.text}</span>
                <span style={styles.votes}>
                  {result.count} {result.count === 1 ? 'vote' : 'votes'}
                </span>
              </div>
              <div style={styles.barContainer}>
                <div
                  style={{
                    ...styles.bar,
                    width: `${result.percentage}%`,
                  }}
                >
                  {result.percentage > 10 && (
                    <span style={styles.percentage}>{result.percentage}%</span>
                  )}
                </div>
                {result.percentage <= 10 && (
                  <span style={styles.percentageOutside}>{result.percentage}%</span>
                )}
              </div>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  } as React.CSSProperties,
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '0 auto',
  } as React.CSSProperties,
  title: {
    margin: '0 0 10px 0',
    color: '#333',
    fontSize: '24px',
  },
  question: {
    margin: '0 0 20px 0',
    color: '#666',
    fontSize: '16px',
  },
  timerBox: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '25px',
  } as React.CSSProperties,
  timer: {
    fontSize: '32px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    marginBottom: '25px',
  },
  resultItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  } as React.CSSProperties,
  resultLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  optionText: {
    fontWeight: 'bold',
    color: '#333',
  },
  votes: {
    fontSize: '12px',
    color: '#999',
  } as React.CSSProperties,
  barContainer: {
    position: 'relative' as const,
    background: '#f0f0f0',
    borderRadius: '6px',
    height: '30px',
    overflow: 'hidden',
  } as React.CSSProperties,
  bar: {
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'width 0.3s ease',
  } as React.CSSProperties,
  percentage: {
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
  } as React.CSSProperties,
  percentageOutside: {
    marginLeft: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#333',
  } as React.CSSProperties,
  stats: {
    display: 'flex',
    gap: '15px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
  } as React.CSSProperties,
  statBox: {
    flex: 1,
    textAlign: 'center' as const,
    padding: '15px',
    background: '#f5f5f5',
    borderRadius: '8px',
  } as React.CSSProperties,
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
  },
};
