# ⚠️ CRITICAL: Vercel Environment Variables Setup

## The 404 Error is caused by missing environment variables!

### 🚨 IMMEDIATE ACTION REQUIRED

Go to: **https://vercel.com/dashboard** → Select your project → Settings → Environment Variables

### Add These Variables (REQUIRED):

#### 1. Backend API URL ⚠️ MUST INCLUDE /api
```
Key: NEXT_PUBLIC_API_URL
Value: https://pislis-backend.onrender.com/api
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
       IMPORTANT: Must end with /api
Environment: ✓ Production  ✓ Preview  ✓ Development
```

**⚠️ COMMON MISTAKE:** Do NOT use `https://pislis-backend.onrender.com` (missing `/api`)

#### 2. Cloudinary Cloud Name
```
Key: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
Value: [Your cloud name from https://cloudinary.com/console]
Environment: ✓ Production  ✓ Preview  ✓ Development
```

### After Adding Variables:

1. Click **"Save"**
2. Go to **Deployments** tab
3. Click **"Redeploy"** on the latest deployment
4. Select **"Redeploy with latest commit"**

---

## Verification Steps:

### ✅ Test Backend Connection
Visit: https://pislis-backend.onrender.com/api/health
- Expected: `{"status":"ok","timestamp":"..."}`
- If this fails, your backend is not running on Render

### ✅ Test Login After Redeploy
1. Go to: https://pislis.vercel.app/login
2. Enter credentials
3. Should NOT see "Route not found" error

### ✅ Check Browser Console
Press F12 → Console tab
- Should NOT see: `POST https://pislis-backend.onrender.com/auth/login 404`
- Should see: `POST https://pislis-backend.onrender.com/api/auth/login 200`

---

## What Was Fixed:

✅ Created `/privacy` and `/terms` pages (404 errors resolved)
✅ Clarified `.env.production` file with proper API URL
✅ Added deployment instructions

## Why Environment Variables Are Required:

The `.env.production` file in your code is a **template/fallback**. Vercel requires you to set environment variables in their dashboard. Without them, the frontend defaults to `http://localhost:5000/api` which doesn't exist in production.

---

## Still Having Issues?

### Backend 404 Errors
- Check Render dashboard - is your backend deployed and running?
- Verify the backend URL: https://pislis-backend.onrender.com/api/health
- Check Render logs for errors

### CORS Errors
- Ensure backend `FRONTEND_URL` env var is set to: `https://pislis.vercel.app`
- Backend CORS already configured for both localhost and production

### Videos Not Loading
- Set Cloudinary cloud name in Vercel
- Check videos are uploaded to Cloudinary under `darwin-education/lessons/` folder
