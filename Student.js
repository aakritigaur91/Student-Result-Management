/**
 * Student Model - Mongoose Schema
 * Defines the structure of student documents in MongoDB
 */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  grade: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C']
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

/**
 * Pre-save middleware: Calculate grade based on marks
 * - Marks >= 90 → Grade A
 * - Marks >= 75 → Grade B
 * - Else → Grade C
 */
studentSchema.pre('save', function(next) {
  if (this.marks >= 90) {
    this.grade = 'A';
  } else if (this.marks >= 75) {
    this.grade = 'B';
  } else {
    this.grade = 'C';
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);

/**
 * Helper: Calculate grade from marks
 */
function getGrade(marks) {
  if (marks >= 90) return 'A';
  if (marks >= 75) return 'B';
  return 'C';
}
module.exports.getGrade = getGrade;
