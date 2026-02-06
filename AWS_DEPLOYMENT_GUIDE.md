# AWS Deployment Guide - GRC Platform

## 🚀 Deployment Options

### Option 1: AWS Amplify (Recommended - Easiest)
**Best for**: Quick deployment with automatic CI/CD

### Option 2: AWS App Runner
**Best for**: Container-based deployment with more control

### Option 3: EC2 + PM2
**Best for**: Traditional server deployment with full control

---

## 🎯 RECOMMENDED: AWS Amplify Deployment

### Prerequisites
- ✅ AWS Account
- ✅ GitHub repository (or GitLab/Bitbucket)
- ✅ Supabase project running
- ✅ Domain name (optional)

### Step 1: Prepare Your Repository

**1.1 Push your code to GitHub:**
```bash
cd /Users/lala/Desktop/grc-tool-cloud-ai

# Initialize git if not already done
git init
git add .
git commit -m "Production ready - GRC Platform v1.0"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/grc-platform.git
git branch -M main
git push -u origin main
```

**1.2 Verify `.gitignore` excludes sensitive files:**
```
.env.local
.env*.local
node_modules/
.next/
```

### Step 2: Deploy to AWS Amplify

**2.1 Go to AWS Console:**
- Navigate to: https://console.aws.amazon.com/amplify/
- Click **"New app"** → **"Host web app"**

**2.2 Connect Repository:**
- Select **GitHub**
- Authorize AWS Amplify to access your repositories
- Select your `grc-platform` repository
- Select branch: `main`

**2.3 Configure Build Settings:**
- Amplify will auto-detect your `amplify.yml` ✅
- Review the configuration (already set up correctly)

**2.4 Add Environment Variables:**

Click **"Advanced settings"** → **"Add environment variable"**

Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lyksokllnqijselxeqno.supabase.co` | From your Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Your anon key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.amplifyapp.com` | Will be provided after deployment |

**Optional (for admin operations):**
| Key | Value | Notes |
|-----|-------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Only if using admin API routes |

**2.5 Deploy:**
- Click **"Save and deploy"**
- Wait 3-5 minutes for build and deployment
- Your app will be live at: `https://[random-id].amplifyapp.com`

### Step 3: Configure Custom Domain (Optional)

**3.1 In Amplify Console:**
- Go to **"Domain management"**
- Click **"Add domain"**
- Enter your domain: `grc.yourdomain.com`

**3.2 Add DNS Records:**
- Copy the CNAME records from Amplify
- Add them to your DNS provider (Route 53, Cloudflare, etc.)
- Wait for DNS propagation (5-30 minutes)

**3.3 Update Environment Variables:**
- Update `NEXT_PUBLIC_APP_URL` to your custom domain
- Redeploy (Amplify will auto-redeploy)

### Step 4: Verify Deployment

**4.1 Check the deployment:**
```bash
# Visit your Amplify URL
open https://[your-app-id].amplifyapp.com

# Or your custom domain
open https://grc.yourdomain.com
```

**4.2 Test functionality:**
- ✅ Dashboard loads
- ✅ API routes work (`/api/frameworks`, `/api/risks`, etc.)
- ✅ Supabase connection established
- ✅ Modals and forms work
- ✅ Data persists in Supabase

### Step 5: Enable Automatic Deployments

AWS Amplify will automatically:
- ✅ Deploy on every push to `main` branch
- ✅ Run build checks
- ✅ Deploy to production if build succeeds
- ✅ Keep previous deployments for rollback

---

## 🐳 Alternative: AWS App Runner (Container-based)

### Prerequisites
- AWS Account
- Docker installed locally
- ECR (Elastic Container Registry) access

### Step 1: Create Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Update next.config.ts

Add to `next.config.ts`:
```typescript
const nextConfig = {
  output: 'standalone',
  // ... existing config
};
```

### Step 3: Build and Push to ECR

```bash
# Build Docker image
docker build -t grc-platform \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  --build-arg NEXT_PUBLIC_APP_URL=https://your-domain.com \
  .

# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag grc-platform:latest [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/grc-platform:latest
docker push [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/grc-platform:latest
```

### Step 4: Deploy to App Runner

1. Go to AWS App Runner console
2. Click **"Create service"**
3. Select **"Container registry"** → **"Amazon ECR"**
4. Select your `grc-platform` image
5. Configure:
   - Port: `3000`
   - CPU: 1 vCPU
   - Memory: 2 GB
   - Auto scaling: 1-10 instances
6. Add environment variables
7. Deploy

---

## 🖥️ Alternative: EC2 + PM2 (Traditional)

### Step 1: Launch EC2 Instance

1. Go to EC2 Console
2. Launch instance:
   - **AMI**: Ubuntu 22.04 LTS
   - **Instance type**: t3.small (or larger)
   - **Security group**: Allow HTTP (80), HTTPS (443), SSH (22)
