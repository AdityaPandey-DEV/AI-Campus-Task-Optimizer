const OpenAI = require('openai');
const natural = require('natural');
const compromise = require('compromise');
const moment = require('moment');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Initialize natural language processing
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  // Parse natural language input to extract task information
  async parseTaskInput(input, userContext) {
    try {
      const prompt = `
        Parse the following natural language input from a college student and extract task information:
        
        Input: "${input}"
        
        User Context:
        - University: ${userContext.university}
        - Course: ${userContext.course}
        - Year: ${userContext.year}
        
        Extract and return a JSON object with the following structure:
        {
          "title": "Clear task title",
          "description": "Detailed description if available",
          "category": "academic|assignment|lab|exam|project|internship|attendance|personal|other",
          "priority": "low|medium|high|urgent",
          "difficulty": "easy|medium|hard",
          "estimatedDuration": number in minutes,
          "deadline": "ISO date string or null if not specified",
          "subject": "subject name if mentioned",
          "location": "location if mentioned",
          "tags": ["array", "of", "relevant", "tags"]
        }
        
        Rules:
        1. If deadline is not specified, estimate based on context (e.g., "this week" = 7 days from now)
        2. Estimate duration based on task type and complexity
        3. Set priority based on urgency indicators (urgent, ASAP, important, etc.)
        4. Extract subject names from common academic terms
        5. Be conservative with time estimates
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const parsedTask = JSON.parse(response.choices[0].message.content);
      
      // Validate and clean the parsed task
      return this.validateParsedTask(parsedTask);
    } catch (error) {
      console.error('Error parsing task input:', error);
      return this.fallbackParsing(input);
    }
  }

  // Optimize task schedule using AI
  async optimizeTaskSchedule(tasks, schedule, userPreferences) {
    try {
      const prompt = `
        Optimize the following task schedule for a college student:
        
        Tasks:
        ${JSON.stringify(tasks, null, 2)}
        
        Current Schedule:
        ${JSON.stringify(schedule, null, 2)}
        
        User Preferences:
        - Working hours: ${userPreferences.workingHours.start} - ${userPreferences.workingHours.end}
        - Study session duration: ${userPreferences.studySessions} minutes
        - Break duration: ${userPreferences.breakDuration} minutes
        
        Create an optimized schedule that:
        1. Prioritizes urgent and high-priority tasks
        2. Considers task dependencies
        3. Fits within available time slots
        4. Includes appropriate breaks
        5. Balances workload across days
        6. Accounts for task difficulty and estimated duration
        
        Return a JSON array of scheduled tasks with:
        {
          "taskId": "task_id",
          "scheduledStartTime": "ISO date string",
          "scheduledEndTime": "ISO date string",
          "reasoning": "explanation for this scheduling decision"
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error optimizing schedule:', error);
      return this.fallbackOptimization(tasks, schedule, userPreferences);
    }
  }

  // Generate task recommendations
  async generateTaskRecommendations(userId, currentTasks, schedule, academicCalendar) {
    try {
      const prompt = `
        Based on the following information, suggest additional tasks or optimizations for a college student:
        
        Current Tasks:
        ${JSON.stringify(currentTasks, null, 2)}
        
        Schedule:
        ${JSON.stringify(schedule, null, 2)}
        
        Academic Calendar:
        ${JSON.stringify(academicCalendar, null, 2)}
        
        Suggest:
        1. Missing tasks that should be added
        2. Tasks that could be broken down into smaller subtasks
        3. Time management improvements
        4. Study strategies for upcoming exams
        5. Preparation tasks for future deadlines
        
        Return a JSON array of recommendations:
        {
          "type": "missing_task|breakdown|optimization|study_strategy|preparation",
          "title": "Recommendation title",
          "description": "Detailed description",
          "priority": "low|medium|high",
          "suggestedTasks": ["array of suggested task titles if applicable"]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 800
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  // Analyze academic announcements and extract actionable items
  async analyzeAnnouncements(announcements) {
    try {
      const prompt = `
        Analyze the following academic announcements and extract actionable tasks and important information:
        
        Announcements:
        ${JSON.stringify(announcements, null, 2)}
        
        Extract:
        1. Deadlines and important dates
        2. Required actions (forms to fill, documents to submit)
        3. Schedule changes
        4. New assignments or projects
        5. Important reminders
        
        Return a JSON object:
        {
          "deadlines": [{"date": "ISO string", "description": "what's due"}],
          "actions": [{"action": "what to do", "priority": "high|medium|low"}],
          "scheduleChanges": [{"change": "description", "date": "when"}],
          "newTasks": [{"title": "task title", "deadline": "ISO string", "category": "category"}],
          "reminders": ["array of important reminders"]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 600
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing announcements:', error);
      return { deadlines: [], actions: [], scheduleChanges: [], newTasks: [], reminders: [] };
    }
  }

  // Calculate AI priority score for tasks
  calculateAIPriority(task, userContext) {
    let score = 0;
    
    // Time-based scoring
    const timeLeft = task.deadline.getTime() - Date.now();
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    
    if (hoursLeft <= 24) score += 40;
    else if (hoursLeft <= 72) score += 30;
    else if (hoursLeft <= 168) score += 20;
    else score += 10;
    
    // Category-based scoring
    const categoryWeights = {
      'exam': 35,
      'assignment': 30,
      'project': 25,
      'lab': 20,
      'attendance': 15,
      'academic': 20,
      'internship': 25,
      'personal': 10,
      'other': 15
    };
    score += categoryWeights[task.category] || 15;
    
    // Difficulty-based scoring
    const difficultyWeights = { 'hard': 20, 'medium': 10, 'easy': 5 };
    score += difficultyWeights[task.difficulty] || 10;
    
    // User priority override
    const priorityWeights = { 'urgent': 30, 'high': 20, 'medium': 10, 'low': 5 };
    score += priorityWeights[task.priority] || 10;
    
    return Math.min(100, Math.max(0, score));
  }

  // Fallback parsing when AI fails
  fallbackParsing(input) {
    const doc = compromise(input);
    const nouns = doc.nouns().out('array');
    const verbs = doc.verbs().out('array');
    
    return {
      title: input.substring(0, 100),
      description: input,
      category: 'other',
      priority: 'medium',
      difficulty: 'medium',
      estimatedDuration: 60,
      deadline: null,
      subject: null,
      location: null,
      tags: [...nouns, ...verbs].slice(0, 5)
    };
  }

  // Fallback optimization when AI fails
  fallbackOptimization(tasks, schedule, userPreferences) {
    const optimizedTasks = [];
    const sortedTasks = tasks.sort((a, b) => {
      const aScore = this.calculateAIPriority(a, {});
      const bScore = this.calculateAIPriority(b, {});
      return bScore - aScore;
    });

    let currentTime = new Date();
    currentTime.setHours(parseInt(userPreferences.workingHours.start.split(':')[0]), 0, 0, 0);

    for (const task of sortedTasks) {
      const endTime = new Date(currentTime.getTime() + task.estimatedDuration * 60000);
      
      optimizedTasks.push({
        taskId: task._id,
        scheduledStartTime: currentTime.toISOString(),
        scheduledEndTime: endTime.toISOString(),
        reasoning: 'Fallback scheduling based on priority'
      });
      
      currentTime = new Date(endTime.getTime() + userPreferences.breakDuration * 60000);
    }

    return optimizedTasks;
  }

  // Validate parsed task data
  validateParsedTask(task) {
    const validCategories = ['academic', 'assignment', 'lab', 'exam', 'project', 'internship', 'attendance', 'personal', 'other'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const validDifficulties = ['easy', 'medium', 'hard'];

    return {
      title: task.title || 'Untitled Task',
      description: task.description || '',
      category: validCategories.includes(task.category) ? task.category : 'other',
      priority: validPriorities.includes(task.priority) ? task.priority : 'medium',
      difficulty: validDifficulties.includes(task.difficulty) ? task.difficulty : 'medium',
      estimatedDuration: Math.max(15, Math.min(480, task.estimatedDuration || 60)), // 15 min to 8 hours
      deadline: task.deadline ? new Date(task.deadline) : null,
      subject: task.subject || null,
      location: task.location || null,
      tags: Array.isArray(task.tags) ? task.tags.slice(0, 10) : []
    };
  }
}

module.exports = new AIService();
