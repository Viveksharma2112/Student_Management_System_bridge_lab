import React, { useState, useEffect } from 'react';

function StudentList({ onStudentSelect }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const url = search 
        ? `/api/students?search=${encodeURIComponent(search)}`
        : '/api/students';
      const response = await fetch(url);
      const data = await response.json();
      setStudents(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchStudents();
      } else {
        setError('Failed to delete student');
      }
    } catch (err) {
      setError('Failed to delete student');
    }
  };

  if (loading) return <div className="loading">Loading students...</div>;

  return (
    <div className="card">
      <h2>All Students</h2>
      
      {error && <div className="error">{error}</div>}

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Search by name, roll number, or class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <p>No students found. Add your first student!</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Roll No.</th>
              <th>Name</th>
              <th>Class</th>
              <th>Section</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.roll_number}</td>
                <td>{student.name}</td>
                <td>{student.class}</td>
                <td>{student.section || '-'}</td>
                <td>
                  <button 
                    className="btn btn-primary"
                    onClick={() => onStudentSelect(student)}
                  >
                    View Report
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(student.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StudentList;
