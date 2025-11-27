import React, { useState } from 'react';

function StudentForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    roll_number: '',
    name: '',
    class: '',
    section: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    if (!formData.roll_number || !formData.name || !formData.class) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Student added successfully!');
        setFormData({
          roll_number: '',
          name: '',
          class: '',
          section: ''
        });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(data.error || 'Failed to add student');
      }
    } catch (err) {
      setError('Failed to add student');
    }
  };

  return (
    <div className="card">
      <h2>Add New Student</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Roll Number *</label>
          <input
            type="text"
            name="roll_number"
            value={formData.roll_number}
            onChange={handleChange}
            placeholder="e.g., 101"
            required
          />
        </div>

        <div className="form-group">
          <label>Student Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label>Class *</label>
          <input
            type="text"
            name="class"
            value={formData.class}
            onChange={handleChange}
            placeholder="e.g., 10"
            required
          />
        </div>

        <div className="form-group">
          <label>Section</label>
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={handleChange}
            placeholder="e.g., A"
          />
        </div>

        <button type="submit" className="btn btn-success">
          Add Student
        </button>
      </form>
    </div>
  );
}

export default StudentForm;
