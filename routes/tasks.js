const express = require('express');
const Task = require('../models/Task');
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, sortBy = 'deadline' } = req.query;
    
    let query = { userId: req.userId };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    let sortOptions = {};
    switch (sortBy) {
      case 'priority':
        sortOptions = { priority: -1, deadline: 1 };
        break;
      case 'created':
        sortOptions = { createdAt: -1 };
        break;
      case 'deadline':
      default:
        sortOptions = { deadline: 1 };
        break;
    }
    
    const tasks = await Task.find(query).sort(sortOptions);
    
    // Add AI priority scores
    const tasksWithAI = tasks.map(task => ({
      ...task.toObject(),
      aiPriority: aiService.calculateAIPriority(task, req.user)
    }));
    
    res.json({ tasks: tasksWithAI });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.userId
    };
    
    const task = new Task(taskData);
    await task.save();
    
    // Calculate AI priority
    task.aiPriority = aiService.calculateAIPriority(task, req.user);
    
    res.status(201).json({ 
      message: 'Task created successfully',
      task 
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task from natural language
router.post('/from-text', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text input is required' });
    }
    
    // Parse natural language input
    const parsedTask = await aiService.parseTaskInput(text, {
      university: req.user.university,
      course: req.user.course,
      year: req.user.year
    });
    
    // Create task
    const task = new Task({
      ...parsedTask,
      userId: req.userId,
      aiGenerated: true
    });
    
    await task.save();
    
    // Calculate AI priority
    task.aiPriority = aiService.calculateAIPriority(task, req.user);
    
    res.status(201).json({
      message: 'Task created from text successfully',
      task,
      originalText: text
    });
  } catch (error) {
    console.error('Create task from text error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Add AI priority
    task.aiPriority = aiService.calculateAIPriority(task, req.user);
    
    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Recalculate AI priority
    task.aiPriority = aiService.calculateAIPriority(task, req.user);
    
    res.json({ 
      message: 'Task updated successfully',
      task 
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start task
router.post('/:id/start', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        status: 'in_progress',
        startTime: new Date()
      },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ 
      message: 'Task started successfully',
      task 
    });
  } catch (error) {
    console.error('Start task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete task
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { actualDuration, progress = 100 } = req.body;
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        status: 'completed',
        endTime: new Date(),
        progress: 100,
        actualDuration: actualDuration
      },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ 
      message: 'Task completed successfully',
      task 
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task analytics
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    const tasks = await Task.find({
      userId: req.userId,
      createdAt: { $gte: startDate }
    });
    
    const analytics = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      overdue: tasks.filter(t => t.isOverdue()).length,
      categories: {},
      priorities: {},
      averageCompletionTime: 0
    };
    
    // Category breakdown
    tasks.forEach(task => {
      analytics.categories[task.category] = (analytics.categories[task.category] || 0) + 1;
      analytics.priorities[task.priority] = (analytics.priorities[task.priority] || 0) + 1;
    });
    
    // Average completion time
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.actualDuration);
    if (completedTasks.length > 0) {
      analytics.averageCompletionTime = completedTasks.reduce((sum, task) => sum + task.actualDuration, 0) / completedTasks.length;
    }
    
    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming deadlines
router.get('/upcoming/deadlines', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));
    
    const tasks = await Task.find({
      userId: req.userId,
      deadline: { $lte: endDate, $gte: new Date() },
      status: { $ne: 'completed' }
    }).sort({ deadline: 1 });
    
    res.json({ tasks });
  } catch (error) {
    console.error('Get upcoming deadlines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
