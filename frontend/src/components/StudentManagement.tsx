import React, { useState, useEffect, useRef } from 'react';

interface Student {
  id: string;
  name: string;
  joinedAt?: string;
}

interface StudentManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onRemoveStudent: (studentId: string) => Promise<void>;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  isOpen,
  onClose,
  onRemoveStudent,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students/connected', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      let studentsList: Student[] = [];
      if (Array.isArray(data)) {
        studentsList = data;
      } else if (data && typeof data === 'object') {
        studentsList = data.students || data.data || [];
      }

      if (Array.isArray(studentsList)) {
        setStudents(studentsList);
        setError('');
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Setup WebSocket for real-time updates
  const setupWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/students`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for student management');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'student_joined':
              setStudents((prev) => {
                const exists = prev.some((s) => s.id === message.student.id);
                if (!exists) {
                  return [...prev, message.student];
                }
                return prev;
              });
              break;

            case 'student_left':
              setStudents((prev) =>
                prev.filter((s) => s.id !== message.studentId)
              );
              break;

            case 'students_list':
              if (Array.isArray(message.students)) {
                setStudents(message.students);
              }
              break;

            case 'student_removed':
              setStudents((prev) =>
                prev.filter((s) => s.id !== message.studentId)
              );
              break;

            default:
              break;
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      };

      wsRef.current.onerror = () => {
        console.error('WebSocket error');
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Retry connection after 3 seconds
        setTimeout(setupWebSocket, 3000);
      };
    } catch (err) {
      console.error('WebSocket setup failed:', err);
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      setupWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen]);

  // Poll for updates every 5 seconds as fallback
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      fetchStudents();
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Remove ${studentName}?`)) {
      return;
    }

    try {
      await onRemoveStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setError('');
    } catch (err) {
      console.error('Failed to remove student:', err);
      setError('Failed to remove student');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Connected Students</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <div style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Total Connected</span>
            <span style={styles.statValue}>{students.length}</span>
          </div>
        </div>

        {loading && students.length === 0 ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div style={styles.emptyState}>
            <p>👥 No students connected yet</p>
            <p style={styles.emptySubtext}>
              Students will appear here when they join the session
            </p>
          </div>
        ) : (
          <div style={styles.studentsList}>
            {students.map((student) => (
              <div key={student.id} style={styles.studentCard}>
                <div style={styles.studentInfo}>
                  <div style={styles.avatar}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.studentDetails}>
                    <p style={styles.studentName}>{student.name}</p>
                    {student.joinedAt && (
                      <p style={styles.joinedTime}>
                        Joined: {new Date(student.joinedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  style={styles.removeBtn}
                  onClick={() => handleRemoveStudent(student.id, student.name)}
                  title="Remove student"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as React.CSSProperties,
  modalContent: {
    background: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '450px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
  } as React.CSSProperties,
  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background 0.2s',
  } as React.CSSProperties,
  errorMessage: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    margin: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
  } as React.CSSProperties,
  statsBar: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    background: '#f3f4f6',
    borderBottom: '1px solid #e5e7eb',
  } as React.CSSProperties,
  stat: {
    flex: 1,
    padding: '12px 16px',
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  statLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 600,
    marginBottom: '4px',
  },
  statValue: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 700,
    color: '#667eea',
  },
  studentsList: {
    flex: 1,
    overflow: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  studentCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  } as React.CSSProperties,
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '16px',
    flexShrink: 0,
  } as React.CSSProperties,
  studentDetails: {
    flex: 1,
  } as React.CSSProperties,
  studentName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0f172a',
    margin: '0',
  },
  joinedTime: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  removeBtn: {
    background: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
  } as React.CSSProperties,
  loadingState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '16px',
  } as React.CSSProperties,
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  } as React.CSSProperties,
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center' as const,
    color: '#6b7280',
  } as React.CSSProperties,
  emptySubtext: {
    fontSize: '13px',
    margin: '8px 0 0 0',
    color: '#9ca3af',
  },
};
