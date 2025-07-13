# Railway Deployment Guide

This guide will help you deploy Bulldozer Search to Railway with proper configuration.

## 🚀 Quick Deploy

### Option 1: Deploy from GitHub (Recommended)

1. **Fork this repository** to your GitHub account
2. **Connect to Railway:**

   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your forked repository
   - Railway will automatically detect the Dockerfile

3. **Add Environment Variables:**
   - Go to your project's "Variables" tab
   - Add the following required variables:

```bash
# Required for basic functionality
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here

# Supabase Configuration (if using auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Additional AI providers
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GROQ_API_KEY=your_groq_api_key
```

4. **Add Redis Service (Optional but Recommended):**

   - In your Railway project, click "New Service"
   - Select "Redis"
   - Railway will automatically provide `REDIS_URL` environment variable

5. **Deploy:**
   - Railway will automatically build and deploy your application
   - The deployment will use the Dockerfile and railway.json configuration

### Option 2: Deploy with Railway CLI

1. **Install Railway CLI:**

```bash
npm install -g @railway/cli
```

2. **Login to Railway:**

```bash
railway login
```

3. **Initialize Railway project:**

```bash
railway init
```

4. **Add environment variables:**

```bash
railway variables set OPENAI_API_KEY=your_openai_api_key_here
railway variables set TAVILY_API_KEY=your_tavily_api_key_here
```

5. **Deploy:**

```bash
railway up
```

## 🔧 Configuration

### Environment Variables

Railway automatically sets these variables:

- `PORT` - The port your app should listen on
- `NODE_ENV` - Set to "production"
- `REDIS_URL` - Automatically provided when you add a Redis service

### Required Variables

Add these in Railway's Variables tab:

```bash
# Core API Keys
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...

# Supabase (if using authentication)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Optional AI Providers
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant...
GROQ_API_KEY=gsk_...
PERPLEXITY_API_KEY=pplx-...

# Optional Features
ENABLE_SAVE_CHAT_HISTORY=true
NEXT_PUBLIC_ENABLE_SHARE=true
```

### Optional Variables

```bash
# Alternative search providers
SEARCH_API=searxng
SEARXNG_API_URL=https://your-searxng-instance.com

# Additional features
SERPER_API_KEY=your_serper_key
JINA_API_KEY=your_jina_key

# Google OAuth (if using)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🏗️ Architecture

### Services

Your Railway project will have:

1. **Main Application Service**

   - Built from Dockerfile
   - Runs on port 3000
   - Handles web requests

2. **Redis Service (Optional)**
   - Provides `REDIS_URL` environment variable
   - Used for chat history storage
   - Automatically configured

### Health Checks

The application includes health checks:

- Endpoint: `/api/health`
- Railway will monitor this endpoint
- Returns application status and uptime

## 🔍 Troubleshooting

### Common Issues

#### 1. Build Failures - "Couldn't find any `pages` or `app` directory"

**Problem:** Build fails with missing app directory error
**Solution:**

- ✅ **FIXED:** Updated Dockerfile to properly copy all necessary directories
- Ensure all source files are committed to Git
- Check that `.dockerignore` doesn't exclude necessary files
- Run the build check script: `./scripts/build-check.sh`

#### 2. Environment Variables Not Loading

**Problem:** App can't access environment variables
**Solution:**

- Verify variables are set in Railway Variables tab
- Check variable names match exactly
- Restart deployment after adding variables

#### 3. Redis Connection Issues

**Problem:** Redis connection fails
**Solution:**

- Ensure Redis service is added to project
- Check `REDIS_URL` is automatically provided
- Verify Redis service is running

#### 4. Port Issues

**Problem:** App not accessible
**Solution:**

- Ensure app listens on `$PORT` environment variable
- Check Railway automatically assigns port
- Verify health check endpoint works

### Debugging

1. **Check Logs:**

```bash
railway logs
```

2. **Check Environment:**

```bash
railway variables
```

3. **Restart Service:**

```bash
railway service restart
```

4. **Test Build Locally:**

```bash
./scripts/build-check.sh
```

## 📊 Monitoring

### Health Check

The application provides a health check endpoint:

- URL: `https://your-app.railway.app/api/health`
- Returns JSON with status, uptime, and environment

### Railway Dashboard

Monitor your deployment in Railway dashboard:

- Build status
- Service health
- Environment variables
- Logs and metrics

## 🔄 Updates

### Automatic Deployments

Railway automatically deploys when you push to your GitHub repository.

### Manual Deployments

```bash
# Deploy latest changes
railway up

# Deploy specific branch
railway up --branch feature-branch
```

## 🛡️ Security

### Environment Variables

- Never commit sensitive keys to Git
- Use Railway Variables for all secrets
- Rotate API keys regularly

### Headers

The application includes security headers:

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin

## 📈 Performance

### Optimizations

- Docker multi-stage build reduces image size
- Next.js standalone output for better performance
- Redis connection pooling
- Railway CDN for static assets

### Scaling

Railway automatically scales based on traffic:

- Horizontal scaling
- Load balancing
- Auto-restart on failures

## 🆘 Support

### Railway Support

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)

### Application Support

- Check logs in Railway dashboard
- Verify environment variables
- Test health check endpoint
- Review build logs for errors

## 🚨 Recent Fixes

### Build Issues (Fixed)

- ✅ **Dockerfile:** Now properly copies all necessary directories (`app`, `components`, `lib`, etc.)
- ✅ **TypeScript:** Fixed Redis configuration type errors
- ✅ **Dependencies:** Added missing `ioredis` dependency
- ✅ **Configuration:** Added `.dockerignore` to prevent build issues
- ✅ **Health Checks:** Added proper health check endpoint

### Files Updated

- `Dockerfile` - Fixed file copying and build process
- `lib/redis/config.ts` - Fixed TypeScript errors
- `package.json` - Added missing dependencies
- `.dockerignore` - Added to prevent build issues
- `railway.json` - Updated configuration
- `scripts/build-check.sh` - Added build verification script

---

**Last Updated:** January 2025
