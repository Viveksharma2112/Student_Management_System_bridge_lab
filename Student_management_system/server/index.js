const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// JSON file database
const DATA_FILE = path.join(__dirname, 'database.json');

// Initialize data structure
let data = {
  students: [],
  results: [],
  nextStudentId: 1,
  nextResultId: 1
};

// Load or create database
if (fs.existsSync(DATA_FILE)) {
  data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log('✓ Database loaded');
} else {
  // Create sample data
  const students = [
    { id: 1, roll_number: '101', name: 'John Doe', class: '10', section: 'A' },
    { id: 2, roll_number: '102', name: 'Jane Smith', class: '10', section: 'A' },
    { id: 3, roll_number: '103', name: 'Mike Johnson', class: '10', section: 'B' },
    { id: 4, roll_number: '104', name: 'Sarah Williams', class: '10', section: 'A' }
  ];

  const subjects = ['Math', 'Science', 'English', 'History', 'Geography'];
  const results = [];
  let resultId = 1;

  for (let studentId = 1; studentId <= 2; studentId++) {
    subjects.forEach(subject => {
      const marks = Math.floor(Math.random() * 30) + 70;
      results.push({
        id: resultId++,
        student_id: studentId,
        subject,
        marks,
        max_marks: 100,
        exam_name: 'Mid Term 2024',
        exam_date: '2024-11-01'
      });
    });
  }

  data = {
    students,
    results,
    nextStudentId: 5,
    nextResultId: resultId
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log('✓ Sample data created');
}

// Save data to file
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ============ API ROUTES ============

// Get all students (with optional search)
app.get('/api/students', (req, res) => {
  try {
    const search = req.query.search || '';
    let students = data.students;
    
    if (search) {
      const searchLower = search.toLowerCase();
      students = students.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.roll_number.toLowerCase().includes(searchLower) ||
        s.class.toLowerCase().includes(searchLower)
      );
    }
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single student
app.get('/api/students/:id', (req, res) => {
  try {
    const student = data.students.find(s => s.id === parseInt(req.params.id));
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create student
app.post('/api/students', (req, res) => {
  try {
    const { roll_number, name, class: className, section } = req.body;
    
    // Check if roll number already exists
    if (data.students.some(s => s.roll_number === roll_number)) {
      return res.status(400).json({ error: 'Roll number already exists' });
    }

    const newStudent = {
      id: data.nextStudentId++,
      roll_number,
      name,
      class: className,
      section: section || ''
    };

    data.students.push(newStudent);
    saveData();
    
    res.status(201).json({ id: newStudent.id, message: 'Student created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student
app.put('/api/students/:id', (req, res) => {
  try {
    const { roll_number, name, class: className, section } = req.body;
    const id = parseInt(req.params.id);
    const studentIndex = data.students.findIndex(s => s.id === id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    data.students[studentIndex] = {
      ...data.students[studentIndex],
      roll_number,
      name,
      class: className,
      section: section || ''
    };

    saveData();
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const studentIndex = data.students.findIndex(s => s.id === id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    data.students.splice(studentIndex, 1);
    data.results = data.results.filter(r => r.student_id !== id);
    saveData();
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get results for a student
app.get('/api/students/:id/results', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const results = data.results.filter(r => r.student_id === id);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add result for a student
app.post('/api/students/:id/results', (req, res) => {
  try {
    const { subject, marks, max_marks, exam_name, exam_date } = req.body;
    const student_id = parseInt(req.params.id);

    const newResult = {
      id: data.nextResultId++,
      student_id,
      subject,
      marks: parseInt(marks),
      max_marks: parseInt(max_marks) || 100,
      exam_name,
      exam_date: exam_date || null
    };

    data.results.push(newResult);
    saveData();
    
    res.status(201).json({ id: newResult.id, message: 'Result added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student report card
app.get('/api/students/:id/report', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const student = data.students.find(s => s.id === id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const results = data.results.filter(r => r.student_id === id);

    // Calculate statistics
    let totalMarks = 0;
    let totalMaxMarks = 0;
    results.forEach(r => {
      totalMarks += r.marks;
      totalMaxMarks += r.max_marks;
    });

    const percentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(2) : 0;
    const average = results.length > 0 ? (totalMarks / results.length).toFixed(2) : 0;

    // Determine grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    res.json({
      student,
      results,
      statistics: {
        totalMarks,
        totalMaxMarks,
        percentage,
        average,
        grade,
        subjectCount: results.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get class summary/statistics
app.get('/api/class-summary', (req, res) => {
  try {
    const summary = data.students.map(student => {
      const results = data.results.filter(r => r.student_id === student.id);

      let totalMarks = 0;
      let totalMaxMarks = 0;
      results.forEach(r => {
        totalMarks += r.marks;
        totalMaxMarks += r.max_marks;
      });

      const percentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(2) : 0;
      
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';

      return {
        ...student,
        totalMarks,
        totalMaxMarks,
        percentage,
        grade,
        subjectCount: results.length
      };
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a result
app.delete('/api/results/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resultIndex = data.results.findIndex(r => r.id === id);
    
    if (resultIndex === -1) {
      return res.status(404).json({ error: 'Result not found' });
    }

    data.results.splice(resultIndex, 1);
    saveData();
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Database ready (JSON file)`);
});
