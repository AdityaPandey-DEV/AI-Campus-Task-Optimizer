# AI Campus Task Optimizer

A comprehensive AI-powered task management system designed specifically for college students to efficiently manage academic and campus-related work.

## 🚀 Features

### Core Functionality
- **AI-Powered Task Management**: Intelligent task prioritization and scheduling
- **Natural Language Processing**: Add tasks using natural language (e.g., "Plan my tasks for this week including OS lab and internship form")
- **Smart Scheduling**: Automatic timetable analysis and conflict detection
- **Google Integration**: Auto-fill Google Forms and sync with Google Calendar
- **Intelligent Reminders**: Email notifications for deadlines and attendance alerts
- **Progress Tracking**: Visual analytics and performance insights

### AI Capabilities
- **Task Parsing**: Convert natural language input into structured tasks
- **Schedule Optimization**: AI-optimized daily and weekly schedules
- **Priority Scoring**: Intelligent task prioritization based on urgency, difficulty, and time
- **Study Strategies**: Personalized study recommendations
- **Announcement Analysis**: Extract actionable items from academic announcements

### User Interface
- **Modern Dashboard**: Clean, intuitive interface with color-coded tasks
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live task status and progress tracking
- **Customizable Filters**: Filter tasks by status, category, priority, and more
- **Visual Analytics**: Charts and graphs for performance insights

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **OpenAI GPT-3.5** for AI capabilities
- **Google APIs** for Forms, Sheets, and Calendar integration
- **JWT** for authentication
- **Nodemailer** for email notifications
- **Node-cron** for scheduled tasks

### Frontend
- **React 18** with modern hooks
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls
- **Chart.js** for data visualization
- **Lucide React** for icons

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- OpenAI API key
- Google Cloud Console project (for Google APIs)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AdityaPandey-DEV/AI-Campus-Task-Optimizer.git
   cd AI-Campus-Task-Optimizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/ai-campus-optimizer
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_here
   
   # OpenAI API
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Google APIs
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/preferences` - Update user preferences

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `POST /api/tasks/from-text` - Create task from natural language
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/start` - Start task
- `POST /api/tasks/:id/complete` - Complete task

### Schedule
- `GET /api/schedule` - Get schedules
- `POST /api/schedule` - Create schedule item
- `GET /api/schedule/optimized/daily` - Get AI-optimized daily schedule
- `GET /api/schedule/available-slots` - Find available time slots

### AI Services
- `POST /api/ai/parse-input` - Parse natural language input
- `POST /api/ai/optimize-schedule` - Optimize task schedule
- `GET /api/ai/recommendations` - Get AI recommendations
- `POST /api/ai/chat` - Chat with AI assistant

### Google Integration
- `GET /api/google/auth-url` - Get Google OAuth URL
- `POST /api/google/callback` - Handle OAuth callback
- `POST /api/google/forms/auto-fill` - Auto-fill Google Forms
- `GET /api/google/calendar/events` - Get calendar events

### Notifications
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/test` - Send test notification

## 🎯 Usage Examples

### Natural Language Task Creation
```
"Complete OS lab assignment due tomorrow"
"Study for Data Structures exam next week"
"Submit internship application form"
"Prepare presentation for AI project"
```

### AI-Powered Scheduling
The system automatically:
- Analyzes your timetable and existing commitments
- Prioritizes tasks based on urgency and difficulty
- Suggests optimal time slots for each task
- Considers your working hours and break preferences

### Google Forms Auto-fill
Pre-configured templates for:
- Attendance forms
- Internship applications
- Project submissions
- Course evaluations

## 📊 Features in Detail

### Task Management
- **Categories**: Academic, Assignment, Lab, Exam, Project, Internship, Attendance, Personal
- **Priorities**: Low, Medium, High, Urgent
- **Status Tracking**: Pending, In Progress, Completed, Cancelled
- **Progress Monitoring**: Visual progress bars and completion tracking

### Schedule Integration
- **Timetable Import**: Bulk import class schedules
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Recurring Events**: Support for weekly recurring classes
- **Holiday Management**: Academic calendar integration

### AI Intelligence
- **Smart Parsing**: Understands context and extracts task details
- **Priority Scoring**: AI-calculated priority scores (0-100)
- **Study Strategies**: Personalized study recommendations
- **Time Estimation**: AI-powered duration estimation

### Analytics & Insights
- **Performance Metrics**: Completion rates, time tracking
- **Category Breakdown**: Task distribution by category
- **Trend Analysis**: Weekly and monthly progress trends
- **Productivity Insights**: Peak working hours and efficiency patterns

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting for security
- **CORS Configuration**: Proper cross-origin resource sharing

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect to GitHub repository
4. Enable automatic deployments

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_email_password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aditya Pandey**
- GitHub: [@AdityaPandey-DEV](https://github.com/AdityaPandey-DEV)
- LinkedIn: [Aditya Pandey](https://linkedin.com/in/aditya-pandey-dev)

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- Google for their comprehensive APIs
- The React and Node.js communities
- All contributors and testers

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/AdityaPandey-DEV/AI-Campus-Task-Optimizer/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer

---

**Made with ❤️ for college students everywhere**
# AI-Campus-Task-Optimizer
