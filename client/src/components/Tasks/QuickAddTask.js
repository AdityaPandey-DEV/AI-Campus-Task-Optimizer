import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { toast } from 'react-toastify';

const QuickAddTask = ({ onClose, onSuccess }) => {
  const { createTask, createTaskFromText } = useTasks();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      let result;
      if (useAI) {
        result = await createTaskFromText(input);
      } else {
        // Parse basic task info from input
        const taskData = {
          title: input,
          description: '',
          category: 'other',
          priority: 'medium',
          difficulty: 'medium',
          estimatedDuration: 60,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        };
        result = await createTask(taskData);
      }

      if (result.success) {
        toast.success('Task created successfully!');
        setInput('');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to create task');
      }
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const exampleInputs = [
    "Complete OS lab assignment due tomorrow",
    "Study for Data Structures exam next week",
    "Submit internship application form",
    "Prepare presentation for AI project",
    "Attend machine learning workshop on Friday"
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Quick Add Task
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">
                  Describe your task
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., Complete OS lab assignment due tomorrow"
                  className="form-input h-24 resize-none"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useAI"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="useAI" className="text-sm text-gray-700 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                  Use AI to parse task details
                </label>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Try these examples:
                </p>
                <div className="space-y-1">
                  {exampleInputs.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setInput(example)}
                      className="block text-sm text-blue-600 hover:text-blue-800 text-left"
                    >
                      • {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="loading-spinner h-4 w-4"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Add Task</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickAddTask;
