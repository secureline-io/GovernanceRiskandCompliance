# 🚀 Connect GitHub to AWS Amplify - Quick Guide

## Current Status
- ✅ Amplify App Created: `grc-platform`
- ✅ App ID: `dmxjcxqpoywpy`
- ✅ Environment Variables: Already configured
- ✅ GitHub Repository: `secureline-io/GovernanceRiskandCompliance`
- ⚠️ **Action Needed:** Connect GitHub repository

---

## 🎯 Quick Setup (5 minutes)

### Step 1: Open Amplify Console
The console should already be open in your browser, or click here:
```
https://console.aws.amazon.com/amplify/home?region=us-east-1#/dmxjcxqpoywpy
```

### Step 2: Connect GitHub Branch

1. **Click "Connect branch"** button (orange button at top right)

2. **Select "GitHub"** as your Git provider

3. **Authorize AWS Amplify** (first time only)
   - You'll be redirected to GitHub
   - Click "Authorize AWS Amplify"
   - This is a one-time setup

4. **Select Repository**
   - Repository: `secureline-io/GovernanceRiskandCompliance`
   - Branch: `main`
   - Click "Next"

5. **Configure Build Settings**
   - App name: Keep as `grc-platform`
   - Build settings: Should auto-detect from `amplify.yml`
   - Verify it shows:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - nvm use 20
             - npm ci
         build:
           commands:
             - npm run build
     ```

6. **Review Environment Variables** (Should already be set)
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

7. **Save and Deploy**
   - Click "Save and deploy"
   - Wait 3-5 minutes for deployment

---

## 📊 Deployment Progress

You'll see these stages:

1. **Provision** (30 seconds)
   - Setting up build environment

2. **Build** (2-3 minutes)
   - Installing dependencies
   - Building Next.js app

3. **Deploy** (1 minute)
   - Deploying to CDN

4. **Verify** (30 seconds)
   - Health checks

---

## 🔗 Your App URLs

**Production URL:**
```
https://main.dmxjcxqpoywpy.amplifyapp.com
```

**Console URL:**
```
https://console.aws.amazon.com/amplify/home?region=us-east-1#/dmxjcxqpoywpy
```

**GitHub Repository:**
```
https://github.com/secureline-io/GovernanceRiskandCompliance
```

---

## ✅ Success Checklist

After deployment completes, verify:

- [ ] Deployment status shows "Deployed"
- [ ] Green checkmarks on all build stages
- [ ] App URL opens without errors
- [ ] Dashboard loads correctly
- [ ] Can navigate between pages
- [ ] Supabase connection works (check browser console for errors)

---

## 🐛 Troubleshooting

### Build Fails

**Check build logs:**
1. Click on the failed build
2. Review each phase for errors
3. Common issues:
   - Node version mismatch → Verify `nvm use 20` in amplify.yml
   - Missing dependencies → Check package.json
   - Environment variables missing → Verify in App settings

### App Loads But Shows Errors

**Supabase Connection:**
1. Open browser console (F12)
2. Look for network errors
3. Verify environment variables are set correctly

**404 Errors:**
1. Check that `.next` folder is being deployed
2. Verify `baseDirectory: .next` in amplify.yml

---

## 🔄 Auto-Deploy on Push

Once connected, AWS Amplify will automatically:
- ✅ Deploy when you push to `main` branch
- ✅ Run builds on every commit
- ✅ Update your live app automatically

---

## 🎨 Custom Domain (Optional - Later)

After deployment succeeds, you can add a custom domain:

1. Go to App settings → Domain management
2. Click "Add domain"
3. Enter your domain (e.g., `grc.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (5-10 minutes)

---

## 📞 Need Help?

If you encounter issues:
1. Check build logs in Amplify Console
2. Verify all environment variables are set
3. Test the build locally: `npm run build`
4. Check GitHub webhook is active (Settings → Webhooks)

---

## ✨ What's Next?

After deployment:
1. Test all features in production
2. Update Supabase Site URL with your Amplify URL
3. Share the app URL with your team
4. Monitor usage in Amplify Console

---

**Ready to deploy?** Follow the steps above! 🚀
