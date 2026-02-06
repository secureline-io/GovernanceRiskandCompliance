# AWS Deployment Checklist ✅

## Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] Build succeeds: `npm run build`
- [ ] All modal race conditions fixed ✅
- [ ] All API routes working
- [ ] Supabase connection verified

### 2. Environment Setup
- [ ] `.env.local` has correct Supabase credentials
- [ ] `.env*` files are in `.gitignore` ✅
- [ ] No sensitive data committed to git
- [ ] `amplify.yml` exists and is configured ✅

### 3. Supabase Configuration
- [ ] Database schema deployed (all migrations run)
- [ ] RLS policies enabled
- [ ] Default organization created
- [ ] Sample data loaded (optional)
- [ ] Backup configured

### 4. Git Repository
- [ ] Code pushed to GitHub/GitLab
- [ ] Repository is accessible
- [ ] Main branch is up to date
- [ ] `.gitignore` working correctly

---

## AWS Amplify Deployment Steps

### Step 1: Access AWS Amplify
```
https://console.aws.amazon.com/amplify/
```
- [ ] Logged into AWS Console
- [ ] Navigated to Amplify service
- [ ] Clicked "New app" → "Host web app"

### Step 2: Connect Repository
- [ ] Selected GitHub as source
- [ ] Authorized AWS Amplify
- [ ] Selected `grc-platform` repository
- [ ] Selected `main` branch

### Step 3: Configure Build
- [ ] Reviewed `amplify.yml` (auto-detected)
- [ ] Node version: 20 ✅
- [ ] Build command: `npm run build` ✅
- [ ] Output directory: `.next` ✅

### Step 4: Environment Variables
Add these in "Advanced settings":

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - Value: `https://lyksokllnqijselxeqno.supabase.co`
  
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  
- [ ] `NEXT_PUBLIC_APP_URL`
  - Value: `https://[your-app-id].amplifyapp.com` (update after deployment)

Optional:
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (if using admin API routes)

### Step 5: Deploy
- [ ] Clicked "Save and deploy"
- [ ] Waited for build to complete (3-5 minutes)
- [ ] Build succeeded ✅
- [ ] App is accessible at Amplify URL

---

## Post-Deployment Verification

### Functional Testing
Visit your deployed app and verify:

- [ ] Dashboard loads without errors
- [ ] All navigation links work
- [ ] API calls succeed:
  - [ ] `/api/frameworks` returns data
  - [ ] `/api/risks?org_id=default` returns data
  - [ ] `/api/controls?org_id=default` returns data
  - [ ] `/api/evidence?org_id=default` returns data
  - [ ] `/api/vendors?org_id=default` returns data
  - [ ] `/api/policies?org_id=default` returns data

### Modal Testing
- [ ] Evidence upload modal opens
- [ ] Framework create modal opens
- [ ] Risk create modal opens
- [ ] Vendor create modal opens
- [ ] Forms submit successfully
- [ ] Loading states work
- [ ] Success/error messages appear
- [ ] Modals close after success

### Data Persistence
- [ ] Create a test risk → appears in list
- [ ] Create a test vendor → appears in list
- [ ] Upload test evidence → appears in list
- [ ] Refresh page → data persists
- [ ] Check Supabase dashboard → data is there

### Performance
- [ ] Page load time < 3 seconds
- [ ] API responses < 1 second
- [ ] No 404 errors in console
- [ ] No failed API calls
- [ ] Images/assets load correctly

---

## Custom Domain Setup (Optional)

### Step 1: Add Domain in Amplify
- [ ] Clicked "Domain management"
- [ ] Clicked "Add domain"
- [ ] Entered domain: `grc.yourdomain.com`
- [ ] SSL certificate auto-provisioned

### Step 2: Configure DNS
- [ ] Copied CNAME records from Amplify
- [ ] Added records to DNS provider:
  - [ ] Record 1: `grc` → `[app-id].amplifyapp.com`
  - [ ] Record 2: `_[hash]` → `[verification].acm-validations.aws`
- [ ] Waited for DNS propagation (5-30 min)
- [ ] Domain shows "Available" in Amplify

### Step 3: Update Environment Variables
- [ ] Updated `NEXT_PUBLIC_APP_URL` to `https://grc.yourdomain.com`
- [ ] Triggered redeploy
- [ ] Verified app works on custom domain

### Step 4: Update Supabase Settings
- [ ] Go to Supabase Dashboard → Settings → API
- [ ] Added custom domain to allowed origins:
  ```
  https://grc.yourdomain.com
  ```
