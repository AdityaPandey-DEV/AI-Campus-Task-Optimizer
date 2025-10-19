const { google } = require('googleapis');
const User = require('../models/User');

class GoogleService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Get authorization URL for Google OAuth
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/forms',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/calendar'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  // Set user's Google tokens
  async setUserTokens(userId, tokens) {
    try {
      await User.findByIdAndUpdate(userId, {
        googleTokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: new Date(tokens.expiry_date)
        }
      });
    } catch (error) {
      console.error('Error setting user tokens:', error);
      throw error;
    }
  }

  // Get authenticated client for user
  async getAuthenticatedClient(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.googleTokens) {
        throw new Error('User not authenticated with Google');
      }

      this.oauth2Client.setCredentials({
        access_token: user.googleTokens.accessToken,
        refresh_token: user.googleTokens.refreshToken,
        expiry_date: user.googleTokens.expiryDate
      });

      return this.oauth2Client;
    } catch (error) {
      console.error('Error getting authenticated client:', error);
      throw error;
    }
  }

  // Auto-fill Google Form
  async autoFillForm(userId, formId, responses) {
    try {
      const auth = await this.getAuthenticatedClient(userId);
      const forms = google.forms({ version: 'v1', auth });

      // Get form structure
      const form = await forms.forms.get({ formId });
      const formStructure = form.data;

      // Create response
      const responseData = {
        responses: []
      };

      // Map responses to form fields
      for (const [questionId, answer] of Object.entries(responses)) {
        responseData.responses.push({
          itemId: questionId,
          response: {
            textAnswers: {
              answers: [{ value: answer }]
            }
          }
        });
      }

      // Submit response
      const result = await forms.forms.responses.create({
        formId,
        requestBody: responseData
      });

      return result.data;
    } catch (error) {
      console.error('Error auto-filling form:', error);
      throw error;
    }
  }

  // Get Google Sheets data
  async getSheetsData(userId, spreadsheetId, range) {
    try {
      const auth = await this.getAuthenticatedClient(userId);
      const sheets = google.sheets({ version: 'v4', auth });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      });

      return response.data.values;
    } catch (error) {
      console.error('Error getting sheets data:', error);
      throw error;
    }
  }

  // Update Google Sheets data
  async updateSheetsData(userId, spreadsheetId, range, values) {
    try {
      const auth = await this.getAuthenticatedClient(userId);
      const sheets = google.sheets({ version: 'v4', auth });

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error updating sheets data:', error);
      throw error;
    }
  }

  // Create Google Calendar event
  async createCalendarEvent(userId, eventData) {
    try {
      const auth = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime,
          timeZone: 'UTC'
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: 'UTC'
        },
        location: eventData.location,
        attendees: eventData.attendees || []
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Get Google Calendar events
  async getCalendarEvents(userId, startDate, endDate) {
    try {
      const auth = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items;
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  }

  // Sync Google Calendar with user schedule
  async syncCalendarWithSchedule(userId) {
    try {
      const auth = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });
      const Schedule = require('../models/Schedule');

      // Get events from the next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const events = await this.getCalendarEvents(userId, startDate, endDate);

      // Convert events to schedule items
      const scheduleItems = events.map(event => ({
        userId,
        type: 'calendar',
        title: event.summary || 'Untitled Event',
        description: event.description || '',
        startTime: new Date(event.start.dateTime || event.start.date),
        endTime: new Date(event.end.dateTime || event.end.date),
        location: event.location || '',
        color: event.colorId ? `#${event.colorId}` : '#3B82F6',
        isRecurring: !!event.recurrence,
        metadata: {
          googleEventId: event.id,
          htmlLink: event.htmlLink
        }
      }));

      // Save to database
      await Schedule.insertMany(scheduleItems);

      return { synced: scheduleItems.length };
    } catch (error) {
      console.error('Error syncing calendar:', error);
      throw error;
    }
  }

  // Get form templates for common academic forms
  async getFormTemplates() {
    return [
      {
        id: 'attendance',
        name: 'Attendance Form',
        description: 'Auto-fill attendance forms with student information',
        fields: {
          name: 'Full Name',
          studentId: 'Student ID',
          course: 'Course',
          year: 'Year',
          date: 'Date',
          time: 'Time'
        }
      },
      {
        id: 'internship',
        name: 'Internship Application',
        description: 'Auto-fill internship application forms',
        fields: {
          name: 'Full Name',
          email: 'Email',
          phone: 'Phone Number',
          university: 'University',
          course: 'Course',
          year: 'Year',
          cgpa: 'CGPA',
          skills: 'Skills',
          experience: 'Previous Experience'
        }
      },
      {
        id: 'project',
        name: 'Project Submission',
        description: 'Auto-fill project submission forms',
        fields: {
          name: 'Student Name',
          studentId: 'Student ID',
          projectTitle: 'Project Title',
          course: 'Course',
          instructor: 'Instructor',
          submissionDate: 'Submission Date'
        }
      }
    ];
  }

  // Auto-fill form using template
  async autoFillFormWithTemplate(userId, formId, templateId, customData = {}) {
    try {
      const templates = await this.getFormTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }

      const user = await User.findById(userId);
      const responses = {};

      // Fill with user data
      for (const [fieldKey, fieldName] of Object.entries(template.fields)) {
        if (customData[fieldKey]) {
          responses[fieldKey] = customData[fieldKey];
        } else {
          switch (fieldKey) {
            case 'name':
              responses[fieldKey] = user.name;
              break;
            case 'email':
              responses[fieldKey] = user.email;
              break;
            case 'university':
              responses[fieldKey] = user.university;
              break;
            case 'course':
              responses[fieldKey] = user.course;
              break;
            case 'year':
              responses[fieldKey] = user.year.toString();
              break;
            case 'date':
              responses[fieldKey] = new Date().toISOString().split('T')[0];
              break;
            case 'time':
              responses[fieldKey] = new Date().toTimeString().split(' ')[0];
              break;
            default:
              responses[fieldKey] = '';
          }
        }
      }

      return await this.autoFillForm(userId, formId, responses);
    } catch (error) {
      console.error('Error auto-filling form with template:', error);
      throw error;
    }
  }
}

module.exports = new GoogleService();
