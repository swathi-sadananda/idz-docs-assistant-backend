# Quick Start Guide - IDz Documentation Assistant

Get the interactive documentation assistant up and running in minutes!

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key (or local LLM setup)
- Access to IDz documentation repository

## Installation

### 1. Clone and Setup

```bash
cd /Users/swathiks/Documents/GitHub/IDZ/idz-doc/doc-assistant

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
# API Configuration
PORT=3000
NODE_ENV=development

# OpenAI Configuration (Option 1)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# OR Local LLM Configuration (Option 2)
# USE_LOCAL_LLM=true
# LOCAL_LLM_ENDPOINT=http://localhost:11434

# Documentation Path
DOCS_PATH=../
EOF
```

### 2. Index Documentation

```bash
# This will parse all DITA files and create searchable index
npm run index-docs
```

Expected output:
```
📚 Indexing documentation...
✓ Found 1,234 DITA files
✓ Parsed 1,234 documents
✓ Created vector embeddings
✓ Index saved to data/index.db
✅ Indexing complete!
```

### 3. Start the Server

```bash
# Development mode with auto-reload
npm run dev
```

The assistant will be available at:
- **API**: http://localhost:3000/api
- **Widget Demo**: http://localhost:3000/widget.html
- **Full UI**: http://localhost:3000

## Testing the Assistant

### Option 1: Test Widget Locally

1. Open `http://localhost:3000/widget.html` in your browser
2. Click the blue chat button in the bottom-right corner
3. Try asking questions like:
   - "How do I debug a COBOL program?"
   - "What's new in version 17.0.5?"
   - "How to set up a remote connection?"

### Option 2: Test API Directly

```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I debug COBOL in IDz?",
    "context": {
      "page": "/docs/debugging"
    }
  }'
```

### Option 3: Embed in Local HTML

Create a test file `test-embed.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test IDz Assistant</title>
</head>
<body>
  <h1>IBM Developer for z/OS Documentation</h1>
  <p>This is a test page with the assistant embedded.</p>

  <!-- Embed the assistant widget -->
  <script>
    window.IDZ_ASSISTANT_CONFIG = {
      apiEndpoint: 'http://localhost:3000/api'
    };
  </script>
  <script src="http://localhost:3000/widget.html"></script>
</body>
</html>
```

## Embedding in IBM Docs Website

### Step 1: Build for Production

```bash
npm run build
```

This creates optimized files in `dist/`:
- `widget.js` - Standalone widget
- `widget.css` - Styles
- `inline.js` - Inline version

### Step 2: Deploy to CDN

Upload files to your CDN or hosting:

```bash
# Example: Upload to IBM Cloud Object Storage
ibmcloud cos upload --bucket idz-docs-assistant --key widget.js --file dist/widget.js
ibmcloud cos upload --bucket idz-docs-assistant --key widget.css --file dist/widget.css
```

### Step 3: Add to IBM Docs Pages

Add this snippet to your documentation page template:

```html
<!-- In <head> section -->
<link rel="stylesheet" href="https://cdn.ibm.com/docs-assistant/v1/widget.css">

<!-- Before </body> tag -->
<script>
  window.IDZ_ASSISTANT_CONFIG = {
    apiEndpoint: 'https://api.ibm.com/docs-assistant',
    product: 'developer-for-zos',
    version: '17.0.5',
    theme: 'ibm-carbon'
  };
</script>
<script src="https://cdn.ibm.com/docs-assistant/v1/widget.js"></script>
```

## Configuration Options

### Basic Configuration

```javascript
window.IDZ_ASSISTANT_CONFIG = {
  // Required
  apiEndpoint: 'https://api.ibm.com/docs-assistant',
  
  // Optional
  position: 'bottom-right',  // or 'bottom-left', 'top-right', 'top-left'
  theme: 'ibm-carbon',       // or 'light', 'dark'
  defaultOpen: false,        // Open on page load
  showWelcome: true,         // Show welcome message
  
  // Context
  product: 'developer-for-zos',
  version: '17.0.5',
  
  // Features
  features: {
    stepByStep: true,
    codeExamples: true,
    relatedTopics: true,
    feedback: true
  }
};
```

### Advanced Configuration

```javascript
window.IDZ_ASSISTANT_CONFIG = {
  apiEndpoint: 'https://api.ibm.com/docs-assistant',
  
  // Custom styling
  customStyles: {
    primaryColor: '#0f62fe',
    fontFamily: 'IBM Plex Sans',
    borderRadius: '12px'
  },
  
  // Analytics
  analytics: {
    enabled: true,
    provider: 'ibm-analytics',
    trackingId: 'UA-XXXXX-Y'
  },
  
  // Callbacks
  onOpen: () => console.log('Assistant opened'),
  onClose: () => console.log('Assistant closed'),
  onMessage: (msg) => console.log('Message sent:', msg),
  
  // Custom suggestions
  suggestions: [
    'How do I debug COBOL?',
    'Setup remote connection',
    'What\'s new in 17.0.5?'
  ]
};
```

## Troubleshooting

### Issue: "Cannot connect to API"

**Solution:**
1. Check if backend is running: `curl http://localhost:3000/api/health`
2. Verify CORS settings in `backend/server.js`
3. Check browser console for errors

### Issue: "No documentation found"

**Solution:**
1. Re-run indexing: `npm run index-docs`
2. Check `DOCS_PATH` in `.env` points to correct directory
3. Verify DITA files exist: `ls -la ../com.ibm.*/`

### Issue: "OpenAI API error"

**Solution:**
1. Verify API key is correct in `.env`
2. Check API quota/billing
3. Try using local LLM instead (see below)

### Using Local LLM (No OpenAI Required)

```bash
# Install Ollama
brew install ollama

# Start Ollama
ollama serve

# Pull a model
ollama pull llama2

# Update .env
echo "USE_LOCAL_LLM=true" >> .env
echo "LOCAL_LLM_ENDPOINT=http://localhost:11434" >> .env

# Restart server
npm run dev
```

## Next Steps

1. ✅ **Test locally** - Verify everything works
2. ✅ **Customize** - Adjust styling and configuration
3. ✅ **Deploy backend** - Set up production API server
4. ✅ **Integrate** - Add to IBM Docs website
5. ✅ **Monitor** - Track usage and feedback
6. 🔄 **Iterate** - Improve based on user feedback

## Support

- **Documentation**: See [README.md](./README.md)
- **API Reference**: See [API_REFERENCE.md](./API_REFERENCE.md)
- **Deployment**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Issues**: Report on GitHub

## Example Questions to Try

Once running, try these questions:

1. **Getting Started**
   - "How do I install IBM Developer for z/OS?"
   - "What are the system requirements?"

2. **Development Tasks**
   - "How do I create a COBOL program?"
   - "How to debug a program step by step?"
   - "How do I connect to a z/OS system?"

3. **Features**
   - "What's new in version 17.0.5?"
   - "How do I use the BMS editor?"
   - "What is CARMA?"

4. **Troubleshooting**
   - "Why can't I connect to the host?"
   - "How do I fix compilation errors?"
   - "Where are the log files?"

## Performance Tips

1. **Index Optimization**: Re-index only when docs change
2. **Caching**: Enable response caching for common questions
3. **CDN**: Use CDN for widget files
4. **API**: Deploy API close to users (regional endpoints)

---

**Ready to go!** 🚀

Start the assistant and begin helping users navigate your documentation!