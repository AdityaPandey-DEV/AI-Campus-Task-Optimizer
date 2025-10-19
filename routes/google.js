const express = require('express');
const auth = require('../middleware/auth');
const googleService = require('../services/googleService');

const router = express.Router();

// Get Google OAuth URL
router.get('/auth-url', auth, (req, res) => {
  try {
    const authUrl = googleService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Get auth URL error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle Google OAuth callback
router.post('/callback', auth, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    const tokens = await googleService.getTokens(code);
    await googleService.setUserTokens(req.userId, tokens);

    res.json({ 
      message: 'Google authentication successful',
      tokens: {
        accessToken: tokens.access_token,
        expiryDate: tokens.expiry_date
      }
    });
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// Auto-fill Google Form
router.post('/forms/auto-fill', auth, async (req, res) => {
  try {
    const { formId, responses } = req.body;
    
    if (!formId || !responses) {
      return res.status(400).json({ message: 'Form ID and responses are required' });
    }

    const result = await googleService.autoFillForm(req.userId, formId, responses);
    
    res.json({ 
      message: 'Form auto-filled successfully',
      result 
    });
  } catch (error) {
    console.error('Auto-fill form error:', error);
    res.status(500).json({ message: 'Failed to auto-fill form' });
  }
});

// Auto-fill form using template
router.post('/forms/auto-fill-template', auth, async (req, res) => {
  try {
    const { formId, templateId, customData } = req.body;
    
    if (!formId || !templateId) {
      return res.status(400).json({ message: 'Form ID and template ID are required' });
    }

    const result = await googleService.autoFillFormWithTemplate(
      req.userId, 
      formId, 
      templateId, 
      customData
    );
    
    res.json({ 
      message: 'Form auto-filled with template successfully',
      result 
    });
  } catch (error) {
    console.error('Auto-fill form with template error:', error);
    res.status(500).json({ message: 'Failed to auto-fill form with template' });
  }
});

// Get form templates
router.get('/forms/templates', auth, async (req, res) => {
  try {
    const templates = await googleService.getFormTemplates();
    res.json({ templates });
  } catch (error) {
    console.error('Get form templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Google Sheets data
router.get('/sheets/:spreadsheetId', auth, async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { range } = req.query;
    
    if (!range) {
      return res.status(400).json({ message: 'Range parameter is required' });
    }

    const data = await googleService.getSheetsData(req.userId, spreadsheetId, range);
    
    res.json({ data });
  } catch (error) {
    console.error('Get sheets data error:', error);
    res.status(500).json({ message: 'Failed to get sheets data' });
  }
});

// Update Google Sheets data
router.put('/sheets/:spreadsheetId', auth, async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { range, values } = req.body;
    
    if (!range || !values) {
      return res.status(400).json({ message: 'Range and values are required' });
    }

    const result = await googleService.updateSheetsData(
      req.userId, 
      spreadsheetId, 
      range, 
      values
    );
    
    res.json({ 
      message: 'Sheets data updated successfully',
      result 
    });
  } catch (error) {
    console.error('Update sheets data error:', error);
    res.status(500).json({ message: 'Failed to update sheets data' });
  }
});

// Create Google Calendar event
router.post('/calendar/events', auth, async (req, res) => {
  try {
    const { title, description, startTime, endTime, location, attendees } = req.body;
    
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Title, start time, and end time are required' 
      });
    }

    const eventData = {
      title,
      description,
      startTime,
      endTime,
      location,
      attendees
    };

    const event = await googleService.createCalendarEvent(req.userId, eventData);
    
    res.status(201).json({ 
      message: 'Calendar event created successfully',
      event 
    });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ message: 'Failed to create calendar event' });
  }
});

// Get Google Calendar events
router.get('/calendar/events', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Start date and end date are required' 
      });
    }

    const events = await googleService.getCalendarEvents(
      req.userId, 
      new Date(startDate), 
      new Date(endDate)
    );
    
    res.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ message: 'Failed to get calendar events' });
  }
});

// Sync Google Calendar with user schedule
router.post('/calendar/sync', auth, async (req, res) => {
  try {
    const result = await googleService.syncCalendarWithSchedule(req.userId);
    
    res.json({ 
      message: 'Calendar synced successfully',
      synced: result.synced
    });
  } catch (error) {
    console.error('Sync calendar error:', error);
    res.status(500).json({ message: 'Failed to sync calendar' });
  }
});

// Check Google authentication status
router.get('/auth-status', auth, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.userId);
    const isAuthenticated = !!(user && user.googleTokens && user.googleTokens.accessToken);
    
    res.json({ 
      isAuthenticated,
      hasTokens: !!user?.googleTokens
    });
  } catch (error) {
    console.error('Check auth status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
