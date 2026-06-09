# GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `idz-docs-assistant-backend`
3. Description: `Backend API for IDz Documentation Assistant - Free deployment on Render.com`
4. Choose: **Public** (required for free Render deployment)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd /Users/swathiks/Documents/GitHub/idz-docs-assistant-backend
git remote add origin https://github.com/YOUR_USERNAME/idz-docs-assistant-backend.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Deploy to Render

Once pushed to GitHub:

1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your `idz-docs-assistant-backend` repository
5. Configure:
   - **Name**: `idz-docs-assistant`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
   - **Plan**: Select **Free**
6. Add Environment Variable:
   - **Key**: `HUGGINGFACE_API_KEY`
   - **Value**: Get from https://huggingface.co/settings/tokens
7. Click "Create Web Service"

## Step 4: Update Browser Extension

After deployment, Render will give you a URL like:
`https://idz-docs-assistant.onrender.com`

Update the extension's `content.js`:
```javascript
const BACKEND_URL = 'https://idz-docs-assistant.onrender.com';
```

## Step 5: Test Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select: `/Users/swathiks/Documents/GitHub/IDZ/idz-doc/doc-assistant-extension/`
6. Visit https://www.ibm.com/docs/en/developer-for-zos/17.0.x
7. Click the chat button in bottom-right corner

## Notes

- **Repository MUST be public** for Render free tier
- First deployment takes 5-10 minutes
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month free (enough for testing)

## Troubleshooting

**If repository not visible in Render:**
- Make sure it's public
- Try disconnecting and reconnecting GitHub in Render settings
- Refresh the repository list

**If deployment fails:**
- Check build logs in Render dashboard
- Verify `package.json` has correct start script
- Ensure all dependencies are in `package.json`

**If extension doesn't connect:**
- Check browser console for errors (F12)
- Verify BACKEND_URL matches your Render URL
- Check CORS settings in backend