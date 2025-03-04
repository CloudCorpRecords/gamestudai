#!/bin/bash

# Print welcome message
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   GameStuAI Engine                         ║"
echo "║       AI-Assisted Open-Source 3D Game Engine Starter       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or newer."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d "v" -f 2 | cut -d "." -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version is too old. Please upgrade to v18 or newer."
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies with legacy peer deps to avoid conflicts
echo ""
echo "🔄 Installing dependencies (this may take a minute)..."
npm install --legacy-peer-deps

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Dependency installation failed. Trying one more time with force..."
    npm install --force
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Could not install dependencies. Please check your internet connection and try again."
        exit 1
    fi
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🚀 Starting development server..."
echo ""
echo "📝 The application will open in your browser shortly..."
echo "   Press Ctrl+C to stop the server when you're done."
echo ""

# Start the development server
npm run dev

# This line will only execute if the server is stopped
echo ""
echo "👋 Thanks for using GameStuAI Engine!" 