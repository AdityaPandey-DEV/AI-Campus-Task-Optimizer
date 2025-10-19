import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import moment from 'moment';

const RecentActivity = () => {
  // Mock data - in real app, this would come from API
  const activities = [
    {
      id: 1,
      type: 'completed',
      title: 'Completed Data Structures Assignment',
      time: moment().subtract(2, 'hours'),
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'started',
      title: 'Started AI Project Research',
      time: moment().subtract(4, 'hours'),
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'overdue',
      title: 'OS Lab Report',
      time: moment().subtract(1, 'day'),
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      id: 4,
      type: 'completed',
      title: 'Attended Machine Learning Workshop',
      time: moment().subtract(2, 'days'),
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent Activity
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-1 rounded-full ${activity.color}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500">
                {activity.time.fromNow()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
