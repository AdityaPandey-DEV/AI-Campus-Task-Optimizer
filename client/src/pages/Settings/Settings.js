import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Clock, User, Shield } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      reminderTime: 30
    },
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    studySessions: 45,
    breakDuration: 15
  });

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'schedule', name: 'Schedule', icon: Clock },
    { id: 'privacy', name: 'Privacy', icon: Shield }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">Display Name</label>
            <input type="text" className="form-input" defaultValue="John Doe" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" defaultValue="john@student.edu" />
          </div>
          <div>
            <label className="form-label">University</label>
            <input type="text" className="form-input" defaultValue="University of Technology" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Push Notifications</label>
              <p className="text-sm text-gray-500">Receive push notifications in browser</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.push}
              onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="form-label">Reminder Time (minutes before deadline)</label>
            <input
              type="number"
              value={settings.notifications.reminderTime}
              onChange={(e) => handleSettingChange('notifications', 'reminderTime', parseInt(e.target.value))}
              className="form-input"
              min="5"
              max="1440"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderScheduleSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Working Hours</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Start Time</label>
            <input
              type="time"
              value={settings.workingHours.start}
              onChange={(e) => handleSettingChange('workingHours', 'start', e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">End Time</label>
            <input
              type="time"
              value={settings.workingHours.end}
              onChange={(e) => handleSettingChange('workingHours', 'end', e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Study Preferences</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Study Session Duration (minutes)</label>
            <input
              type="number"
              value={settings.studySessions}
              onChange={(e) => setSettings(prev => ({ ...prev, studySessions: parseInt(e.target.value) }))}
              className="form-input"
              min="15"
              max="120"
            />
          </div>
          <div>
            <label className="form-label">Break Duration (minutes)</label>
            <input
              type="number"
              value={settings.breakDuration}
              onChange={(e) => setSettings(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
              className="form-input"
              min="5"
              max="60"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Analytics</label>
              <p className="text-sm text-gray-500">Help improve the app by sharing usage data</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Google Integration</label>
              <p className="text-sm text-gray-500">Sync with Google Calendar and Forms</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-3">
          <button className="btn btn-secondary">Export Data</button>
          <button className="btn btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'schedule':
        return renderScheduleSettings();
      case 'privacy':
        return renderPrivacySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Customize your experience and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            {renderTabContent()}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
