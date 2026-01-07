# 🚀 Render Static Site Deployment Guide

## Why Render Static Site?
- ✅ Free tier with no sleep time
- ✅ Faster load times (static HTML)
- ✅ Better SEO
- ✅ More reliable than Vercel free tier
- ✅ Automatic SSL certificates

## Prerequisites
1. GitHub repository pushed
2. Render account: https://render.com

---

## 🎯 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Configure for Render static deployment"
git push origin main
```

### Step 2: Create New Static Site on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository: `Tanex-netizen/Pislis`

### Step 3: Configure Build Settings

**Name:** `pislis-frontend`

**Root Directory:** `frontend`

**Build Command:**
```bash
npm install && npm run build
```

**Publish Directory:** `out`

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://pislis-backend.onrender.com/api` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `[Your Cloudinary cloud name]` |

### Step 5: Deploy!

Click **"Create Static Site"**

Your site will be available at: `https://pislis.onrender.com`

---

## 🔧 Update Backend CORS

After deployment, update your backend's CORS to allow the new domain:

### On Render Dashboard:
1. Go to your backend service → **Environment**
2. Add/Update:
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://pislis.onrender.com`

3. Your backend will automatically redeploy

---

## ✅ Verification

### Test Backend:
```bash
curl https://pislis-backend.onrender.com/api/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### Test Frontend:
1. Visit: `https://pislis.onrender.com`
2. Try login/signup
3. Check browser console for errors

---

## 🆚 Render vs Vercel

### Render Static Site (Recommended)
- ✅ No sleeping
- ✅ Predictable behavior
- ✅ Simple configuration
- ❌ No ISR (Incremental Static Regeneration)
- ❌ No API routes

### Vercel (Current)
- ✅ ISR support
- ✅ API routes
- ❌ Complex caching
- ❌ Can have deployment issues

---

## 🔄 Continuous Deployment

Every push to `main` branch automatically:
1. Triggers new build on Render
2. Deploys updated static site
3. No manual intervention needed

---

## 📝 Custom Domain (Optional)

1. Go to Static Site → **Settings** → **Custom Domains**
2. Add your domain (e.g., `www.darwin-education.com`)
3. Update DNS records as shown
4. Automatic SSL certificate

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify `package.json` scripts
- Ensure all dependencies are in `dependencies` (not `devDependencies`)

### CORS Errors
- Verify `FRONTEND_URL` in backend environment variables
- Check backend CORS configuration includes your Render URL

### 404 Errors
- Ensure `Publish Directory` is set to `out`
- Check `next.config.js` has `output: 'export'`

---

## 💡 Pro Tips

1. **Free SSL:** Automatic HTTPS with Let's Encrypt
2. **CDN:** Built-in global CDN for fast loading
3. **Auto-deploys:** Every git push triggers deployment
4. **Preview URLs:** Each PR gets a preview deployment
5. **Rollback:** Easy rollback to previous deployments

---

## 🎉 You're Done!

Your static site is now deployed on Render with:
- ✅ No sleep time
- ✅ Fast global CDN
- ✅ Automatic SSL
- ✅ Continuous deployment
