import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, MessageCircle } from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Hello! I\'m your AI assistant. How can I help you with your tasks today?',
      time: new Date()
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: message,
      time: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: 'I understand you want help with that. Let me analyze your schedule and provide some suggestions...',
        time: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-600" />
          AI Assistant
        </h2>
      </div>
      
      {!isOpen ? (
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Get personalized help with your tasks and schedule optimization.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="w-full btn btn-primary flex items-center justify-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Start Chat</span>
          </button>
        </div>
      ) : (
        <div className="p-4">
          <div className="h-48 overflow-y-auto mb-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 form-input text-sm"
            />
            <button
              onClick={handleSendMessage}
              className="btn btn-primary btn-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Minimize
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AIAssistant;
