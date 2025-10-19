const express = require('express');
const auth = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const Task = require('../models/Task');
const Schedule = require('../models/Schedule');

const router = express.Router();

// Send test notification
router.post('/test', auth, async (req, res) => {
  try {
    const { type, taskId } = req.body;
    
    let task = null;
    if (taskId) {
      task = await Task.findOne({ _id: taskId, userId: req.userId });
    }

    switch (type) {
      case 'reminder':
        if (!task) {
          return res.status(400).json({ message: 'Task ID is required for reminder test' });
        }
        await notificationService.sendTaskReminder(req.user, task);
        break;
      case 'overdue':
        if (!task) {
          return res.status(400).json({ message: 'Task ID is required for overdue test' });
        }
        await notificationService.sendOverdueNotification(req.user, task);
        break;
      case 'daily':
        const todayTasks = await Task.find({
          userId: req.userId,
          deadline: { $gte: new Date().setHours(0, 0, 0, 0) }
        });
        const todaySchedule = await Schedule.find({
          userId: req.userId,
          startTime: { $gte: new Date().setHours(0, 0, 0, 0) },
          isActive: true
        });
        await notificationService.sendDailySummary(req.user, todayTasks, todaySchedule);
        break;
      case 'weekly':
        const weekTasks = await Task.find({
          userId: req.userId,
          deadline: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        const weekSchedule = await Schedule.find({
          userId: req.userId,
          startTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          isActive: true
        });
        await notificationService.sendWeeklySummary(req.user, weekTasks, weekSchedule);
        break;
      default:
        return res.status(400).json({ message: 'Invalid notification type' });
    }

    res.json({ message: `${type} notification sent successfully` });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const preferences = req.user.preferences.notifications;
    res.json({ preferences });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { notifications } = req.body;
    
    const user = await require('../models/User').findByIdAndUpdate(
      req.userId,
      { 'preferences.notifications': notifications },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Notification preferences updated successfully',
      preferences: user.preferences.notifications
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification history (mock implementation)
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // In a real implementation, you would store notification history in the database
    const mockHistory = [
      {
        id: '1',
        type: 'reminder',
        title: 'Task Reminder',
        message: 'Your assignment is due in 2 hours',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true
      },
      {
        id: '2',
        type: 'overdue',
        title: 'Overdue Task Alert',
        message: 'Your lab report is overdue by 1 day',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        type: 'daily',
        title: 'Daily Summary',
        message: 'You have 3 tasks due today',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        read: true
      }
    ];

    const paginatedHistory = mockHistory.slice(offset, offset + parseInt(limit));

    res.json({ 
      notifications: paginatedHistory,
      total: mockHistory.length,
      hasMore: offset + parseInt(limit) < mockHistory.length
    });
  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    // In a real implementation, you would update the notification in the database
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming reminders
router.get('/upcoming', auth, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const reminderThreshold = new Date(Date.now() + parseInt(hours) * 60 * 60 * 1000);
    
    const upcomingTasks = await Task.find({
      userId: req.userId,
      status: { $ne: 'completed' },
      deadline: { $lte: reminderThreshold, $gte: new Date() }
    }).sort({ deadline: 1 });

    const reminders = upcomingTasks.map(task => ({
      id: task._id,
      type: 'task_reminder',
      title: task.title,
      message: `Due in ${Math.ceil((task.deadline.getTime() - Date.now()) / (1000 * 60 * 60))} hours`,
      deadline: task.deadline,
      priority: task.priority,
      category: task.category
    }));

    res.json({ reminders });
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send custom notification
router.post('/send', auth, async (req, res) => {
  try {
    const { to, subject, message, type = 'custom' } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ message: 'To, subject, and message are required' });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">${subject}</h2>
        <p>Hello ${req.user.name},</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${message}
        </div>
        <p>Best regards,<br>AI Campus Task Optimizer</p>
      </div>
    `;

    await notificationService.sendEmail(to, subject, html, message);
    
    res.json({ message: 'Custom notification sent successfully' });
  } catch (error) {
    console.error('Send custom notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification statistics
router.get('/stats', auth, async (req, res) => {
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
    }

    // Mock statistics - in real implementation, these would come from database
    const stats = {
      totalSent: 15,
      reminders: 8,
      overdue: 2,
      daily: 5,
      weekly: 1,
      readRate: 85.5,
      responseRate: 12.3
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
