import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  Play, 
  CheckCircle, 
  Edit, 
  Trash2,
  MoreVertical
} from 'lucide-react';
import moment from 'moment';
import { useTasks } from '../../contexts/TaskContext';
import { toast } from 'react-toastify';

const TaskCard = ({ task, showActions = false, compact = false }) => {
  const { updateTask, deleteTask, startTask, completeTask } = useTasks();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-purple-100 text-purple-800';
      case 'lab': return 'bg-green-100 text-green-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'project': return 'bg-orange-100 text-orange-800';
      case 'internship': return 'bg-indigo-100 text-indigo-800';
      case 'attendance': return 'bg-yellow-100 text-yellow-800';
      case 'personal': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
  const timeRemaining = moment(task.deadline).fromNow();

  const handleStartTask = async () => {
    setIsLoading(true);
    try {
      await startTask(task._id);
      toast.success('Task started!');
    } catch (error) {
      toast.error('Failed to start task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    setIsLoading(true);
    try {
      await completeTask(task._id, task.estimatedDuration);
      toast.success('Task completed!');
    } catch (error) {
      toast.error('Failed to complete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsLoading(true);
      try {
        await deleteTask(task._id);
        toast.success('Task deleted!');
      } catch (error) {
        toast.error('Failed to delete task');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (compact) {
    return (
      <div className={`task-card ${getPriorityColor(task.priority)} ${isOverdue ? 'ring-2 ring-red-500' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {task.title}
            </h3>
            <p className="text-xs text-gray-500">
              {moment(task.deadline).format('MMM D, h:mm A')}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`task-card ${getPriorityColor(task.priority)} ${isOverdue ? 'ring-2 ring-red-500' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {task.title}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(task.category)}`}>
              {task.category}
            </span>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                {timeRemaining}
              </span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{task.estimatedDuration} min</span>
            </div>

            {task.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{task.location}</span>
              </div>
            )}

            {task.instructor && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{task.instructor}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">
                {task.priority} priority
              </span>
            </div>

            {task.progress > 0 && (
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{task.progress}%</span>
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="relative ml-4">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  {task.status === 'pending' && (
                    <button
                      onClick={handleStartTask}
                      disabled={isLoading}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Task
                    </button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <button
                      onClick={handleCompleteTask}
                      disabled={isLoading}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Task
                    </button>
                  )}

                  <button
                    onClick={() => {/* Handle edit */}}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Task
                  </button>

                  <button
                    onClick={handleDeleteTask}
                    disabled={isLoading}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskCard;
