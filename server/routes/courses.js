const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { verifyToken, adminOnly } = require('../middleware/auth');
const xss = require('xss');

// GET /api/courses - All courses with pagination & search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const search = req.query.search || '';
    const category = req.query.category || '';

    const query = {};
    
    // Use regex for flexible search instead of text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { instructorName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      courses,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Courses GET error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/latest - Latest 6 courses
router.get('/latest', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }).limit(6);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/popular - Most enrolled
router.get('/popular', async (req, res) => {
  try {
    const courses = await Course.find().sort({ enrolledCount: -1 }).limit(6);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:id - Single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/courses - Create course (admin)
router.post('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { title, shortDescription, description, imageURL, category, duration, totalSeats, instructorEmail, instructorName } = req.body;

    if (!title || !shortDescription || !description || !duration || !instructorEmail || !instructorName) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const course = await Course.create({
      title: xss(title), 
      shortDescription: xss(shortDescription), 
      description: xss(description), 
      imageURL: xss(imageURL) || '', 
      category,
      duration: xss(duration), 
      totalSeats: parseInt(totalSeats) || 10,
      availableSeats: parseInt(totalSeats) || 10,
      instructorEmail: instructorEmail.toLowerCase(), 
      instructorName: xss(instructorName)
    });

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (err) {
    console.error('Course creation error - Full stack:', err);
    console.error('Error details:', {
      message: err.message,
      name: err.name,
      statusCode: err.statusCode
    });
    res.status(500).json({ 
      message: err.message || 'Failed to create course',
      details: process.env.NODE_ENV === 'development' ? err.errors : undefined
    });
  }
});

// PUT /api/courses/:id - Update course (admin)
router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { title, shortDescription, description, imageURL, category, duration, totalSeats, instructorEmail, instructorName } = req.body;

    // Validate required fields
    if (title && title.trim().length === 0) {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }
    if (shortDescription && shortDescription.length > 200) {
      return res.status(400).json({ message: 'Short description cannot exceed 200 characters' });
    }
    if (description && description.length > 2000) {
      return res.status(400).json({ message: 'Description cannot exceed 2000 characters' });
    }
    if (duration && duration.trim().length === 0) {
      return res.status(400).json({ message: 'Duration cannot be empty' });
    }
    if (instructorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(instructorEmail)) {
      return res.status(400).json({ message: 'Invalid instructor email' });
    }
    if (totalSeats && (totalSeats < 1 || totalSeats > 100)) {
      return res.status(400).json({ message: 'Total seats must be between 1 and 100' });
    }

    Object.assign(course, {
      title: title ? xss(title) : course.title,
      shortDescription: shortDescription ? xss(shortDescription) : course.shortDescription,
      description: description ? xss(description) : course.description,
      imageURL: imageURL !== undefined ? xss(imageURL) : course.imageURL,
      category: category || course.category,
      duration: duration ? xss(duration) : course.duration,
      instructorEmail: instructorEmail || course.instructorEmail,
      instructorName: instructorName ? xss(instructorName) : course.instructorName,
      totalSeats: totalSeats || course.totalSeats
    });

    await course.save();
    res.json({ message: 'Course updated successfully', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/courses/:id - Delete course (admin)
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Also remove all enrollments for this course
    const Enrollment = require('../models/Enrollment');
    await Enrollment.deleteMany({ courseId: req.params.id });

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
