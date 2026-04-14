const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  imageURL: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Development', 'Data Science', 'Design', 'Cloud', 'Business', 'Other'],
    default: 'Development'
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  totalSeats: {
    type: Number,
    default: 10,
    min: [1, 'Must have at least 1 seat'],
    max: [100, 'Cannot exceed 100 seats']
  },
  availableSeats: {
    type: Number,
    min: 0
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  instructorEmail: {
    type: String,
    required: [true, 'Instructor email is required'],
    lowercase: true
  },
  instructorName: {
    type: String,
    required: [true, 'Instructor name is required']
  },
  priceBDT: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes
courseSchema.index({ title: 'text', instructorName: 'text' });
courseSchema.index({ enrolledCount: -1 });
courseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Course', courseSchema);
