# Manual GitHub Setup - Quick Method

## Current Situation
- ✅ Authenticated as: **secureline-io**
- ✅ Repository created: `secureline-io/grc-platform`
- ⚠️ Need admin permissions to push

---

## 🚀 Option 1: Push via GitHub Web Interface (Fastest - 2 minutes)

### Step 1: Delete and Recreate Repository
1. Go to: https://github.com/secureline-io/grc-platform/settings
2. Scroll to bottom → "Danger Zone"
3. Click "Delete this repository"
4. Type: `secureline-io/grc-platform` to confirm
5. Click "I understand, delete this repository"

### Step 2: Create Fresh Repository
1. Go to: https://github.com/new
2. Owner: **secureline-io**
3. Repository name: `grc-platform`
4. Visibility: **Private** (recommended)
5. ✅ **Do NOT check** "Add a README file"
6. ✅ **Do NOT check** "Add .gitignore"
7. ✅ **Do NOT check** "Choose a license"
8. Click "Create repository"

### Step 3: Push Your Code
GitHub will show you commands. Copy and run:

```bash
cd /Users/lala/Desktop/grc-tool-cloud-ai
git remote set-url origin https://github.com/secureline-io/grc-platform.git
git push -u origin main
```

---

## 🔐 Option 2: Use Personal Access Token (Recommended)

### Step 1: Create GitHub Personal Access Token
1. Go to: https://github.com/settings/tokens/new
2. Note: "GRC Platform Deployment"
3. Expiration: 90 days
4. Scopes to select:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Configure Git to Use Token
```bash
cd /Users/lala/Desktop/grc-tool-cloud-ai

# Remove old remote
git remote remove origin

# Add remote with token authentication
git remote add origin https://YOUR_TOKEN@github.com/secureline-io/grc-platform.git

# Push code
git push -u origin main
```

**Replace `YOUR_TOKEN` with the token you just created**

---

## 🎯 Option 3: Use SSH (Most Secure)

### Step 1: Check for SSH Key
```bash
ls -la ~/.ssh/id_ed25519.pub
```

### If no SSH key exists:
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub | pbcopy
```

### Step 2: Add SSH Key to GitHub
1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: "GRC Platform Deployment"
4. Key: Paste (Cmd+V)
5. Click "Add SSH key"

### Step 3: Push with SSH
```bash
cd /Users/lala/Desktop/grc-tool-cloud-ai
git remote set-url origin git@github.com:secureline-io/grc-platform.git
git push -u origin main
```

---

## ⚡ Quick Fix (Right Now)

**Since the repo exists but has permission issues, try this:**

1. **Go to the repository settings:**
   ```
   https://github.com/secureline-io/grc-platform/settings
   ```

2. **Check your access level** - You should be Admin or Owner

3. **If you see the repo but can't access settings:**
   - You might be logged into a different GitHub account in your browser
   - Log out and log in as `secureline-io`
   - Or ask the organization owner to grant you admin access

---

## 🆘 Alternative: Create Under Personal Account

If `secureline-io` is an organization and you're having permission issues:

```bash
cd /Users/lala/Desktop/grc-tool-cloud-ai

# Create under your personal GitHub account instead
gh repo create YOUR_PERSONAL_USERNAME/grc-platform --private --source=. --remote=origin --push
```

---

## 📞 Current Status

- ✅ Code ready to push
- ✅ Committed: `6b9fa80`
- ✅ Repository created: `secureline-io/grc-platform`
- ⚠️ Need: Push permissions

**Choose one of the options above to complete the push!**

Once pushed, we'll deploy to AWS Amplify immediately.
