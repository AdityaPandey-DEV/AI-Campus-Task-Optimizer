const express = require('express');
const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// Get all schedules for user
router.get('/', auth, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    let query = { userId: req.userId, isActive: true };
    
    if (type) query.type = type;
    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate) };
      query.endTime = { $lte: new Date(endDate) };
    }
    
    const schedules = await Schedule.find(query).sort({ startTime: 1 });
    res.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new schedule item
router.post('/', auth, async (req, res) => {
  try {
    const scheduleData = {
      ...req.body,
      userId: req.userId
    };
    
    const schedule = new Schedule(scheduleData);
    await schedule.save();
    
    res.status(201).json({ 
      message: 'Schedule item created successfully',
      schedule 
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get optimized daily schedule
router.get('/optimized/daily', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Get tasks for the day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const tasks = await Task.find({
      userId: req.userId,
      status: { $ne: 'completed' },
      deadline: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Get existing schedule for the day
    const existingSchedule = await Schedule.find({
      userId: req.userId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      isActive: true
    });
    
    // Optimize schedule using AI
    const optimizedSchedule = await aiService.optimizeTaskSchedule(
      tasks,
      existingSchedule,
      req.user.preferences
    );
    
    res.json({ 
      optimizedSchedule,
      tasks,
      existingSchedule,
      date: targetDate
    });
  } catch (error) {
    console.error('Get optimized schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available time slots
router.get('/available-slots', auth, async (req, res) => {
  try {
    const { startDate, endDate, duration = 60 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const availableSlots = await Schedule.findAvailableSlots(
      req.userId,
      new Date(startDate),
      new Date(endDate),
      parseInt(duration)
    );
    
    res.json({ availableSlots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk import timetable
router.post('/import-timetable', auth, async (req, res) => {
  try {
    const { timetable } = req.body;
    
    if (!Array.isArray(timetable)) {
      return res.status(400).json({ message: 'Timetable must be an array' });
    }
    
    const schedules = [];
    
    for (const item of timetable) {
      const schedule = new Schedule({
        ...item,
        userId: req.userId,
        type: 'timetable'
      });
      schedules.push(schedule);
    }
    
    await Schedule.insertMany(schedules);
    
    res.status(201).json({ 
      message: 'Timetable imported successfully',
      count: schedules.length
    });
  } catch (error) {
    console.error('Import timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get schedule conflicts
router.get('/conflicts', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const schedules = await Schedule.find({
      userId: req.userId,
      startTime: { $gte: new Date(startDate) },
      endTime: { $lte: new Date(endDate) },
      isActive: true
    }).sort({ startTime: 1 });
    
    const conflicts = [];
    
    for (let i = 0; i < schedules.length - 1; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        if (schedules[i].conflictsWith(schedules[j])) {
          conflicts.push({
            schedule1: schedules[i],
            schedule2: schedules[j],
            conflictDuration: Math.min(
              schedules[i].endTime.getTime(),
              schedules[j].endTime.getTime()
            ) - Math.max(
              schedules[i].startTime.getTime(),
              schedules[j].startTime.getTime()
            )
          });
        }
      }
    }
    
    res.json({ conflicts });
  } catch (error) {
    console.error('Get conflicts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update schedule item
router.put('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule item not found' });
    }
    
    res.json({ 
      message: 'Schedule item updated successfully',
      schedule 
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete schedule item
router.delete('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule item not found' });
    }
    
    res.json({ message: 'Schedule item deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get weekly overview
router.get('/weekly/overview', auth, async (req, res) => {
  try {
    const { weekStart } = req.query;
    const startOfWeek = weekStart ? new Date(weekStart) : new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const schedules = await Schedule.find({
      userId: req.userId,
      startTime: { $gte: startOfWeek, $lte: endOfWeek },
      isActive: true
    }).sort({ startTime: 1 });
    
    const tasks = await Task.find({
      userId: req.userId,
      deadline: { $gte: startOfWeek, $lte: endOfWeek }
    }).sort({ deadline: 1 });
    
    // Group by day
    const weeklyData = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];
      
      weeklyData[dayKey] = {
        date: day,
        schedules: schedules.filter(s => 
          s.startTime.toDateString() === day.toDateString()
        ),
        tasks: tasks.filter(t => 
          t.deadline.toDateString() === day.toDateString()
        )
      };
    }
    
    res.json({ weeklyData });
  } catch (error) {
    console.error('Get weekly overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
