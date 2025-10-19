#!/bin/bash

# AI Campus Task Optimizer - Startup Script

echo "🚀 Starting AI Campus Task Optimizer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please update .env file with your API keys and configuration."
    echo "   Required: MONGODB_URI, OPENAI_API_KEY, JWT_SECRET"
fi

echo "✅ Dependencies installed successfully!"
echo ""
echo "🔧 To start the application:"
echo "   1. Update .env file with your configuration"
echo "   2. Start MongoDB (if using local instance)"
echo "   3. Run: npm run dev (for backend)"
echo "   4. Run: cd client && npm start (for frontend)"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 For more information, see README.md"
