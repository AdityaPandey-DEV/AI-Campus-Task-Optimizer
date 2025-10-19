import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, Filter } from 'lucide-react';

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock schedule data
  const scheduleData = [
    {
      id: 1,
      title: 'Data Structures Lecture',
      time: '09:00 - 10:30',
      location: 'Room 101',
      type: 'lecture',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'AI Lab Session',
      time: '14:00 - 16:00',
      location: 'Lab 205',
      type: 'lab',
      color: 'bg-green-500'
    },
    {
      id: 3,
      title: 'Machine Learning Workshop',
      time: '18:00 - 20:00',
      location: 'Auditorium',
      type: 'workshop',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-1">
            View and manage your academic schedule
          </p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2 mt-4 sm:mt-0">
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
            <div className="flex space-x-2">
              <button className="btn btn-secondary btn-sm">Today</button>
              <button className="btn btn-secondary btn-sm">Week</button>
              <button className="btn btn-secondary btn-sm">Month</button>
            </div>
          </div>
          
          {/* Simple calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className={`p-2 text-center text-sm border border-gray-200 rounded ${
                  i === 15 ? 'bg-primary-100 text-primary-700 font-semibold' : 'text-gray-700'
                }`}
              >
                {i - 6 > 0 && i - 6 <= 31 ? i - 6 : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          <div className="space-y-3">
            {scheduleData.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg text-white ${event.color}`}
              >
                <h3 className="font-medium">{event.title}</h3>
                <div className="flex items-center text-sm opacity-90 mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{event.time}</span>
                </div>
                <div className="text-sm opacity-90 mt-1">
                  {event.location}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Overview</h2>
        <div className="grid grid-cols-7 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-sm font-medium text-gray-500 mb-2">{day}</div>
              <div className="space-y-1">
                {index < 3 && (
                  <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded">
                    Lecture
                  </div>
                )}
                {index === 1 && (
                  <div className="bg-green-100 text-green-800 text-xs p-1 rounded">
                    Lab
                  </div>
                )}
                {index === 4 && (
                  <div className="bg-purple-100 text-purple-800 text-xs p-1 rounded">
                    Workshop
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
