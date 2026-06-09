# How to Push Code to GitHub

## Option 1: Using GitHub Desktop (Easiest)

1. **Download GitHub Desktop** (if not installed): https://desktop.github.com/
2. **Open GitHub Desktop**
3. Click **File** → **Add Local Repository**
4. Browse to: `/Users/swathiks/Documents/GitHub/idz-docs-assistant-backend`
5. Click **Add Repository**
6. Click **Publish repository** button at top
7. Uncheck "Keep this code private" (must be public for free Render)
8. Click **Publish Repository**

✅ **Done!** Your code is now on GitHub.

---

## Option 2: Using Terminal with Personal Access Token

### Step 1: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name: `idz-docs-assistant`
4. Select scopes: Check **repo** (all sub-options)
5. Click **Generate token**
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push Code

Open Terminal and run these commands **one by one**:

```bash
cd /Users/swathiks/Documents/GitHub/idz-docs-assistant-backend
```

```bash
git remote remove origin
```

```bash
git remote add origin https://github.com/swathi-sadananda/idz-docs-assistant-backend.git
```

```bash
git push -u origin main
```

When prompted:
- **Username**: `swathi-sadananda`
- **Password**: Paste your Personal Access Token (not your GitHub password!)

---

## Option 3: Using VS Code

1. **Open VS Code**
2. **File** → **Open Folder** → Select `/Users/swathiks/Documents/GitHub/idz-docs-assistant-backend`
3. Click **Source Control** icon (left sidebar, looks like branches)
4. Click **Publish to GitHub** button
5. Choose **Publish to GitHub public repository**
6. Select the repository: `swathi-sadananda/idz-docs-assistant-backend`

---

## Verify It Worked

Go to: https://github.com/swathi-sadananda/idz-docs-assistant-backend

You should see all your files there!

---

## Next Step: Deploy to Render

Once code is on GitHub:

1. Go to https://render.com
2. Sign in with GitHub
3. Click **New +** → **Web Service**
4. Find and select `idz-docs-assistant-backend`
5. Configure:
   - **Name**: `idz-docs-assistant`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
   - **Plan**: **Free**
6. Add Environment Variable:
   - **Key**: `HUGGINGFACE_API_KEY`
   - **Value**: Get free token from https://huggingface.co/settings/tokens
7. Click **Create Web Service**

Deployment takes 5-10 minutes. You'll get a URL like:
`https://idz-docs-assistant.onrender.com`

---

## Troubleshooting

**"Host key verification failed"**
- Use GitHub Desktop or Personal Access Token method

**"Authentication failed"**
- Make sure you're using Personal Access Token, not password
- Token must have `repo` permissions

**"Repository not found"**
- Check repository name is exactly: `idz-docs-assistant-backend`
- Make sure you're logged into correct GitHub account