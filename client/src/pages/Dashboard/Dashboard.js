import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import TaskCard from '../../components/Tasks/TaskCard';
import QuickAddTask from '../../components/Tasks/QuickAddTask';
import StatsCard from '../../components/Dashboard/StatsCard';
import UpcomingTasks from '../../components/Dashboard/UpcomingTasks';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import AIAssistant from '../../components/AI/AIAssistant';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    tasks, 
    analytics, 
    loading, 
    filters, 
    setFilters,
    getUpcomingDeadlines 
  } = useTasks();
  
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUpcomingTasks();
  }, []);

  const loadUpcomingTasks = async () => {
    const upcoming = await getUpcomingDeadlines(7);
    setUpcomingTasks(upcoming);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesCategory = !filters.category || task.category === filters.category;
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const todayTasks = filteredTasks.filter(task => {
    const today = new Date();
    const taskDate = new Date(task.deadline);
    return taskDate.toDateString() === today.toDateString();
  });

  const overdueTasks = filteredTasks.filter(task => {
    return new Date(task.deadline) < new Date() && task.status !== 'completed';
  });

  const stats = [
    {
      title: 'Total Tasks',
      value: analytics.total,
      icon: Calendar,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Completed',
      value: analytics.completed,
      icon: CheckCircle,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'In Progress',
      value: analytics.inProgress,
      icon: Clock,
      color: 'yellow',
      change: '+3%'
    },
    {
      title: 'Overdue',
      value: analytics.overdue,
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your tasks today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowQuickAdd(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Quick Add</span>
          </button>
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
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ category: e.target.value })}
              className="form-input"
            >
              <option value="">All Categories</option>
              <option value="academic">Academic</option>
              <option value="assignment">Assignment</option>
              <option value="lab">Lab</option>
              <option value="exam">Exam</option>
              <option value="project">Project</option>
              <option value="internship">Internship</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ priority: e.target.value })}
              className="form-input"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border border-red-200"
            >
              <div className="p-4 border-b border-red-200">
                <h2 className="text-lg font-semibold text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Overdue Tasks ({overdueTasks.length})
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {overdueTasks.slice(0, 3).map((task) => (
                  <TaskCard key={task._id} task={task} showActions />
                ))}
                {overdueTasks.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    And {overdueTasks.length - 3} more overdue tasks...
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Today's Tasks ({todayTasks.length})
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <TaskCard key={task._id} task={task} showActions />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks due today!</p>
                  <p className="text-sm">Great job staying on top of things.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* All Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Tasks ({filteredTasks.length})
              </h2>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard key={task._id} task={task} showActions />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks found</p>
                  <p className="text-sm">Try adjusting your filters or add a new task.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <UpcomingTasks tasks={upcomingTasks} />

          {/* Recent Activity */}
          <RecentActivity />

          {/* AI Assistant */}
          <AIAssistant />
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddTask
          onClose={() => setShowQuickAdd(false)}
          onSuccess={() => {
            setShowQuickAdd(false);
            loadUpcomingTasks();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
