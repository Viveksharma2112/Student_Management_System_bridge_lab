import React, { useState, useEffect } from 'react';

function ReportCard({ studentId, onBack }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [studentId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students/${studentId}/report`);
      const data = await response.json();
      setReport(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch report card');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) {
      return;
    }

    try {
      const response = await fetch(`/api/results/${resultId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchReport();
      } else {
        setError('Failed to delete result');
      }
    } catch (err) {
      setError('Failed to delete result');
    }
  };

  if (loading) return <div className="loading">Loading report card...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!report) return <div className="error">No data found</div>;

  const { student, results, statistics } = report;

  return (
    <div>
      <button className="btn btn-secondary print-button" onClick={onBack}>
        ← Back to Students
      </button>
      <button className="btn btn-primary print-button" onClick={handlePrint}>
        🖨️ Print Report Card
      </button>

      <div className="card">
        <h2>📄 Student Report Card</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{student.roll_number}</h3>
            <p>Roll Number</p>
          </div>
          <div className="stat-card">
            <h3>{student.name}</h3>
            <p>Student Name</p>
          </div>
          <div className="stat-card">
            <h3>{student.class} {student.section}</h3>
            <p>Class & Section</p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="empty-state">
            <p>No results available for this student yet.</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Exam</th>
                  <th>Marks Obtained</th>
                  <th>Maximum Marks</th>
                  <th>Percentage</th>
                  <th className="print-button">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => (
                  <tr key={result.id}>
                    <td>{result.subject}</td>
                    <td>{result.exam_name}</td>
                    <td>{result.marks}</td>
                    <td>{result.max_marks}</td>
                    <td>{((result.marks / result.max_marks) * 100).toFixed(1)}%</td>
                    <td className="print-button">
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteResult(result.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="stats-grid" style={{ marginTop: '30px' }}>
              <div className="stat-card">
                <h3>{statistics.totalMarks}/{statistics.totalMaxMarks}</h3>
                <p>Total Marks</p>
              </div>
              <div className="stat-card">
                <h3>{statistics.percentage}%</h3>
                <p>Overall Percentage</p>
              </div>
              <div className="stat-card">
                <h3>{statistics.average}</h3>
                <p>Average Marks</p>
              </div>
              <div className="stat-card">
                <h3>{statistics.grade}</h3>
                <p>Grade</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportCard;