3. Connect via SSH

### Step 2: Install Dependencies

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 3: Deploy Application

```bash
# Clone your repository
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/grc-platform.git
cd grc-platform

# Install dependencies
sudo npm ci

# Create .env.production
sudo nano .env.production
# Add your environment variables

# Build
sudo npm run build

# Start with PM2
sudo pm2 start npm --name "grc-platform" -- start
sudo pm2 startup
sudo pm2 save
```

### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/grc-platform
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/grc-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## 📊 Deployment Comparison

| Feature | AWS Amplify | App Runner | EC2 + PM2 |
|---------|-------------|------------|-----------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Auto CI/CD** | ✅ Yes | ✅ Yes | ❌ Manual |
| **Auto Scaling** | ✅ Yes | ✅ Yes | ❌ Manual |
| **SSL Cert** | ✅ Auto | ✅ Auto | 🔧 Certbot |
| **Cost (monthly)** | ~$5-15 | ~$10-30 | ~$10-50 |
| **Maintenance** | ⭐⭐⭐⭐⭐ Low | ⭐⭐⭐⭐ Low | ⭐⭐ High |
| **Control** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Environment variables are set (not committed to git)
- [ ] `.env.local` is in `.gitignore`
- [ ] Supabase RLS policies are enabled
- [ ] API routes validate org_id
- [ ] HTTPS is enabled (SSL certificate)
- [ ] CORS is properly configured
- [ ] Rate limiting is considered
- [ ] Monitoring is set up (CloudWatch, Sentry)
- [ ] Backups are configured (Supabase auto-backup)
- [ ] Custom domain is configured
- [ ] CDN is configured (Amplify/CloudFront)

---

## 📈 Post-Deployment

### Monitor Your Application

**AWS Amplify:**
- View logs in Amplify Console
- Set up CloudWatch alarms
- Monitor build/deployment status

**CloudWatch Metrics:**
- Response times
- Error rates
- Request counts
- Memory/CPU usage

### Update Supabase Production Settings

1. Go to Supabase Dashboard
2. Settings → API
3. Add your production domain to allowed origins:
   ```
   https://your-app.amplifyapp.com
   https://grc.yourdomain.com
   ```

### Set Up Monitoring

**Recommended tools:**
- **AWS CloudWatch** - Built-in monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Uptime Robot** - Uptime monitoring

---

## 🚨 Troubleshooting

### Build Fails on Amplify

**Problem**: Build fails with module errors

**Solution**:
```bash
# Clear cache and rebuild locally
rm -rf node_modules .next package-lock.json
npm install
npm run build

# If successful, commit and push
git add .
git commit -m "Fix: Dependencies updated"
git push
```

### Environment Variables Not Working

**Problem**: API calls fail, Supabase connection errors

**Solution**:
1. Verify variables in Amplify Console → Environment Variables
2. Ensure `NEXT_PUBLIC_` prefix for client-side variables
3. Redeploy after adding variables

### App Builds But Shows 404

**Problem**: Routes don't work

**Solution**:
- Check `amplify.yml` has correct artifacts
- Ensure `baseDirectory: .next` is set
- Verify all files are included in git

---

## 💰 Cost Estimate (AWS Amplify)

**AWS Amplify Pricing:**
- **Build minutes**: $0.01/minute (first 1000 free)
- **Hosting**: $0.15/GB served (first 15 GB free)
- **Data storage**: $0.023/GB-month (first 5 GB free)

**Typical monthly cost for small app:**
- **Free tier**: $0 (first month, low traffic)
- **Low traffic** (<10k users): $5-15/month
- **Medium traffic** (10k-50k users): $15-50/month

**Supabase Costs:**
- **Free tier**: $0 (up to 500 MB database, 1 GB bandwidth)
- **Pro**: $25/month (8 GB database, 50 GB bandwidth)

**Total estimated cost**: $5-40/month (depending on traffic)

---

## 🎉 Quick Start (5 Minutes)

```bash
# 1. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/grc-platform.git
git push -u origin main

# 2. Go to AWS Amplify Console
open https://console.aws.amazon.com/amplify/

# 3. Click "New app" → "Host web app"
# 4. Connect GitHub → Select repository
# 5. Add environment variables (Supabase URL & Key)
# 6. Click "Save and deploy"
# 7. Wait 3-5 minutes
# 8. Your app is live! 🚀
```

---

## 📞 Support

If you encounter issues:
1. Check AWS Amplify build logs
2. Review this guide's troubleshooting section
3. Check Supabase connection status
4. Verify environment variables

**Useful links:**
- AWS Amplify Docs: https://docs.amplify.aws/
- Next.js Deployment: https://nextjs.org/docs/deployment
- Supabase Docs: https://supabase.com/docs

---

**Ready to deploy?** Follow the AWS Amplify steps above for the quickest deployment! 🚀
