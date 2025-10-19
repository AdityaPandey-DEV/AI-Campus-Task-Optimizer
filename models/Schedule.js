const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['timetable', 'holiday', 'exam', 'lab', 'event'],
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
  subject: {
    type: String,
    trim: true
  },
  instructor: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, etc.
    min: 0,
    max: 6
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'weekly'
  },
  recurringEndDate: {
    type: Date
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    room: String,
    building: String,
    capacity: Number,
    equipment: [String]
  }
}, {
  timestamps: true
});

// Index for efficient queries
scheduleSchema.index({ userId: 1, startTime: 1, endTime: 1 });
scheduleSchema.index({ userId: 1, type: 1 });
scheduleSchema.index({ userId: 1, dayOfWeek: 1 });

// Method to check if schedule conflicts with another
scheduleSchema.methods.conflictsWith = function(otherSchedule) {
  return (
    this.startTime < otherSchedule.endTime &&
    this.endTime > otherSchedule.startTime
  );
};

// Method to get duration in minutes
scheduleSchema.methods.getDuration = function() {
  return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
};

// Static method to find available time slots
scheduleSchema.statics.findAvailableSlots = async function(userId, startDate, endDate, duration) {
  const schedules = await this.find({
    userId,
    startTime: { $gte: startDate },
    endTime: { $lte: endDate },
    isActive: true
  }).sort({ startTime: 1 });

  const availableSlots = [];
  let currentTime = new Date(startDate);

  for (const schedule of schedules) {
    if (currentTime < schedule.startTime) {
      const slotDuration = (schedule.startTime.getTime() - currentTime.getTime()) / (1000 * 60);
      if (slotDuration >= duration) {
        availableSlots.push({
          startTime: new Date(currentTime),
          endTime: new Date(schedule.startTime),
          duration: slotDuration
        });
      }
    }
    currentTime = new Date(Math.max(currentTime.getTime(), schedule.endTime.getTime()));
  }

  // Check if there's time after the last schedule
  if (currentTime < endDate) {
    const slotDuration = (endDate.getTime() - currentTime.getTime()) / (1000 * 60);
    if (slotDuration >= duration) {
      availableSlots.push({
        startTime: new Date(currentTime),
        endTime: new Date(endDate),
        duration: slotDuration
      });
    }
  }

  return availableSlots;
};

module.exports = mongoose.model('Schedule', scheduleSchema);
