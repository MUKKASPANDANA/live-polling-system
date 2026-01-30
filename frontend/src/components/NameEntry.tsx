import React, { useState } from 'react';

interface NameEntryProps {
  onStudentContinue: (name: string) => void;
  onTeacherContinue: () => void;
}

export const NameEntry: React.FC<NameEntryProps> = ({ onStudentContinue, onTeacherContinue }) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [studentName, setStudentName] = useState('');

  const handleContinue = () => {
    if (selectedRole === 'student' && studentName.trim()) {
      onStudentContinue(studentName);
    } else if (selectedRole === 'teacher') {
      onTeacherContinue();
    }
  };

  // If student is selected, show name entry page
  if (selectedRole && selectedRole === 'student') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          backgroundColor: '#6366f1',
          color: 'white',
          padding: '12px 30px',
          borderRadius: '30px',
          marginBottom: '40px',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          <span>✨</span>
          <span>Intervue Poll</span>
        </div>

        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
          Let's Get Started
        </h1>
        
        <p style={{ 
          fontSize: '14px', 
          color: '#666', 
          textAlign: 'center', 
          marginBottom: '40px',
          maxWidth: '500px'
        }}>
          If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
        </p>

        <div style={{ width: '100%', maxWidth: '400px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
            Enter your Name
          </label>
          <input
            type="text"
            placeholder="Rahul Bajaj"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
            style={{
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              width: '100%',
              boxSizing: 'border-box',
              marginBottom: '40px',
              fontSize: '14px',
              backgroundColor: '#f9f9f9'
            }}
            autoFocus
          />
        </div>

        <button
          onClick={handleContinue}
          disabled={!studentName.trim()}
          style={{
            padding: '12px 60px',
            backgroundColor: studentName.trim() ? '#6366f1' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: studentName.trim() ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          Continue
        </button>

        <button
          onClick={() => setSelectedRole(null)}
          style={{
            marginTop: '20px',
            backgroundColor: 'transparent',
            color: '#6366f1',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: 'underline'
          }}
        >
          Back
        </button>
      </div>
    );
  }

  // Role selection page
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        backgroundColor: '#6366f1',
        color: 'white',
        padding: '12px 30px',
        borderRadius: '30px',
        marginBottom: '40px',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        <span>✨</span>
        <span>Intervue Poll</span>
      </div>

      <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
        Welcome to the Live Polling System
      </h1>
      
      <p style={{ 
        fontSize: '16px', 
        color: '#999', 
        textAlign: 'center', 
        marginBottom: '60px',
        maxWidth: '600px'
      }}>
        Please select the role that best describes you to begin using the live polling system
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        marginBottom: '40px',
        maxWidth: '800px'
      }}>
        <div
          onClick={() => setSelectedRole('student')}
          style={{
            padding: '30px',
            border: selectedRole === 'student' ? '3px solid #6366f1' : '2px solid #ddd',
            borderRadius: '12px',
            cursor: 'pointer',
            backgroundColor: selectedRole === 'student' ? '#f0f4ff' : 'white',
            transition: 'all 0.3s ease'
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>I'm a Student</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
        </div>

        <div
          onClick={() => setSelectedRole('teacher')}
          style={{
            padding: '30px',
            border: selectedRole === 'teacher' ? '3px solid #6366f1' : '2px solid #ddd',
            borderRadius: '12px',
            cursor: 'pointer',
            backgroundColor: selectedRole === 'teacher' ? '#f0f4ff' : 'white',
            transition: 'all 0.3s ease'
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>I'm a Teacher</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>Submit answers and view live poll results in real-time.</p>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedRole}
        style={{
          padding: '12px 60px',
          backgroundColor: selectedRole ? '#6366f1' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          cursor: selectedRole ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        Continue
      </button>
    </div>
  );
};