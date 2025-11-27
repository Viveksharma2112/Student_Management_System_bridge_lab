import React, { useState, useEffect } from 'react';

function ResultForm({ onSuccess }) {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    student_id: '',
    subject: '',
    marks: '',
    max_marks: '100',
    exam_name: '',
    exam_date: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError('Failed to fetch students');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.student_id || !formData.subject || !formData.marks || !formData.exam_name) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/students/${formData.student_id}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: formData.subject,
          marks: parseInt(formData.marks),
          max_marks: parseInt(formData.max_marks),
          exam_name: formData.exam_name,
          exam_date: formData.exam_date
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Result added successfully!');
        setFormData({
          student_id: '',
          subject: '',
          marks: '',
          max_marks: '100',
          exam_name: '',
          exam_date: ''
        });
      } else {
        setError(data.error || 'Failed to add result');
      }
    } catch (err) {
      setError('Failed to add result');
    }
  };

  return (
    <div className="card">
      <h2>Add Student Result</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Student *</label>
          <select
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Student --</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.roll_number} - {student.name} (Class {student.class})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Subject *</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g., Mathematics"
            required
          />
        </div>

        <div className="form-group">
          <label>Marks Obtained *</label>
          <input
            type="number"
            name="marks"
            value={formData.marks}
            onChange={handleChange}
            placeholder="e.g., 85"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Maximum Marks *</label>
          <input
            type="number"
            name="max_marks"
            value={formData.max_marks}
            onChange={handleChange}
            placeholder="e.g., 100"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Exam Name *</label>
          <input
            type="text"
            name="exam_name"
            value={formData.exam_name}
            onChange={handleChange}
            placeholder="e.g., Mid Term 2024"
            required
          />
        </div>

        <div className="form-group">
          <label>Exam Date</label>
          <input
            type="date"
            name="exam_date"
            value={formData.exam_date}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-success">
          Add Result
        </button>
      </form>
    </div>
  );
}

export default ResultForm;
