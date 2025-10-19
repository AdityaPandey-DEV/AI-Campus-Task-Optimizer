const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['academic', 'assignment', 'lab', 'exam', 'project', 'internship', 'attendance', 'personal', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  actualDuration: {
    type: Number // in minutes, filled when task is completed
  },
  deadline: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  location: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  instructor: {
    type: String,
    trim: true
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiPriority: {
    type: Number,
    min: 0,
    max: 100
  },
  notes: [{
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ userId: 1, deadline: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, category: 1 });

// Virtual for time remaining
taskSchema.virtual('timeRemaining').get(function() {
  if (this.deadline) {
    return Math.max(0, this.deadline.getTime() - Date.now());
  }
  return null;
});

// Method to check if task is overdue
taskSchema.methods.isOverdue = function() {
  return this.deadline < new Date() && this.status !== 'completed';
};

// Method to get urgency score
taskSchema.methods.getUrgencyScore = function() {
  const now = new Date();
  const timeLeft = this.deadline.getTime() - now.getTime();
  const hoursLeft = timeLeft / (1000 * 60 * 60);
  
  let urgencyScore = 0;
  
  // Time-based urgency
  if (hoursLeft <= 24) urgencyScore += 40;
  else if (hoursLeft <= 72) urgencyScore += 30;
  else if (hoursLeft <= 168) urgencyScore += 20;
  else urgencyScore += 10;
  
  // Priority-based urgency
  switch (this.priority) {
    case 'urgent': urgencyScore += 30; break;
    case 'high': urgencyScore += 20; break;
    case 'medium': urgencyScore += 10; break;
    case 'low': urgencyScore += 5; break;
  }
  
  // Difficulty-based urgency
  switch (this.difficulty) {
    case 'hard': urgencyScore += 20; break;
    case 'medium': urgencyScore += 10; break;
    case 'easy': urgencyScore += 5; break;
  }
  
  return Math.min(100, urgencyScore);
};

module.exports = mongoose.model('Task', taskSchema);
