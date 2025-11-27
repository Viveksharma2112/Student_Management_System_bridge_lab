import React, { useState } from 'react';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import ResultForm from './components/ResultForm';
import ReportCard from './components/ReportCard';
import ClassSummary from './components/ClassSummary';

function App() {
  const [activeView, setActiveView] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view !== 'report') {
      setSelectedStudent(null);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setActiveView('report');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>📚 Student Result Management System</h1>
        <p>Manage students, results, and generate report cards</p>
      </div>

      <div className="nav">
        <button 
          className={activeView === 'students' ? 'active' : ''}
          onClick={() => handleViewChange('students')}
        >
          👥 Students
        </button>
        <button 
          className={activeView === 'add-student' ? 'active' : ''}
          onClick={() => handleViewChange('add-student')}
        >
          ➕ Add Student
        </button>
        <button 
          className={activeView === 'add-result' ? 'active' : ''}
          onClick={() => handleViewChange('add-result')}
        >
          📝 Add Result
        </button>
        <button 
          className={activeView === 'summary' ? 'active' : ''}
          onClick={() => handleViewChange('summary')}
        >
          📊 Class Summary
        </button>
      </div>

      {activeView === 'students' && (
        <StudentList onStudentSelect={handleStudentSelect} />
      )}
      
      {activeView === 'add-student' && (
        <StudentForm onSuccess={() => handleViewChange('students')} />
      )}
      
      {activeView === 'add-result' && (
        <ResultForm onSuccess={() => handleViewChange('students')} />
      )}
      
      {activeView === 'report' && selectedStudent && (
        <ReportCard studentId={selectedStudent.id} onBack={() => handleViewChange('students')} />
      )}
      
      {activeView === 'summary' && (
        <ClassSummary />
      )}
    </div>
  );
}

export default App;
