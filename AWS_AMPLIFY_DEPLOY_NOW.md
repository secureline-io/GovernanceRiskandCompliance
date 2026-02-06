# 🚀 Deploy to AWS Amplify - Ready to Go!

## ✅ Prerequisites Complete
- ✅ Code pushed to GitHub: `secureline-io/grc-platform-new`
- ✅ Private repository
- ✅ All dependencies configured
- ✅ Supabase credentials ready

---

## 📋 Step-by-Step Deployment

### Step 1: Access AWS Amplify Console

1. Open AWS Console: https://console.aws.amazon.com/amplify/home
2. Sign in with your AWS account
3. Make sure you're in your preferred region (e.g., `us-east-1`)

### Step 2: Create New Amplify App

1. Click **"New app"** → **"Host web app"**
2. Select **GitHub** as your Git provider
3. Click **"Connect to GitHub"**
4. Authorize AWS Amplify to access your GitHub account
5. Select repository: **`secureline-io/grc-platform-new`**
6. Select branch: **`main`**
7. Click **"Next"**

### Step 3: Configure Build Settings

AWS Amplify should auto-detect your Next.js app. Verify these settings:

**App name:** `grc-platform` (or your preferred name)

**Build and test settings:** (Should be auto-detected from `amplify.yml`)

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - node --version
        - npm --version
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**Build image:** `Amazon Linux:2023` (default is fine)

Click **"Next"**

### Step 4: Add Environment Variables ⚠️ CRITICAL

Before clicking "Save and deploy", click **"Advanced settings"** and add these environment variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lyksokllnqijselxeqno.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5a3Nva2xsbnFpanNlbHhlcW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTYzMDcsImV4cCI6MjA4NTg3MjMwN30.eAVZi0rQSQRIgrkCXM-_BrJH4UwyNFgw3gE1ZUdfVtA` |

**Optional (for admin operations):**
| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_APP_URL` | Will be auto-set after first deployment |

### Step 5: Deploy!

1. Review all settings
2. Click **"Save and deploy"**
3. Wait 3-5 minutes for deployment to complete

### Step 6: Monitor Deployment

Watch the build logs in real-time:

**Build phases:**
1. 🔧 Provision (30 seconds)
2. 📦 Build (2-3 minutes)
3. 🚀 Deploy (1 minute)
4. ✅ Verify (30 seconds)

### Step 7: Access Your App

Once deployment completes:

1. Your app URL will be displayed: `https://main.xxxxx.amplifyapp.com`
2. Click the URL to open your GRC Platform
3. Test the application

---

## 🔧 Post-Deployment Configuration

### Update Supabase URL

1. Copy your Amplify app URL: `https://main.xxxxx.amplifyapp.com`
2. Go to Supabase: https://supabase.com/dashboard/project/lyksokllnqijselxeqno
3. Navigate to **Settings** → **API**
4. Under **Site URL**, add your Amplify URL
5. Under **Redirect URLs**, add:
   - `https://main.xxxxx.amplifyapp.com`
   - `https://main.xxxxx.amplifyapp.com/**`

### Update Environment Variable (Optional)

1. In AWS Amplify Console, go to **App settings** → **Environment variables**
2. Update `NEXT_PUBLIC_APP_URL` to your actual Amplify URL
3. Click **Save**
4. Redeploy if needed

---

## 🌐 Custom Domain (Optional)

### Add Your Own Domain

1. In Amplify Console, go to **App settings** → **Domain management**
2. Click **"Add domain"**
3. Enter your domain (e.g., `grc.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (5-10 minutes)

---

## 🔒 Security Checklist

After deployment, verify:

- ✅ HTTPS is enabled (automatic with Amplify)
- ✅ Environment variables are set correctly
- ✅ Supabase connection works
- ✅ Authentication works
- ✅ Database queries execute properly
- ✅ File uploads work (if using Supabase Storage)

---

## 🐛 Troubleshooting

### Build Fails

**Check build logs in Amplify Console:**
1. Click on the failed build
2. View **Build logs**
3. Common issues:
   - Missing environment variables → Add them in Step 4
   - Node version mismatch → Update `amplify.yml`
   - Dependency issues → Check `package.json`

### App Loads But Shows Errors

**Supabase Connection Issues:**
1. Verify environment variables are correct
2. Check Supabase project is active
3. Verify RLS policies allow access
4. Check browser console for errors

### Database Errors

**Run migrations if needed:**
```bash
# Local test first
npx supabase db push

# Or apply migrations manually in Supabase SQL Editor
```

---

## 📊 Monitoring & Logs

### View Application Logs

1. AWS Amplify Console → Your app
2. **Monitoring** tab
3. View:
   - Build history
   - Access logs
   - Error rates
   - Performance metrics

### CloudWatch Logs

For detailed logs:
1. Go to CloudWatch Console
2. Search for your Amplify app
3. View detailed error logs

---

## 💰 Cost Estimate

**AWS Amplify Pricing (Free Tier):**
- Build minutes: 1,000 min/month free
- Hosting: 15 GB storage + 5 GB data transfer free
- After free tier: ~$0.01/build minute, $0.15/GB storage

**Supabase (Free Tier):**
- Database: 500 MB
- Storage: 1 GB
- API calls: 50,000/month

**Total estimated cost (low traffic):** $0-5/month

---

## 🎯 What's Next?

1. ✅ Test all features in production
2. ✅ Set up custom domain
3. ✅ Configure monitoring/alerts
4. ✅ Set up automated backups (Supabase)
5. ✅ Invite team members
6. ✅ Configure CI/CD (already set up via GitHub!)

---

## 🚨 Emergency Rollback

If something goes wrong:

1. Go to Amplify Console
2. Click **"Redeploy this version"** on a previous working build
3. Or push a fix to GitHub (auto-deploys)

---

## 🔗 Quick Links

- **AWS Amplify Console:** https://console.aws.amazon.com/amplify/home
- **Your GitHub Repo:** https://github.com/secureline-io/grc-platform-new
- **Supabase Dashboard:** https://supabase.com/dashboard/project/lyksokllnqijselxeqno
- **Amplify Documentation:** https://docs.aws.amazon.com/amplify/

---

## ✨ Success Criteria

Your deployment is successful when:

✅ Build completes without errors
✅ App loads at Amplify URL
✅ Can log in (if auth is set up)
✅ Database queries work
✅ All pages render correctly
✅ No console errors

---

## 🎉 You're Ready to Deploy!

**Start here:** https://console.aws.amazon.com/amplify/home

**Repository:** https://github.com/secureline-io/grc-platform-new

**Time estimate:** 10-15 minutes

Good luck! 🚀
