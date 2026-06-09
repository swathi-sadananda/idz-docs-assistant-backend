# Fix GitHub Desktop Authentication Error

## Quick Fix - Sign In to GitHub Desktop

### Step 1: Open GitHub Desktop Preferences
1. Open **GitHub Desktop**
2. Click **GitHub Desktop** menu (top left)
3. Click **Preferences** (or press `Cmd + ,`)

### Step 2: Sign In
1. Click **Accounts** tab
2. Click **Sign In** next to GitHub.com
3. Click **Continue with browser**
4. Your browser will open - click **Authorize desktop**
5. Return to GitHub Desktop

### Step 3: Try Publishing Again
1. Go back to your repository in GitHub Desktop
2. Click **Publish repository** button
3. Uncheck "Keep this code private"
4. Click **Publish Repository**

✅ **Should work now!**

---

## Alternative: Use Terminal with Personal Access Token (Easier)

If GitHub Desktop still has issues, use Terminal instead:

### Step 1: Create Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Name: `idz-docs-assistant`
4. Check **repo** (all sub-options)
5. Click **Generate token**
6. **COPY THE TOKEN** immediately!

### Step 2: Push with Token

Open Terminal and run these commands **one at a time**:

```bash
cd /Users/swathiks/Documents/GitHub/idz-docs-assistant-backend
```

```bash
git remote set-url origin https://github.com/swathi-sadananda/idz-docs-assistant-backend.git
```

```bash
git push -u origin main
```

When prompted:
- **Username**: `swathi-sadananda`
- **Password**: Paste your Personal Access Token (NOT your GitHub password!)

---

## Alternative: Use VS Code (Also Easy)

### Step 1: Open in VS Code
1. Open **VS Code**
2. **File** → **Open Folder**
3. Select: `/Users/swathiks/Documents/GitHub/idz-docs-assistant-backend`

### Step 2: Sign In to GitHub
1. Click **Accounts** icon (bottom left, person icon)
2. Click **Sign in to sync settings**
3. Choose **Sign in with GitHub**
4. Authorize in browser

### Step 3: Publish
1. Click **Source Control** icon (left sidebar)
2. Click **Publish to GitHub**
3. Choose **Publish to GitHub public repository**
4. Select your repository

---

## Verify Success

After pushing, check: https://github.com/swathi-sadananda/idz-docs-assistant-backend

You should see all your files!

---

## Still Having Issues?

Try this simple Terminal method (no authentication needed if you have SSH keys):

```bash
cd /Users/swathiks/Documents/GitHub/idz-docs-assistant-backend
git remote set-url origin git@github.com:swathi-sadananda/idz-docs-assistant-backend.git
ssh-keyscan github.com >> ~/.ssh/known_hosts
git push -u origin main
```

If this asks for SSH key setup, use the Personal Access Token method instead (it's simpler).