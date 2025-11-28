# Deployment Guide for GitHub Pages

This guide will help you deploy the SSB Prep Portal to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Node.js installed (already done)
3. Git installed

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `ssb-prep-portal` (or any name you prefer)
3. **Don't** initialize with README, .gitignore, or license (we already have these)

## Step 2: Update Homepage URL

1. Open `client/package.json`
2. Replace `YOUR_USERNAME` in the homepage field with your GitHub username:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/ssb-prep-portal"
   ```

## Step 3: Initialize Git and Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: SSB Prep Portal"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ssb-prep-portal.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

## Step 5: Deploy Frontend

The GitHub Actions workflow will automatically deploy when you push to main. Or manually:

```bash
# Install gh-pages if not installed
npm install -g gh-pages

# Deploy
cd client
npm run deploy
```

## Step 6: Deploy Backend

Since GitHub Pages only serves static files, you need to deploy the backend separately. Here are free options:

### Option A: Render (Recommended - Free Tier Available)

1. Go to [Render](https://render.com)
2. Sign up/login
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: ssb-prep-portal-backend
   - **Root Directory**: Leave empty
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Environment Variables**:
     - `PORT`: 10000 (or leave default)
     - `NEWS_API_KEY`: (optional, your News API key)
6. Click **Create Web Service**
7. Copy the service URL (e.g., `https://ssb-prep-portal-backend.onrender.com`)

### Option B: Railway

1. Go to [Railway](https://railway.app)
2. Sign up/login
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. Railway will auto-detect Node.js
6. Set environment variables if needed
7. Copy the deployment URL

### Option C: Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/login
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: Leave as root
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Add environment variables
6. Deploy

## Step 7: Update Frontend with Backend URL

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: Your backend URL (e.g., `https://ssb-prep-portal-backend.onrender.com`)
5. Push any change to trigger the workflow, or manually run it

Alternatively, you can set it in the GitHub Pages environment:

1. Go to repository **Settings** → **Pages**
2. Add environment variable `REACT_APP_API_URL` with your backend URL

## Step 8: Rebuild and Redeploy

After setting the backend URL:

```bash
# Update the API URL in your local code (optional, for testing)
# Create client/.env.production:
echo "REACT_APP_API_URL=https://your-backend-url.onrender.com" > client/.env.production

# Build and deploy
cd client
npm run build
npm run deploy
```

Or just push to main branch and GitHub Actions will handle it.

## Step 9: Test Your Deployment

1. Visit your GitHub Pages URL: `https://YOUR_USERNAME.github.io/ssb-prep-portal`
2. Test all features:
   - Upload files
   - Take tests
   - Read materials

## Troubleshooting

### CORS Errors

If you see CORS errors, update `server/index.js`:

```javascript
app.use(cors({
  origin: ['https://YOUR_USERNAME.github.io', 'http://localhost:3000'],
  credentials: true
}));
```

### 404 Errors on Refresh

This is normal for React Router on GitHub Pages. The app should still work when navigating from the home page.

### Backend Not Working

- Check your backend service is running
- Verify the `REACT_APP_API_URL` is set correctly
- Check browser console for API errors
- Verify CORS settings in backend

## Environment Variables

### Frontend (GitHub Pages)
- `REACT_APP_API_URL`: Your backend service URL

### Backend (Render/Railway/etc.)
- `PORT`: Server port (usually auto-set by hosting service)
- `NEWS_API_KEY`: (Optional) News API key for headlines

## Custom Domain (Optional)

1. Add a `CNAME` file in `client/public/` with your domain
2. Configure DNS settings
3. Update homepage in `client/package.json`

## Notes

- GitHub Pages is free but only serves static files
- Backend must be hosted separately (Render, Railway, etc. offer free tiers)
- File uploads are stored on the backend server (not persistent on free tiers)
- For production, consider using cloud storage (AWS S3, Cloudinary) for file uploads

