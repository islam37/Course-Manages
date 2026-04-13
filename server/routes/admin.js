const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { verifyToken, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(verifyToken, adminOnly);

// GET /api/admin/dashboard - Analytics
router.get('/dashboard', async (req, res) => {
  try {
    const [totalCourses, totalUsers, totalEnrollments, activeEnrollments, courses] = await Promise.all([
      Course.countDocuments(),
      User.countDocuments(),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'active' }),
      Course.find().sort({ enrolledCount: -1 }).limit(5)
    ]);

    const totalSeats = courses.reduce((sum, c) => sum + c.totalSeats, 0);
    const usedSeats = courses.reduce((sum, c) => sum + c.enrolledCount, 0);
    const avgSeatFill = totalSeats > 0 ? Math.round((usedSeats / totalSeats) * 100) : 0;

    res.json({
      totalCourses,
      totalUsers,
      totalEnrollments,
      activeEnrollments,
      avgSeatFill,
      topCourses: courses
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/all-enrollments
router.get('/all-enrollments', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const total = await Enrollment.countDocuments();
    const enrollments = await Enrollment.find()
      .populate('userId', 'name email photoURL')
      .populate('courseId', 'title instructorName')
      .sort({ enrolledAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ enrollments, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/enrollments/:id - Admin remove any enrollment
router.delete('/enrollments/:id', async (req, res) => {
  const mongoose = require('mongoose');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const enrollment = await Enrollment.findById(req.params.id).session(session);
    if (!enrollment) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    enrollment.status = 'dropped';
    await enrollment.save({ session });

    await Course.findByIdAndUpdate(
      enrollment.courseId,
      { $inc: { availableSeats: 1, enrolledCount: -1 } },
      { session }
    );

    await session.commitTransaction();
    res.json({ message: 'Enrollment removed successfully' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const total = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get enrollment counts for each user
    const userIds = users.map(u => u._id);
    const enrollmentCounts = await Enrollment.aggregate([
      { $match: { userId: { $in: userIds }, status: 'active' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    enrollmentCounts.forEach(e => { countMap[e._id.toString()] = e.count; });

    const usersWithCounts = users.map(u => ({
      ...u.toJSON(),
      enrollmentCount: countMap[u._id.toString()] || 0
    }));

    res.json({ users: usersWithCounts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be "user" or "admin"' });
    }

    // Prevent self-demotion
    if (req.params.id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: `User role updated to ${role}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
