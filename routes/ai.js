const express = require('express');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const Task = require('../models/Task');
const Schedule = require('../models/Schedule');

const router = express.Router();

// Parse natural language input
router.post('/parse-input', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text input is required' });
    }

    const parsedTask = await aiService.parseTaskInput(text, {
      university: req.user.university,
      course: req.user.course,
      year: req.user.year
    });

    res.json({ 
      message: 'Text parsed successfully',
      parsedTask 
    });
  } catch (error) {
    console.error('Parse input error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get AI-optimized schedule
router.post('/optimize-schedule', auth, async (req, res) => {
  try {
    const { startDate, endDate, tasks } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Get user's existing schedule
    const existingSchedule = await Schedule.find({
      userId: req.userId,
      startTime: { $gte: new Date(startDate) },
      endTime: { $lte: new Date(endDate) },
      isActive: true
    });

    // Get tasks if not provided
    let tasksToOptimize = tasks;
    if (!tasksToOptimize) {
      tasksToOptimize = await Task.find({
        userId: req.userId,
        status: { $ne: 'completed' },
        deadline: { $gte: new Date(startDate), $lte: new Date(endDate) }
      });
    }

    const optimizedSchedule = await aiService.optimizeTaskSchedule(
      tasksToOptimize,
      existingSchedule,
      req.user.preferences
    );

    res.json({ 
      message: 'Schedule optimized successfully',
      optimizedSchedule,
      tasks: tasksToOptimize,
      existingSchedule
    });
  } catch (error) {
    console.error('Optimize schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get AI recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let startDate = new Date();
    let endDate = new Date();
    
    switch (period) {
      case 'day':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'week':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
    }

    // Get current tasks
    const currentTasks = await Task.find({
      userId: req.userId,
      deadline: { $gte: startDate, $lte: endDate }
    });

    // Get schedule
    const schedule = await Schedule.find({
      userId: req.userId,
      startTime: { $gte: startDate },
      endTime: { $lte: endDate },
      isActive: true
    });

    // Mock academic calendar (in real app, this would come from a database)
    const academicCalendar = {
      exams: [],
      holidays: [],
      importantDates: []
    };

    const recommendations = await aiService.generateTaskRecommendations(
      req.userId,
      currentTasks,
      schedule,
      academicCalendar
    );

    res.json({ 
      message: 'Recommendations generated successfully',
      recommendations 
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Analyze announcements
router.post('/analyze-announcements', auth, async (req, res) => {
  try {
    const { announcements } = req.body;
    
    if (!announcements || !Array.isArray(announcements)) {
      return res.status(400).json({ message: 'Announcements array is required' });
    }

    const analysis = await aiService.analyzeAnnouncements(announcements);

    res.json({ 
      message: 'Announcements analyzed successfully',
      analysis 
    });
  } catch (error) {
    console.error('Analyze announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task priority suggestions
router.get('/priority-suggestions', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.userId,
      status: { $ne: 'completed' }
    });

    const tasksWithPriority = tasks.map(task => ({
      ...task.toObject(),
      aiPriority: aiService.calculateAIPriority(task, req.user),
      urgencyScore: task.getUrgencyScore(),
      timeRemaining: task.timeRemaining
    }));

    // Sort by AI priority
    tasksWithPriority.sort((a, b) => b.aiPriority - a.aiPriority);

    res.json({ 
      message: 'Priority suggestions generated successfully',
      tasks: tasksWithPriority
    });
  } catch (error) {
    console.error('Get priority suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Smart task breakdown
router.post('/breakdown-task', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    
    const task = await Task.findOne({ _id: taskId, userId: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Use AI to break down complex tasks
    const prompt = `
      Break down the following task into smaller, manageable subtasks:
      
      Task: ${task.title}
      Description: ${task.description || 'No description'}
      Category: ${task.category}
      Difficulty: ${task.difficulty}
      Estimated Duration: ${task.estimatedDuration} minutes
      Deadline: ${task.deadline}
      
      Return a JSON array of subtasks with:
      {
        "title": "Subtask title",
        "description": "Detailed description",
        "estimatedDuration": number in minutes,
        "priority": "low|medium|high",
        "dependencies": ["array of prerequisite subtask titles"]
      }
    `;

    const response = await aiService.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800
    });

    const subtasks = JSON.parse(response.choices[0].message.content);

    res.json({ 
      message: 'Task breakdown generated successfully',
      originalTask: task,
      subtasks 
    });
  } catch (error) {
    console.error('Breakdown task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get study strategy recommendations
router.get('/study-strategies', auth, async (req, res) => {
  try {
    const { subject, examDate, difficulty } = req.query;
    
    if (!subject || !examDate) {
      return res.status(400).json({ message: 'Subject and exam date are required' });
    }

    const prompt = `
      Generate a personalized study strategy for a college student:
      
      Subject: ${subject}
      Exam Date: ${examDate}
      Difficulty: ${difficulty || 'medium'}
      Current Date: ${new Date().toISOString()}
      
      Return a JSON object with:
      {
        "strategy": "Overall study strategy",
        "timeline": [
          {
            "phase": "Phase name",
            "duration": "Duration in days",
            "focus": "What to focus on",
            "tasks": ["array of specific tasks"]
          }
        ],
        "tips": ["array of study tips"],
        "resources": ["array of suggested resources"]
      }
    `;

    const response = await aiService.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1000
    });

    const studyStrategy = JSON.parse(response.choices[0].message.content);

    res.json({ 
      message: 'Study strategy generated successfully',
      studyStrategy 
    });
  } catch (error) {
    console.error('Get study strategies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Chat with AI assistant
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userContext = {
      name: req.user.name,
      university: req.user.university,
      course: req.user.course,
      year: req.user.year
    };

    const prompt = `
      You are an AI assistant for a college student task management system. 
      Help the student with their academic and campus-related tasks.
      
      Student Context:
      - Name: ${userContext.name}
      - University: ${userContext.university}
      - Course: ${userContext.course}
      - Year: ${userContext.year}
      
      ${context ? `Additional Context: ${context}` : ''}
      
      Student Message: ${message}
      
      Provide helpful, actionable advice related to task management, study strategies, 
      time management, and academic success. Keep responses concise and practical.
    `;

    const response = await aiService.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = response.choices[0].message.content;

    res.json({ 
      message: 'AI response generated successfully',
      response: aiResponse,
      context: userContext
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
