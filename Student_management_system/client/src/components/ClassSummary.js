import React, { useState, useEffect } from 'react';

function ClassSummary() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/class-summary');
      const data = await response.json();
      setSummary(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch class summary');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="loading">Loading class summary...</div>;
  if (error) return <div className="error">{error}</div>;

  // Calculate class statistics
  const totalStudents = summary.length;
  const studentsWithResults = summary.filter(s => s.subjectCount > 0);
  const avgPercentage = studentsWithResults.length > 0
    ? (studentsWithResults.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / studentsWithResults.length).toFixed(2)
    : 0;

  const gradeCount = summary.reduce((acc, s) => {
    acc[s.grade] = (acc[s.grade] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <button className="btn btn-primary print-button" onClick={handlePrint}>
        🖨️ Print Summary
      </button>

      <div className="card">
        <h2>📊 Class Summary</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{totalStudents}</h3>
            <p>Total Students</p>
          </div>
          <div className="stat-card">
            <h3>{studentsWithResults.length}</h3>
            <p>Students with Results</p>
          </div>
          <div className="stat-card">
            <h3>{avgPercentage}%</h3>
            <p>Class Average</p>
          </div>
          <div className="stat-card">
            <h3>{gradeCount['A+'] || 0}</h3>
            <p>A+ Grades</p>
          </div>
        </div>

        {summary.length === 0 ? (
          <div className="empty-state">
            <p>No students in the system yet.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Name</th>
                <th>Class</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Subjects</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(student => (
                <tr key={student.id}>
                  <td>{student.roll_number}</td>
                  <td>{student.name}</td>
                  <td>{student.class} {student.section}</td>
                  <td>
                    {student.subjectCount > 0 
                      ? `${student.totalMarks}/${student.totalMaxMarks}`
                      : '-'
                    }
                  </td>
                  <td>
                    {student.subjectCount > 0 
                      ? `${student.percentage}%`
                      : '-'
                    }
                  </td>
                  <td>
                    {student.subjectCount > 0 
                      ? <span className={`grade-badge grade-${student.grade.replace('+', '\\+')}`}>
                          {student.grade}
                        </span>
                      : '-'
                    }
                  </td>
                  <td>{student.subjectCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ClassSummary;
