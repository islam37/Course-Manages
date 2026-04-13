const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { verifyToken } = require('../middleware/auth');

// GET /api/enrollments/my-courses
router.get('/my-courses', verifyToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      userId: req.user._id,
      status: 'active'
    }).populate('courseId');

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/enrollments/check/:courseId
router.get('/check/:courseId', verifyToken, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: req.params.courseId,
      status: 'active'
    });
    res.json({ enrolled: !!enrollment, enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/enrollments/count
router.get('/count', verifyToken, async (req, res) => {
  try {
    const count = await Enrollment.countDocuments({
      userId: req.user._id,
      status: 'active'
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/enrollments/:courseId - Enroll in a course
router.post('/:courseId', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check active enrollments count
    const activeCount = await Enrollment.countDocuments({
      userId: req.user._id,
      status: 'active'
    }).session(session);

    if (activeCount >= 3) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'You can only enroll in up to 3 courses at a time' });
    }

    // Get course and check availability
    const course = await Course.findById(req.params.courseId).session(session);
    if (!course) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.availableSeats <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'No seats available in this course' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: req.params.courseId,
      status: 'active'
    }).session(session);

    if (existingEnrollment) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await Enrollment.create([{
      userId: req.user._id,
      courseId: course._id,
      userEmail: req.user.email,
      userName: req.user.name,
      courseTitle: course.title,
      status: 'active'
    }], { session });

    // Update course seats
    await Course.findByIdAndUpdate(
      req.params.courseId,
      { $inc: { availableSeats: -1, enrolledCount: 1 } },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ message: 'Enrolled successfully!', enrollment: enrollment[0] });
  } catch (err) {
    await session.abortTransaction();
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

// DELETE /api/enrollments/:enrollmentId - Drop enrollment
router.delete('/:enrollmentId', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId).session(session);

    if (!enrollment) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Only allow the user to drop their own enrollment
    if (enrollment.userId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Unauthorized' });
    }

    enrollment.status = 'dropped';
    await enrollment.save({ session });

    // Return seat to course
    await Course.findByIdAndUpdate(
      enrollment.courseId,
      { $inc: { availableSeats: 1, enrolledCount: -1 } },
      { session }
    );

    await session.commitTransaction();
    res.json({ message: 'Enrollment dropped successfully' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
