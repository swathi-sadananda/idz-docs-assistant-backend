# Deployment Guide - Interactive Documentation Assistant

This guide covers deploying the assistant to both the IBM Docs website and the IDz product UI.

## Overview

The assistant is designed as a **web component** that can be embedded in:
1. **IBM Documentation Website** (https://www.ibm.com/docs/en/developer-for-zos/17.0.x)
2. **IDz Product UI** (Eclipse-based application)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    IBM Docs Website                      │
│  ┌────────────────────────────────────────────────┐    │
│  │         Documentation Assistant Widget          │    │
│  │  (Embedded via <script> tag or iframe)         │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
                    REST API
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Backend Services (Node.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ DITA Parser  │  │   AI Engine  │  │Vector Search │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Deployment Options

### Option 1: Embedded Widget (Recommended for IBM Docs)

The assistant loads as a floating chat widget on documentation pages.

**Features:**
- Non-intrusive floating button
- Expands to chat interface when clicked
- Context-aware (knows which doc page user is on)
- Minimal impact on existing page layout

**Integration:**
```html
<!-- Add to IBM Docs page template -->
<script src="https://docs-assistant.ibm.com/widget.js"></script>
<script>
  IDzDocsAssistant.init({
    apiEndpoint: 'https://docs-assistant-api.ibm.com',
    theme: 'ibm-carbon',
    position: 'bottom-right',
    contextPage: window.location.pathname
  });
</script>
```

### Option 2: Inline Integration

The assistant appears as part of the page content.

**Integration:**
```html
<div id="idz-docs-assistant"></div>
<script src="https://docs-assistant.ibm.com/widget.js"></script>
<script>
  IDzDocsAssistant.render('idz-docs-assistant', {
    mode: 'inline',
    height: '600px'
  });
</script>
```

### Option 3: Eclipse Plugin (For Product UI)

For integration into the IDz Eclipse-based product:

**Components:**
- Eclipse View/Editor plugin
- Embedded browser (SWT Browser) displaying the assistant
- Local API server or connection to cloud service

**Implementation:**
```java
// Eclipse plugin integration
public class DocsAssistantView extends ViewPart {
    private Browser browser;
    
    @Override
    public void createPartControl(Composite parent) {
        browser = new Browser(parent, SWT.NONE);
        browser.setUrl("http://localhost:3000/assistant");
    }
}
```

## Deployment Steps

### 1. Build the Assistant

```bash
cd doc-assistant
npm install
npm run build
```

This creates:
- `dist/widget.js` - Embeddable widget
- `dist/inline.js` - Inline version
- `dist/styles.css` - Styles

### 2. Deploy Backend API

**Option A: IBM Cloud**
```bash
# Deploy to IBM Cloud
ibmcloud cf push idz-docs-assistant-api
```

**Option B: Kubernetes**
```bash
# Build Docker image
docker build -t idz-docs-assistant:latest .

# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml
```

**Option C: AWS/Azure**
```bash
# Deploy using serverless framework
serverless deploy --stage production
```

### 3. Configure CDN

Upload built assets to CDN:
```bash
# Upload to IBM Cloud Object Storage or CDN
aws s3 sync dist/ s3://idz-docs-assistant/
```

### 4. Integrate into IBM Docs

**For IBM Documentation Team:**

1. Add script tag to documentation template
2. Configure API endpoint
3. Set up authentication (if needed)
4. Test on staging environment

**Example Integration:**
```html
<!-- In IBM Docs page header -->
<head>
  <!-- Existing IBM Docs styles -->
  <link rel="stylesheet" href="https://cdn.ibm.com/docs-assistant/v1/styles.css">
</head>

<body>
  <!-- Existing documentation content -->
  
  <!-- Assistant Widget - loads at bottom right -->
  <script src="https://cdn.ibm.com/docs-assistant/v1/widget.js"></script>
  <script>
    window.addEventListener('DOMContentLoaded', function() {
      IDzDocsAssistant.init({
        apiEndpoint: 'https://api.ibm.com/docs-assistant',
        product: 'developer-for-zos',
        version: '17.0.5',
        apiKey: 'YOUR_API_KEY',
        theme: {
          primaryColor: '#0f62fe',
          fontFamily: 'IBM Plex Sans'
        },
        features: {
          stepByStep: true,
          codeExamples: true,
          relatedTopics: true
        }
      });
    });
  </script>
</body>
```

## Configuration

### config.json
```json
{
  "api": {
    "endpoint": "https://api.ibm.com/docs-assistant",
    "timeout": 30000,
    "retries": 3
  },
  "ai": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 2000
  },
  "search": {
    "provider": "chromadb",
    "topK": 5,
    "threshold": 0.7
  },
  "ui": {
    "theme": "ibm-carbon",
    "position": "bottom-right",
    "defaultOpen": false,
    "showWelcomeMessage": true
  },
  "features": {
    "stepByStep": true,
    "codeExamples": true,
    "relatedTopics": true,
    "feedback": true,
    "analytics": true
  }
}
```

## Security Considerations

1. **API Authentication**: Use API keys or OAuth
2. **Rate Limiting**: Prevent abuse
3. **Content Security**: Validate all inputs
4. **CORS**: Configure properly for IBM domains
5. **Data Privacy**: Don't log sensitive information

## Monitoring & Analytics

Track:
- Number of queries
- Response times
- User satisfaction ratings
- Most common questions
- Error rates

**Integration with IBM Analytics:**
```javascript
IDzDocsAssistant.init({
  analytics: {
    enabled: true,
    provider: 'ibm-analytics',
    trackingId: 'UA-XXXXX-Y'
  }
});
```

## Testing

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000
```

### Staging Environment
```bash
npm run deploy:staging
# Test at https://staging-docs.ibm.com
```

### Production Deployment
```bash
npm run deploy:production
# Live at https://www.ibm.com/docs/en/developer-for-zos/17.0.x
```

## Rollback Plan

If issues occur:
1. Disable widget via feature flag
2. Revert to previous version
3. Show fallback message to users

```javascript
// Feature flag check
if (featureFlags.docsAssistant === false) {
  console.log('Docs Assistant disabled');
  return;
}
```

## Support & Maintenance

- **Documentation**: See [API_REFERENCE.md](./API_REFERENCE.md)
- **Issues**: Report to GitHub Issues
- **Updates**: Follow semantic versioning
- **Monitoring**: Check dashboard at https://monitor.ibm.com/docs-assistant

## Next Steps

1. ✅ Build and test locally
2. ✅ Deploy to staging
3. ✅ Get approval from IBM Docs team
4. ✅ Deploy to production
5. ✅ Monitor and iterate based on feedback
6. 🔄 Plan Eclipse plugin integration (Phase 2)