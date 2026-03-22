/**
 * Student Routes - REST API endpoints
 * Handles all CRUD operations for students
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Student = require('../models/Student');
const getGrade = Student.getGrade;

// In-memory fallback when MongoDB is not connected (for demo without DB setup)
let memoryStore = [];
let nextId = 1;

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * POST /add - Add a new student
 * Body: { name: string, marks: number }
 */
router.post('/add', async (req, res) => {
  try {
    const { name, marks } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Student name is required' });
    }
    if (marks === undefined || marks === null || marks === '') {
      return res.status(400).json({ error: 'Marks are required' });
    }

    const marksNum = Number(marks);
    if (isNaN(marksNum)) {
      return res.status(400).json({ error: 'Marks must be a valid number' });
    }
    if (marksNum < 0 || marksNum > 100) {
      return res.status(400).json({ error: 'Marks must be between 0 and 100' });
    }

    if (isDbConnected()) {
      const student = new Student({ name: name.trim(), marks: marksNum });
      await student.save();
      return res.status(201).json({ message: 'Student added successfully', student });
    }

    // Fallback: in-memory store
    const grade = getGrade(marksNum);
    const student = { _id: String(nextId++), name: name.trim(), marks: marksNum, grade };
    memoryStore.unshift(student);
    res.status(201).json({ message: 'Student added successfully', student });
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ error: 'Server error. Could not add student.' });
  }
});

/**
 * GET /students - Fetch all students
 */
router.get('/students', async (req, res) => {
  try {
    if (isDbConnected()) {
      const students = await Student.find().sort({ createdAt: -1 });
      return res.json(students);
    }
    res.json(memoryStore);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Server error. Could not fetch students.' });
  }
});

/**
 * PUT /students/:id - Update a student
 * Body: { name?: string, marks?: number }
 */
router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, marks } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const updateData = {};

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Student name cannot be empty' });
      }
      updateData.name = name.trim();
    }

    if (marks !== undefined && marks !== null && marks !== '') {
      const marksNum = Number(marks);
      if (isNaN(marksNum)) {
        return res.status(400).json({ error: 'Marks must be a valid number' });
      }
      if (marksNum < 0 || marksNum > 100) {
        return res.status(400).json({ error: 'Marks must be between 0 and 100' });
      }
      updateData.marks = marksNum;
      updateData.grade = getGrade(marksNum);
    }

    if (isDbConnected()) {
      const student = await Student.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!student) return res.status(404).json({ error: 'Student not found' });
      return res.json({ message: 'Student updated successfully', student });
    }

    const idx = memoryStore.findIndex(s => s._id === id);
    if (idx === -1) return res.status(404).json({ error: 'Student not found' });
    const student = { ...memoryStore[idx], ...updateData };
    if (updateData.marks !== undefined) student.grade = getGrade(updateData.marks);
    memoryStore[idx] = student;
    res.json({ message: 'Student updated successfully', student });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Server error. Could not update student.' });
  }
});

/**
 * DELETE /students/:id - Delete a student
 */
router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const student = await Student.findByIdAndDelete(id);
      if (!student) return res.status(404).json({ error: 'Student not found' });
      return res.json({ message: 'Student deleted successfully', id });
    }

    const idx = memoryStore.findIndex(s => s._id === id);
    if (idx === -1) return res.status(404).json({ error: 'Student not found' });
    memoryStore.splice(idx, 1);
    res.json({ message: 'Student deleted successfully', id });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Server error. Could not delete student.' });
  }
});

module.exports = router;
