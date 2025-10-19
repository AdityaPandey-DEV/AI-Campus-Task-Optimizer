import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  schedules: [],
  loading: false,
  error: null,
  filters: {
    status: '',
    category: '',
    priority: '',
    sortBy: 'deadline'
  },
  analytics: {
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    categories: {},
    priorities: {},
    averageCompletionTime: 0
  }
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        loading: false
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task._id === action.payload._id ? action.payload : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload)
      };
    case 'SET_SCHEDULES':
      return {
        ...state,
        schedules: action.payload
      };
    case 'ADD_SCHEDULE':
      return {
        ...state,
        schedules: [...state.schedules, action.payload]
      };
    case 'UPDATE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.map(schedule =>
          schedule._id === action.payload._id ? action.payload : schedule
        )
      };
    case 'DELETE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.filter(schedule => schedule._id !== action.payload)
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'SET_ANALYTICS':
      return {
        ...state,
        analytics: action.payload
      };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { user, token } = useAuth();

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Load tasks when user is authenticated
  useEffect(() => {
    if (user) {
      loadTasks();
      loadSchedules();
      loadAnalytics();
    }
  }, [user]);

  const loadTasks = async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`/api/tasks?${params}`);
      dispatch({ type: 'SET_TASKS', payload: response.data.tasks });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to load tasks' });
    }
  };

  const loadSchedules = async () => {
    try {
      const response = await axios.get('/api/schedule');
      dispatch({ type: 'SET_SCHEDULES', payload: response.data.schedules });
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const loadAnalytics = async (period = 'week') => {
    try {
      const response = await axios.get(`/api/tasks/analytics/overview?period=${period}`);
      dispatch({ type: 'SET_ANALYTICS', payload: response.data.analytics });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const createTask = async (taskData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.post('/api/tasks', taskData);
      dispatch({ type: 'ADD_TASK', payload: response.data.task });
      return { success: true, task: response.data.task };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const createTaskFromText = async (text) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.post('/api/tasks/from-text', { text });
      dispatch({ type: 'ADD_TASK', payload: response.data.task });
      return { success: true, task: response.data.task };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task from text';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, updates);
      dispatch({ type: 'UPDATE_TASK', payload: response.data.task });
      return { success: true, task: response.data.task };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const startTask = async (taskId) => {
    try {
      const response = await axios.post(`/api/tasks/${taskId}/start`);
      dispatch({ type: 'UPDATE_TASK', payload: response.data.task });
      return { success: true, task: response.data.task };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start task';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const completeTask = async (taskId, actualDuration) => {
    try {
      const response = await axios.post(`/api/tasks/${taskId}/complete`, { actualDuration });
      dispatch({ type: 'UPDATE_TASK', payload: response.data.task });
      return { success: true, task: response.data.task };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to complete task';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const createSchedule = async (scheduleData) => {
    try {
      const response = await axios.post('/api/schedule', scheduleData);
      dispatch({ type: 'ADD_SCHEDULE', payload: response.data.schedule });
      return { success: true, schedule: response.data.schedule };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create schedule';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const updateSchedule = async (scheduleId, updates) => {
    try {
      const response = await axios.put(`/api/schedule/${scheduleId}`, updates);
      dispatch({ type: 'UPDATE_SCHEDULE', payload: response.data.schedule });
      return { success: true, schedule: response.data.schedule };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update schedule';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const deleteSchedule = async (scheduleId) => {
    try {
      await axios.delete(`/api/schedule/${scheduleId}`);
      dispatch({ type: 'DELETE_SCHEDULE', payload: scheduleId });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete schedule';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    loadTasks(filters);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const getUpcomingDeadlines = async (days = 7) => {
    try {
      const response = await axios.get(`/api/tasks/upcoming/deadlines?days=${days}`);
      return response.data.tasks;
    } catch (error) {
      console.error('Failed to get upcoming deadlines:', error);
      return [];
    }
  };

  const getOptimizedSchedule = async (date) => {
    try {
      const response = await axios.get(`/api/schedule/optimized/daily?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get optimized schedule:', error);
      return null;
    }
  };

  const value = {
    ...state,
    loadTasks,
    loadSchedules,
    loadAnalytics,
    createTask,
    createTaskFromText,
    updateTask,
    deleteTask,
    startTask,
    completeTask,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    setFilters,
    clearError,
    getUpcomingDeadlines,
    getOptimizedSchedule
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