- [ ] Saved settings

---

## Security Verification

### SSL/HTTPS
- [ ] App loads over HTTPS
- [ ] SSL certificate is valid
- [ ] No mixed content warnings

### Environment Variables
- [ ] `.env.local` not committed to git
- [ ] Sensitive keys only in AWS environment variables
- [ ] Supabase keys are correct

### Supabase Security
- [ ] RLS policies enabled on all tables
- [ ] Service role key (if used) kept secure
- [ ] API keys rotated if exposed

### API Security
- [ ] All API routes validate `org_id`
- [ ] No public API endpoints without auth
- [ ] Error messages don't leak sensitive data

---

## Monitoring Setup

### AWS CloudWatch
- [ ] Set up alarms for:
  - [ ] Build failures
  - [ ] High error rate
  - [ ] High latency
- [ ] Configure notifications

### Supabase Monitoring
- [ ] Check database usage
- [ ] Monitor API requests
- [ ] Review logs for errors

### Error Tracking (Optional)
- [ ] Sentry configured
- [ ] Error notifications enabled
- [ ] Source maps uploaded

### Uptime Monitoring (Optional)
- [ ] UptimeRobot configured
- [ ] Monitoring endpoints:
  - [ ] Homepage (200 OK)
  - [ ] API health check (if exists)
- [ ] Alert email configured

---

## Backup & Disaster Recovery

### Database Backups
- [ ] Supabase automatic backups enabled (Pro plan)
- [ ] Manual backup taken before deployment
- [ ] Backup restoration tested

### Code Backups
- [ ] Code in git repository
- [ ] Repository has multiple branches
- [ ] Production branch protected

### Amplify Backups
- [ ] Previous deployments available for rollback
- [ ] Can redeploy from any commit

---

## Documentation

### Update Documentation
- [ ] `README.md` has deployment info
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Setup instructions clear

### Team Access
- [ ] Team members have AWS access
- [ ] Supabase access shared with team
- [ ] GitHub repository access configured
- [ ] Deployment process documented

---

## Performance Optimization (Optional)

### CDN & Caching
- [ ] Amplify CDN enabled (automatic)
- [ ] Static assets cached
- [ ] API responses cached where appropriate

### Database Optimization
- [ ] Database indexes created
- [ ] Slow queries identified and optimized
- [ ] Connection pooling configured

### Next.js Optimization
- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] Bundle size analyzed

---

## Cost Management

### Monitor Costs
- [ ] AWS billing alerts configured
- [ ] Supabase usage monitored
- [ ] Monthly cost estimate documented

### Free Tier Usage
- [ ] Amplify free tier limits noted
- [ ] Supabase free tier limits noted
- [ ] Plan upgrade path documented

**Estimated Monthly Cost:**
- Amplify: $5-15 (low traffic)
- Supabase: $0-25 (free tier or Pro)
- Total: $5-40/month

---

## Launch Checklist

### Final Verification
- [ ] All above items checked
- [ ] App fully functional
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security verified

### Announcement
- [ ] Deployment URL shared with team
- [ ] User documentation ready
- [ ] Support process defined
- [ ] Feedback collection set up

### Post-Launch
- [ ] Monitor for 24 hours
- [ ] Address any immediate issues
- [ ] Collect user feedback
- [ ] Plan next iteration

---

## 🎉 Deployment Complete!

**Production URL:** `https://[your-app].amplifyapp.com`

**Custom Domain:** `https://grc.yourdomain.com` (if configured)

**Dashboard:** `https://console.aws.amazon.com/amplify/`

**Database:** `https://app.supabase.com/project/[project-id]`

---

## Quick Commands

```bash
# Test build locally
npm run build

# Run deployment script
./deploy-to-aws.sh

# Push to GitHub
git push origin main

# View Amplify logs
# (In AWS Console → Amplify → Your App → Build logs)
```

---

## Troubleshooting

### Build Fails
1. Check build logs in Amplify Console
2. Verify environment variables are set
3. Test build locally: `npm run build`
4. Check for TypeScript errors

### API Calls Fail
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
3. Verify Supabase allows your domain
4. Check network tab for actual error

### App Shows White Screen
1. Check browser console for errors
2. Verify environment variables
3. Check if build artifacts deployed correctly
4. Try hard refresh (Cmd+Shift+R)

---

**Need Help?** Check `AWS_DEPLOYMENT_GUIDE.md` for detailed instructions.
