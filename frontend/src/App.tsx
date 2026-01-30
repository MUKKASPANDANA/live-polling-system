import React, { useEffect } from 'react';
import { NameEntry } from './components/NameEntry';
import { StudentView } from './components/StudentView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { usePoll } from './context/PollContext';

const AppContent: React.FC = () => {
  const { studentId, setStudentId, isTeacher, setIsTeacher } = usePoll();

  useEffect(() => {
    const savedStudentId = sessionStorage.getItem('studentId');
    const savedIsTeacher = sessionStorage.getItem('isTeacher');
    
    if (savedStudentId) {
      setStudentId(savedStudentId);
    }
    if (savedIsTeacher === 'true') {
      setIsTeacher(true);
    }
  }, [setStudentId, setIsTeacher]);

  if (!studentId && !isTeacher) {
    return (
      <NameEntry
        onStudentContinue={(name: string) => {
          setIsTeacher(false);
          setStudentId(name);
          sessionStorage.setItem('studentId', name);
          sessionStorage.setItem('isTeacher', 'false');
        }}
        onTeacherContinue={() => {
          setIsTeacher(true);
          sessionStorage.setItem('isTeacher', 'true');
          sessionStorage.removeItem('studentId');
        }}
      />
    );
  }

  if (isTeacher) {
    return <TeacherDashboard />;
  }

  return <StudentView />;
};

export default AppContent;