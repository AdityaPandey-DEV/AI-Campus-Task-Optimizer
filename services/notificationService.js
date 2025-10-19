const nodemailer = require('nodemailer');
const Task = require('../models/Task');
const User = require('../models/User');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send email notification
  async sendEmail(to, subject, html, text) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Send task reminder email
  async sendTaskReminder(user, task) {
    try {
      const timeLeft = task.deadline.getTime() - Date.now();
      const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
      
      const subject = `Reminder: ${task.title} - Due in ${hoursLeft} hours`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Task Reminder</h2>
          <p>Hello ${user.name},</p>
          <p>This is a reminder about your upcoming task:</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">${task.title}</h3>
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Difficulty:</strong> ${task.difficulty}</p>
            <p><strong>Estimated Duration:</strong> ${task.estimatedDuration} minutes</p>
            <p><strong>Deadline:</strong> ${task.deadline.toLocaleString()}</p>
            <p><strong>Time Remaining:</strong> ${hoursLeft} hours</p>
            ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
            ${task.location ? `<p><strong>Location:</strong> ${task.location}</p>` : ''}
          </div>
          
          <p>Don't forget to complete this task on time!</p>
          <p>Best regards,<br>AI Campus Task Optimizer</p>
        </div>
      `;

      const text = `
        Task Reminder
        
        Hello ${user.name},
        
        This is a reminder about your upcoming task: ${task.title}
        
        Category: ${task.category}
        Priority: ${task.priority}
        Difficulty: ${task.difficulty}
        Estimated Duration: ${task.estimatedDuration} minutes
        Deadline: ${task.deadline.toLocaleString()}
        Time Remaining: ${hoursLeft} hours
        ${task.description ? `Description: ${task.description}` : ''}
        ${task.location ? `Location: ${task.location}` : ''}
        
        Don't forget to complete this task on time!
        
        Best regards,
        AI Campus Task Optimizer
      `;

      if (user.preferences.notifications.email) {
        await this.sendEmail(user.email, subject, html, text);
      }
    } catch (error) {
      console.error('Error sending task reminder:', error);
    }
  }

  // Send overdue task notification
  async sendOverdueNotification(user, task) {
    try {
      const overdueHours = Math.ceil((Date.now() - task.deadline.getTime()) / (1000 * 60 * 60));
      
      const subject = `URGENT: Overdue Task - ${task.title}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DC2626;">⚠️ Overdue Task Alert</h2>
          <p>Hello ${user.name},</p>
          <p><strong>This task is overdue by ${overdueHours} hours!</strong></p>
          
          <div style="background-color: #FEF2F2; border: 2px solid #DC2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #DC2626;">${task.title}</h3>
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Deadline:</strong> ${task.deadline.toLocaleString()}</p>
            <p><strong>Overdue by:</strong> ${overdueHours} hours</p>
            ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
          </div>
          
          <p style="color: #DC2626;"><strong>Please complete this task as soon as possible!</strong></p>
          <p>Best regards,<br>AI Campus Task Optimizer</p>
        </div>
      `;

      const text = `
        ⚠️ Overdue Task Alert
        
        Hello ${user.name},
        
        This task is overdue by ${overdueHours} hours!
        
        Task: ${task.title}
        Category: ${task.category}
        Priority: ${task.priority}
        Deadline: ${task.deadline.toLocaleString()}
        Overdue by: ${overdueHours} hours
        ${task.description ? `Description: ${task.description}` : ''}
        
        Please complete this task as soon as possible!
        
        Best regards,
        AI Campus Task Optimizer
      `;

      if (user.preferences.notifications.email) {
        await this.sendEmail(user.email, subject, html, text);
      }
    } catch (error) {
      console.error('Error sending overdue notification:', error);
    }
  }

  // Send daily summary
  async sendDailySummary(user, tasks, schedule) {
    try {
      const today = new Date();
      const todayTasks = tasks.filter(task => 
        task.deadline.toDateString() === today.toDateString()
      );
      const upcomingTasks = tasks.filter(task => 
        task.deadline > today && task.deadline <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
      const overdueTasks = tasks.filter(task => task.isOverdue());

      const subject = `Daily Summary - ${today.toLocaleDateString()}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Daily Summary</h2>
          <p>Hello ${user.name},</p>
          <p>Here's your daily task summary for ${today.toLocaleDateString()}:</p>
          
          ${overdueTasks.length > 0 ? `
            <div style="background-color: #FEF2F2; border: 2px solid #DC2626; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #DC2626;">⚠️ Overdue Tasks (${overdueTasks.length})</h3>
              <ul>
                ${overdueTasks.map(task => `<li>${task.title} - Due: ${task.deadline.toLocaleString()}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${todayTasks.length > 0 ? `
            <div style="background-color: #FEF3C7; border: 2px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #F59E0B;">📅 Today's Tasks (${todayTasks.length})</h3>
              <ul>
                ${todayTasks.map(task => `<li>${task.title} - ${task.priority} priority</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${upcomingTasks.length > 0 ? `
            <div style="background-color: #ECFDF5; border: 2px solid #10B981; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #10B981;">📋 Upcoming Tasks (${upcomingTasks.length})</h3>
              <ul>
                ${upcomingTasks.slice(0, 5).map(task => `<li>${task.title} - Due: ${task.deadline.toLocaleDateString()}</li>`).join('')}
                ${upcomingTasks.length > 5 ? `<li>... and ${upcomingTasks.length - 5} more</li>` : ''}
              </ul>
            </div>
          ` : ''}
          
          <p>Have a productive day!</p>
          <p>Best regards,<br>AI Campus Task Optimizer</p>
        </div>
      `;

      if (user.preferences.notifications.email) {
        await this.sendEmail(user.email, subject, html, '');
      }
    } catch (error) {
      console.error('Error sending daily summary:', error);
    }
  }

  // Check and send reminders for upcoming tasks
  async checkDailyReminders() {
    try {
      const users = await User.find({ isActive: true });
      
      for (const user of users) {
        const reminderTime = user.preferences.notifications.reminderTime || 30; // minutes
        const reminderThreshold = new Date(Date.now() + reminderTime * 60 * 1000);
        
        const upcomingTasks = await Task.find({
          userId: user._id,
          status: { $ne: 'completed' },
          deadline: { $lte: reminderThreshold, $gte: new Date() }
        });

        for (const task of upcomingTasks) {
          await this.sendTaskReminder(user, task);
        }
      }
    } catch (error) {
      console.error('Error checking daily reminders:', error);
    }
  }

  // Check and send overdue notifications
  async checkEveningReminders() {
    try {
      const users = await User.find({ isActive: true });
      
      for (const user of users) {
        const overdueTasks = await Task.find({
          userId: user._id,
          status: { $ne: 'completed' },
          deadline: { $lt: new Date() }
        });

        for (const task of overdueTasks) {
          await this.sendOverdueNotification(user, task);
        }
      }
    } catch (error) {
      console.error('Error checking evening reminders:', error);
    }
  }

  // Send weekly summary
  async sendWeeklySummary(user, tasks, schedule) {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekTasks = tasks.filter(task => 
        task.deadline >= weekStart && task.deadline <= weekEnd
      );
      
      const completedTasks = weekTasks.filter(task => task.status === 'completed');
      const pendingTasks = weekTasks.filter(task => task.status !== 'completed');

      const subject = `Weekly Summary - Week of ${weekStart.toLocaleDateString()}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Weekly Summary</h2>
          <p>Hello ${user.name},</p>
          <p>Here's your weekly summary for the week of ${weekStart.toLocaleDateString()}:</p>
          
          <div style="background-color: #ECFDF5; border: 2px solid #10B981; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #10B981;">✅ Completed Tasks (${completedTasks.length})</h3>
            <ul>
              ${completedTasks.map(task => `<li>${task.title}</li>`).join('')}
            </ul>
          </div>
          
          ${pendingTasks.length > 0 ? `
            <div style="background-color: #FEF3C7; border: 2px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #F59E0B;">📋 Pending Tasks (${pendingTasks.length})</h3>
              <ul>
                ${pendingTasks.map(task => `<li>${task.title} - Due: ${task.deadline.toLocaleDateString()}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <p>Great work this week! Keep it up!</p>
          <p>Best regards,<br>AI Campus Task Optimizer</p>
        </div>
      `;

      if (user.preferences.notifications.email) {
        await this.sendEmail(user.email, subject, html, '');
      }
    } catch (error) {
      console.error('Error sending weekly summary:', error);
    }
  }
}

module.exports = new NotificationService();
