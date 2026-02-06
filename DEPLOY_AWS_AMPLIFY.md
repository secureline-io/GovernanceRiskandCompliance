# GRC Platform - AWS Amplify Deployment Guide

## Prerequisites
- GitHub account with your code pushed to a repository
- AWS account with Amplify access
- Your Supabase credentials from `.env.local`

---

## Step 1: Push Code to GitHub

If your repo doesn't have a remote yet, run these in your **Cursor terminal**:

```bash
# Create a new GitHub repo (using GitHub CLI)
gh repo create grc-platform --private --source=. --remote=origin --push

# OR manually add a remote and push
git remote add origin https://github.com/YOUR_USERNAME/grc-platform.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy on AWS Amplify

### Option A: AWS Console (Easiest)

1. Go to **[AWS Amplify Console](https://console.aws.amazon.com/amplify/)**
2. Click **"Create new app"**
3. Select **"GitHub"** as your source provider
4. Authorize AWS Amplify to access your GitHub account
5. Select your repository and branch (`main`)
6. Amplify will auto-detect it as a **Next.js SSR** app
7. In **Build settings**, it should auto-detect your `amplify.yml` — verify it looks correct
8. Under **Advanced settings > Environment variables**, add:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://lyksokllnqijselxeqno.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(your anon key from .env.local)* |
   | `NEXT_PUBLIC_APP_URL` | *(leave blank for now, update after deploy)* |

9. Click **"Save and deploy"**
10. Wait 3-5 minutes for the build to complete
11. Your app URL will be: `https://main.d<random>.amplifyapp.com`

### Option B: AWS CLI (From Cursor Terminal)

Since your AWS keys are configured in Cursor, run these commands there:

```bash
# Set environment variables
export AWS_REGION=us-east-1
export NEXT_PUBLIC_SUPABASE_URL="https://lyksokllnqijselxeqno.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY_HERE"

# Run the deploy script
chmod +x deploy/deploy-amplify.sh
./deploy/deploy-amplify.sh
```

---

## Step 3: Post-Deployment

### Update Supabase CORS
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Settings > API**
3. Under **Allowed origins**, add your Amplify URL:
   `https://main.d<your-app-id>.amplifyapp.com`

### Update `NEXT_PUBLIC_APP_URL`
1. In AWS Amplify Console, go to your app
2. Navigate to **Environment variables**
3. Set `NEXT_PUBLIC_APP_URL` to your live URL
4. Redeploy (Amplify will auto-redeploy on env var change)

### Custom Domain (Optional)
1. In Amplify Console, go to **Domain management**
2. Click **Add domain**
3. Follow the DNS setup instructions for your domain

---

## Troubleshooting

**Build fails with Node version error:**
- The `amplify.yml` is configured to use Node 20 via `nvm use 20`

**Environment variables not working:**
- Make sure variables are set in Amplify Console, not just in `.env.local`
- The `amplify.yml` writes `NEXT_PUBLIC_*` vars to `.env.production` during build

**SSR not working:**
- Ensure Amplify detected the app as "Web Compute" (SSR), not "Web" (static)
- Check that `next.config.ts` has `output: 'standalone'`
