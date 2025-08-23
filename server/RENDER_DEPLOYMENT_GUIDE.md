# Deploy Node.js Backend to Render with Docker

This guide will walk you through deploying your Node.js backend from the `server/` folder to Render using Docker.

## Prerequisites

- A [Render](https://render.com) account (free tier available)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- The Dockerfile and .dockerignore files in your `server/` folder

## Step-by-Step Deployment Guide

### 1. Prepare Your Repository

Ensure your repository structure looks like this:
```
your-repo/
├── server/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── proxy.js
│   ├── intentParser.js
│   └── (other server files)
├── package.json
└── (other project files)
```

### 2. Create a New Web Service on Render

1. **Log in to Render Dashboard**
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" button in the top right

2. **Select Web Service**
   - Choose "Web Service" from the dropdown menu

3. **Connect Your Repository**
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Choose the repository containing your project
   - Click "Connect"

### 3. Configure Your Web Service

Fill in the following configuration:

**Basic Settings:**
- **Name**: `your-app-backend` (or any name you prefer)
- **Region**: Choose the region closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `server` ⚠️ **IMPORTANT: Set this to `server`**

**Build & Deploy Settings:**
- **Runtime**: `Docker`
- **Build Command**: Leave empty (Docker will handle this)
- **Start Command**: Leave empty (Docker CMD will handle this)

**Advanced Settings:**
- **Port**: `5000` (matches the EXPOSE port in Dockerfile)
- **Health Check Path**: `/health`

### 4. Environment Variables

If your application uses environment variables (like API keys), add them:

1. Scroll down to "Environment Variables" section
2. Add your variables (e.g., `GEMINI_API_KEY`, `NODE_ENV=production`)
3. **Important**: Don't include sensitive data in your repository

Common environment variables for your app:
```
NODE_ENV=production
PORT=5000
GEMINI_API_KEY=your_api_key_here
```

### 5. Deploy Your Service

1. **Review Configuration**
   - Double-check all settings, especially the root directory (`server`)
   - Ensure the port is set to `5000`

2. **Create Web Service**
   - Click "Create Web Service"
   - Render will start building your Docker image

3. **Monitor Deployment**
   - Watch the build logs in real-time
   - The build process will:
     - Pull the `node:18-alpine` base image
     - Copy your `package.json` and install dependencies
     - Copy your server code
     - Start the application

### 6. Verify Deployment

Once deployment is complete:

1. **Check Service URL**
   - Render will provide a URL like: `https://your-app-backend.onrender.com`

2. **Test Health Endpoint**
   - Visit: `https://your-app-backend.onrender.com/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

3. **Test Your API Endpoints**
   - Test your main endpoints like `/proxy` and `/proxy/ai`

### 7. Update Frontend Configuration

Update your React frontend to use the new backend URL:

```javascript
// Replace localhost URLs with your Render URL
const API_BASE_URL = 'https://your-app-backend.onrender.com';

// Update your API calls
fetch(`${API_BASE_URL}/proxy`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

## Important Notes

### Free Tier Limitations
- **Cold Starts**: Free tier services sleep after 15 minutes of inactivity
- **Build Minutes**: Limited build minutes per month
- **Bandwidth**: Limited bandwidth per month

### Production Considerations

1. **Upgrade to Paid Plan** for:
   - No cold starts
   - More build minutes and bandwidth
   - Better performance

2. **Environment Variables**:
   - Never commit API keys to your repository
   - Use Render's environment variables feature

3. **Monitoring**:
   - Use Render's built-in logs and metrics
   - Set up health checks for better reliability

4. **Custom Domains**:
   - Available on paid plans
   - Configure through Render dashboard

### Troubleshooting

**Build Fails:**
- Check that `server/` is set as the root directory
- Verify `package.json` exists in the server folder
- Check build logs for specific errors

**Service Won't Start:**
- Ensure port 5000 is exposed and your app listens on `0.0.0.0:5000`
- Check that all required environment variables are set
- Review application logs in Render dashboard

**Health Check Fails:**
- Verify `/health` endpoint returns 200 status
- Check that the service is listening on the correct port

### Updating Your Deployment

To update your deployment:
1. Push changes to your Git repository
2. Render will automatically rebuild and redeploy
3. Monitor the deployment in the Render dashboard

## Summary

Your backend is now deployed on Render with:
- ✅ Production-ready Docker container
- ✅ Health checks for reliability  
- ✅ Environment variable support
- ✅ Automatic deployments from Git
- ✅ HTTPS enabled by default

Your frontend (deployed on Vercel) can now communicate with your backend running on Render!
