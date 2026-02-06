# 🚀 Deployment Steps - Execute Now

## Current Status
✅ All code committed (commit: 5f14e47)
✅ Production build passing
✅ No TypeScript errors
✅ All bugs fixed
✅ Ready for deployment

---

## STEP 1: Create GitHub Repository (2 minutes)

### Option A: Via GitHub CLI (Fastest)
```bash
# Install GitHub CLI if not installed
brew install gh

# Login
gh auth login

# Create repository
gh repo create grc-platform --public --source=. --remote=origin --push
```

### Option B: Via GitHub Web UI
1. Go to: https://github.com/new
2. Repository name: `grc-platform`
3. Visibility: **Private** (recommended for production)
4. ✅ **Do NOT** initialize with README (you already have code)
5. Click "Create repository"
6. Run these commands:
   ```bash
   cd /Users/lala/Desktop/grc-tool-cloud-ai
   git remote add origin https://github.com/YOUR_USERNAME/grc-platform.git
   git push -u origin main
   ```

---

## STEP 2: Deploy to AWS Amplify (5 minutes)

### 2.1 Open AWS Amplify Console
```
https://console.aws.amazon.com/amplify/home
```

### 2.2 Create New App
1. Click **"New app"**
2. Select **"Host web app"**
3. Choose **"GitHub"** as source

### 2.3 Authorize GitHub
1. Click "Connect to GitHub"
2. Authorize AWS Amplify
3. Select your repository: `grc-platform`
4. Select branch: `main`
5. Click "Next"

### 2.4 Configure Build Settings
**Amplify will auto-detect your settings:**
- App name: `grc-platform`
- Build command: `npm run build` ✅
- Output directory: `.next` ✅
- Node version: 20 ✅

Click "Next"

### 2.5 Add Environment Variables

Click **"Advanced settings"** → Scroll to **"Environment variables"**

Add these 3 variables:

| Variable name | Value | Where to find |
|---------------|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lyksokllnqijselxeqno.supabase.co` | Your Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (paste from .env.local) | In `.env.local` file |
| `NEXT_PUBLIC_APP_URL` | `https://main.[app-id].amplifyapp.com` | Use temporary, update after |

**To get your ANON_KEY:**
```bash
cat /Users/lala/Desktop/grc-tool-cloud-ai/.env.local | grep ANON_KEY
```

### 2.6 Deploy
1. Click **"Save and deploy"**
2. Watch the build progress (3-5 minutes)
3. Wait for "Deployment successfully completed"

### 2.7 Get Your Live URL
Your app will be live at:
```
https://main.[random-id].amplifyapp.com
```

Copy this URL!

### 2.8 Update APP_URL Variable
1. In Amplify Console → "Environment variables"
2. Edit `NEXT_PUBLIC_APP_URL`
3. Paste your Amplify URL
4. Click "Save"
5. Amplify will auto-redeploy (2-3 minutes)

---

## STEP 3: Update Supabase CORS (1 minute)

1. Go to: https://app.supabase.com/project/lyksokllnqijselxeqno
2. Navigate to: **Settings** → **API**
3. Scroll to **"API Settings"**
4. Add your Amplify URL to allowed origins:
   ```
   https://main.[your-app-id].amplifyapp.com
   ```
5. Click "Save"

---

## STEP 4: Test Your Deployment

Visit your live app:
```
https://main.[your-app-id].amplifyapp.com
```

### Test Checklist:
- [ ] Dashboard loads
- [ ] Navigate to Evidence page
- [ ] Click "Upload Evidence" button
- [ ] Modal opens smoothly
- [ ] Fill form and submit
- [ ] Modal shows loading spinner
- [ ] Success message appears
- [ ] Modal closes after API completes
- [ ] Evidence appears in list
- [ ] Refresh page - data persists

---

## STEP 5: Custom Domain (Optional - 10 minutes)

### If you have a domain:

1. In Amplify Console → **"Domain management"**
2. Click **"Add domain"**
3. Enter: `grc.yourdomain.com`
4. Click "Configure domain"
5. Copy the CNAME records shown
6. Add them to your DNS provider:
   - Name: `grc`
   - Type: `CNAME`
   - Value: `[provided by Amplify]`
7. Wait 5-30 minutes for DNS propagation
8. SSL certificate will be auto-provisioned

### Then update:
1. `NEXT_PUBLIC_APP_URL` → `https://grc.yourdomain.com`
2. Supabase allowed origins → Add custom domain
3. Redeploy

---

## 🎉 Deployment Complete!

### Your Live App:
- **URL**: https://[your-app-id].amplifyapp.com
- **SSL**: ✅ Enabled (HTTPS)
- **CDN**: ✅ Global distribution
- **Auto-deploy**: ✅ On every git push
- **Scaling**: ✅ Automatic
- **Database**: ✅ Supabase connected

### Continuous Deployment:
```bash
# Make changes
git add .
git commit -m "New feature"
git push origin main

# AWS Amplify auto-deploys in 3-5 minutes!
```

---

## 📊 What You Deployed

✅ **37 Routes** (Pages + API endpoints)
✅ **Complete GRC Platform**:
- Dashboard with analytics
- Compliance frameworks
- Risk register
- Evidence vault with upload
- Vendor management
- CSPM integration
- Policies, Audits, Reports
- All modals working
- Export/Import features
- Real-time Supabase data

### Production Features:
- ✅ All buttons functional
- ✅ File upload (drag & drop)
- ✅ CSV/JSON export
- ✅ Real-time data sync
- ✅ No race conditions
- ✅ Error handling
- ✅ Loading states
- ✅ Mobile responsive

---

## 💰 Monthly Cost Estimate

- **AWS Amplify**: $5-15/month (includes hosting, CDN, SSL)
- **Supabase**: $0 (free tier) or $25/month (Pro)
- **Domain**: $12/year (optional)

**Total**: ~$5-40/month

---

## 📞 Need Help?

- **AWS Support**: Check build logs in Amplify Console
- **Supabase**: Check logs at https://app.supabase.com
- **Documentation**: All guides in your project folder

---

Ready to execute? Start with **Step 1** above! 🚀
