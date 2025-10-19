import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Mock analytics data
  const analyticsData = {
    week: {
      totalTasks: 25,
      completed: 18,
      inProgress: 4,
      pending: 3,
      overdue: 2,
      averageCompletionTime: 45,
      productivityScore: 85,
      categories: {
        academic: 8,
        assignment: 6,
        lab: 4,
        exam: 3,
        project: 2,
        internship: 2
      }
    }
  };

  const currentData = analyticsData[selectedPeriod];

  const stats = [
    {
      title: 'Total Tasks',
      value: currentData.totalTasks,
      icon: BarChart3,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Completed',
      value: currentData.completed,
      icon: CheckCircle,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'In Progress',
      value: currentData.inProgress,
      icon: Clock,
      color: 'yellow',
      change: '+3%'
    },
    {
      title: 'Overdue',
      value: currentData.overdue,
      icon: AlertTriangle,
      color: 'red',
      change: '-2%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your productivity and performance insights
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          {['day', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`btn btn-sm ${
                selectedPeriod === period ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm font-medium mt-1 text-green-600">
                  {stat.change} from last {selectedPeriod}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                stat.color === 'blue' ? 'bg-blue-500' :
                stat.color === 'green' ? 'bg-green-500' :
                stat.color === 'yellow' ? 'bg-yellow-500' :
                'bg-red-500'
              } text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Completion</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-medium">{currentData.completed}/{currentData.totalTasks}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(currentData.completed / currentData.totalTasks) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-sm font-medium">{currentData.inProgress}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${(currentData.inProgress / currentData.totalTasks) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-medium">{currentData.pending}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-500 h-2 rounded-full" 
                style={{ width: `${(currentData.pending / currentData.totalTasks) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Category</h2>
          <div className="space-y-3">
            {Object.entries(currentData.categories).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${(count / currentData.totalTasks) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Score</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {currentData.productivityScore}%
            </div>
            <p className="text-sm text-gray-600">Based on completion rate and efficiency</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Completion Time</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {currentData.averageCompletionTime}m
            </div>
            <p className="text-sm text-gray-600">Per task</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {Math.round((currentData.completed / currentData.totalTasks) * 100)}%
            </div>
            <p className="text-sm text-gray-600">Tasks completed this {selectedPeriod}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
