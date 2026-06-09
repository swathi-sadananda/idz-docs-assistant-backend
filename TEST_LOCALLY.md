# Test the Assistant Locally - Complete Guide

Follow these steps to test the documentation assistant on your machine.

## ✅ What You've Already Done

1. ✅ Installed dependencies: `npm install`
2. ✅ Created .env file with basic config

## 🚀 Next Steps to Run Locally

### Step 1: Update Your .env File

You need to add an OpenAI API key. Run this command:

```bash
cd /Users/swathiks/Documents/GitHub/IDZ/idz-doc/doc-assistant

# Edit your .env file
nano .env
```

Then update it to look like this:

```bash
PORT=3000
NODE_ENV=development

# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4

DOCS_PATH=../
```

**Don't have an OpenAI API key?** Use local LLM instead (see Alternative Option below).

### Step 2: Try Starting the Server

```bash
cd /Users/swathiks/Documents/GitHub/IDZ/idz-doc/doc-assistant
node backend/server.js
```

**Expected Output:**
```
🚀 IDz Documentation Assistant API running on port 3000
📚 Environment: development
🔗 API: http://localhost:3000/api
```

### Step 3: Test the API

Open a new terminal and test:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","version":"1.0.0"}
```

### Step 4: View the Widget

Open your browser and go to:
```
http://localhost:3000/widget.html
```

You should see the chat widget! Click the blue button to open it.

## 🔧 Troubleshooting

### Error: "Cannot find module 'express'"

**Solution:** Install dependencies again:
```bash
cd /Users/swathiks/Documents/GitHub/IDZ/idz-doc/doc-assistant
npm install
```

### Error: "OPENAI_API_KEY is not defined"

**Solution:** Either:
1. Add your OpenAI API key to .env file
2. OR use local LLM (see below)

### Error: "Port 3000 is already in use"

**Solution:** Use a different port:
```bash
PORT=3001 node backend/server.js
```

Then access at: http://localhost:3001

## 🆓 Alternative: Use Local LLM (No API Key Needed)

If you don't want to use OpenAI, use Ollama (free, runs locally):

### Install Ollama:
```bash
# Install Ollama
brew install ollama

# Start Ollama service
ollama serve
```

### In a new terminal, pull a model:
```bash
ollama pull llama2
```

### Update your .env:
```bash
PORT=3000
NODE_ENV=development

# Use local LLM instead of OpenAI
USE_LOCAL_LLM=true
LOCAL_LLM_ENDPOINT=http://localhost:11434

DOCS_PATH=../
```

### Start the server:
```bash
node backend/server.js
```

## 🧪 Testing the Chat

Once the server is running:

1. **Open**: http://localhost:3000/widget.html
2. **Click**: The blue chat button (bottom-right)
3. **Type**: "How do I debug COBOL?"
4. **Send**: Press Enter or click send button

The assistant will:
- Search your documentation
- Generate a response using AI
- Show relevant sources
- Provide step-by-step guidance if applicable

## 📊 What's Happening Behind the Scenes

When you send a message:

1. **Frontend** (widget.html) → Sends message to API
2. **Backend** (server.js) → Receives request
3. **Search Service** → Finds relevant DITA docs
4. **AI Service** → Generates intelligent response
5. **Response** → Sent back to widget with sources

## ⚠️ Known Limitations (Demo Mode)

Since this is a demo/development setup:

- ✅ Widget UI works perfectly
- ✅ API endpoints are functional
- ⚠️ Only parses first 50 DITA files (for speed)
- ⚠️ Uses simple text search (not vector embeddings)
- ⚠️ No persistent database yet

For production, you'd want:
- Full documentation indexing
- Vector database (ChromaDB)
- Caching layer
- Production-grade hosting

## 🎯 Quick Test Commands

### Test the API directly:

```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I debug COBOL?",
    "context": {"page": "/docs/debugging"}
  }'

# Test search endpoint
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "debugging"}'

# Test docs structure
curl http://localhost:3000/api/docs/structure
```

## 📝 What to Do After Testing

### If Everything Works:
1. ✅ Great! The assistant is functional
2. ✅ Commit all changes to GitHub
3. ✅ Share with your team
4. ✅ Plan production deployment

### If You Encounter Issues:
1. Check the error messages
2. Verify .env configuration
3. Ensure all dependencies are installed
4. Check that DITA files exist in parent directory

## 🚀 Next Steps After Local Testing

1. **Commit Changes**:
   ```bash
   # In GitHub Desktop:
   # - Review all files
   # - Commit with message: "Add interactive documentation assistant"
   # - Push to origin
   ```

2. **Create Pull Request**:
   - Go to GitHub.com
   - Create PR from bob-a-thon-17.0.5
   - Share with team for review

3. **Plan Deployment**:
   - Set up production backend (IBM Cloud/AWS)
   - Configure production OpenAI key
   - Deploy widget to CDN
   - Integrate into IBM Docs website

## 💡 Tips

- **Development**: Use `nodemon` for auto-reload: `npm run server`
- **Debugging**: Check terminal output for errors
- **Testing**: Use browser DevTools Console to see API calls
- **Performance**: First load may be slow (parsing DITA files)

## 📚 Additional Resources

- **README.md** - Project overview
- **QUICKSTART.md** - Setup guide
- **DEPLOYMENT_GUIDE.md** - Production deployment
- **PROJECT_SUMMARY.md** - Technical details

## ❓ Common Questions

**Q: Do I need to test locally before committing?**
A: No, but it's recommended to verify everything works.

**Q: Can I skip the OpenAI API key?**
A: Yes! Use local LLM with Ollama (see Alternative Option above).

**Q: How long does it take to start?**
A: First start: 10-30 seconds (parsing docs). Subsequent starts: 2-5 seconds.

**Q: Can I test without the full documentation?**
A: Yes! The demo mode works with just a few DITA files.

---

**Ready to test?** Start with Step 1 above! 🚀