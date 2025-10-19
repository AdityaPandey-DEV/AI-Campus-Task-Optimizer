import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';
import TaskCard from '../Tasks/TaskCard';
import moment from 'moment';

const UpcomingTasks = ({ tasks = [] }) => {
  const upcomingTasks = tasks.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Upcoming Tasks ({tasks.length})
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {upcomingTasks.length > 0 ? (
          upcomingTasks.map((task) => (
            <TaskCard key={task._id} task={task} compact />
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No upcoming tasks</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UpcomingTasks;
