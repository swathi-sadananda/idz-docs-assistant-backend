#!/bin/bash
# Complete setup and run script for IDz Documentation Assistant

echo "🚀 IDz Documentation Assistant - Setup & Run"
echo "=============================================="
echo ""

# Navigate to project directory
cd /Users/swathiks/Documents/GitHub/IDZ/idz-doc/doc-assistant

echo "📦 Step 1: Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: npm install failed"
    echo "Please check your internet connection and try again"
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Step 2: Creating .env file..."
    cat > .env << 'EOF'
PORT=3000
NODE_ENV=development

# Option 1: Use OpenAI (add your API key)
# OPENAI_API_KEY=sk-your-key-here
# OPENAI_MODEL=gpt-4

# Option 2: Use Local LLM (no API key needed)
USE_LOCAL_LLM=true
LOCAL_LLM_ENDPOINT=http://localhost:11434

DOCS_PATH=../
EOF
    echo "✅ .env file created (using local LLM by default)"
    echo ""
    echo "⚠️  NOTE: To use OpenAI instead:"
    echo "   1. Edit .env file"
    echo "   2. Add your OPENAI_API_KEY"
    echo "   3. Comment out USE_LOCAL_LLM line"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

echo "🎯 Step 3: Starting the server..."
echo ""
echo "Server will start at: http://localhost:3000"
echo "Widget demo at: http://localhost:3000/widget.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "Starting in 3 seconds..."
sleep 3

node backend/server.js

# Made with Bob
