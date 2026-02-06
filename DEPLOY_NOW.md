# 🚀 Deploy to AWS - Quick Start

## Option 1: Automated Deployment (5 Minutes) ⚡

### Step 1: Run Deployment Script
```bash
cd /Users/lala/Desktop/grc-tool-cloud-ai
./deploy-to-aws.sh
```

This will:
- ✅ Verify your setup
- ✅ Test production build
- ✅ Commit changes
- ✅ Push to GitHub
- ✅ Prepare for AWS deployment

### Step 2: Deploy to AWS Amplify

1. **Go to AWS Amplify Console:**
   ```
   https://console.aws.amazon.com/amplify/
   ```

2. **Click:** "New app" → "Host web app"

3. **Connect Repository:**
   - Select GitHub
   - Authorize AWS Amplify
   - Choose your `grc-platform` repository
   - Select `main` branch

4. **Add Environment Variables:**
   
   Click "Advanced settings" and add:
   
   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://lyksokllnqijselxeqno.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key from `.env.local` |
   | `NEXT_PUBLIC_APP_URL` | `https://[will-be-provided].amplifyapp.com` |

5. **Deploy:**
   - Click "Save and deploy"
   - Wait 3-5 minutes ⏱️
   - Your app will be live! 🎉

### Step 3: Update APP_URL

After deployment:
1. Copy your Amplify URL: `https://[app-id].amplifyapp.com`
2. In Amplify Console → Environment variables
3. Update `NEXT_PUBLIC_APP_URL` with your Amplify URL
4. Redeploy (automatic)

---

## Option 2: Manual Deployment (Step-by-Step)

### 1. Prepare Repository

```bash
cd /Users/lala/Desktop/grc-tool-cloud-ai

# Test build
npm run build

# Initialize git (if not already done)
git init

# Commit all changes
git add .
git commit -m "Production ready - GRC Platform v1.0"

# Add GitHub remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/grc-platform.git

# Push to GitHub
git push -u origin main
```

### 2. AWS Amplify Setup

Follow the same AWS Amplify steps as Option 1 above.

---

## 📋 Pre-Deployment Checklist

Before deploying, verify:

- [x] Build succeeds: `npm run build` ✅
- [x] `.gitignore` excludes `.env*` files ✅
- [x] `amplify.yml` exists ✅
- [x] Supabase is configured ✅
- [x] All modals work correctly ✅
- [x] API routes return data ✅

---

## 🔐 Environment Variables You'll Need

From your `.env.local`:

1. **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://lyksokllnqijselxeqno.supabase.co
   ```

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   (Copy from your .env.local file)
   ```

3. **NEXT_PUBLIC_APP_URL**
   ```
   Will be: https://[your-app-id].amplifyapp.com
   (Update after first deployment)
   ```

---

## 🎯 After Deployment

### Test Your Live App

Visit: `https://[your-app-id].amplifyapp.com`

**Verify these work:**
- ✅ Dashboard loads
- ✅ Navigate to Evidence page
- ✅ Click "Upload Evidence" modal
- ✅ Navigate to Risks page
- ✅ Create a test risk
- ✅ Verify data persists

### Set Up Custom Domain (Optional)

1. In Amplify Console → "Domain management"
2. Click "Add domain"
3. Enter: `grc.yourdomain.com`
4. Add CNAME records to your DNS
5. Wait 5-30 minutes for propagation

---

## 💰 Cost Estimate

**AWS Amplify:**
- Build minutes: First 1000 free, then $0.01/min
- Hosting: First 15 GB free, then $0.15/GB
- Typical cost: **$5-15/month** for small app

**Supabase:**
- Free tier: Up to 500 MB database
- Pro tier: $25/month (if you need more)

**Total: ~$5-40/month depending on usage**

---

## 📱 What Gets Deployed

Your complete GRC platform with:
- ✅ Dashboard with real-time stats
- ✅ Compliance framework management
- ✅ Risk register with heat map
- ✅ Evidence vault with upload
- ✅ Vendor management
- ✅ CSPM integration
- ✅ Policies management
- ✅ All API routes working
- ✅ Supabase database connected
- ✅ SSL certificate (HTTPS)
- ✅ CDN enabled
- ✅ Auto-scaling

---

## 🔄 Continuous Deployment

After initial setup, AWS Amplify will:
- ✅ Auto-deploy on every push to `main`
- ✅ Run build checks
- ✅ Deploy if build succeeds
- ✅ Keep previous versions for rollback

To deploy updates:
```bash
git add .
git commit -m "Feature: Add new functionality"
git push origin main
# Amplify auto-deploys in 3-5 minutes
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Test locally first
npm run build

# Check for TypeScript errors
npm run lint
```

### Environment Variables Not Working
1. Verify in Amplify Console → Environment variables
2. Ensure `NEXT_PUBLIC_` prefix for client-side vars
3. Redeploy after adding variables

### App Shows Blank Page
1. Check browser console for errors
2. Verify Supabase URL and key are correct
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## 📚 Documentation

Full guides available:
- **`AWS_DEPLOYMENT_GUIDE.md`** - Complete deployment guide
- **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step checklist
- **`README_DATABASE.md`** - Database setup guide

---

## 🎉 Ready to Deploy?

### Quickest Path (Choose One):

**A. Automated (Recommended):**
```bash
./deploy-to-aws.sh
```
Then follow AWS Amplify steps above.

**B. Manual:**
```bash
git push origin main
```
Then go to: https://console.aws.amazon.com/amplify/

---

## 📞 Need Help?

1. Check `AWS_DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review `DEPLOYMENT_CHECKLIST.md` for verification steps
3. Check AWS Amplify build logs
4. Verify environment variables

---

## ✨ Your App After Deployment

**Live URL:** `https://[app-id].amplifyapp.com`

**Features:**
- 🔒 HTTPS enabled (SSL certificate)
- 🌐 Global CDN
- 📈 Auto-scaling
- 🔄 CI/CD pipeline
- 💾 Supabase database
- 🎨 Professional UI
- ⚡ Fast loading
- 📱 Mobile responsive

**Time to deploy:** 5-10 minutes ⏱️

**Monthly cost:** $5-40 💰

**Maintenance:** Minimal ⚙️

---

🚀 **Let's deploy!** Run `./deploy-to-aws.sh` to get started!
