# Cloudinary Implementation Guide

## ✅ What's Been Done

1. ✅ Installed Cloudinary CLI
2. ✅ Created upload script (`upload-to-cloudinary.ps1`)
3. ✅ Updated code to use Cloudinary URLs
4. ✅ Created video list generator script
5. ✅ Updated environment variable templates

## 📋 Step-by-Step Implementation

### Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up (free plan includes):
   - 25 GB storage
   - 25 GB bandwidth/month
   - Automatic video optimization
   - Global CDN delivery

3. After login, go to **Dashboard** and note:
   - **Cloud Name**: (e.g., `dyourcloud`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (e.g., `abcdefghijklmnopqrstuvwxyz123`)

### Step 2: Configure Upload Script

1. Open `upload-to-cloudinary.ps1`
2. Update these lines (around line 8-10):
   ```powershell
   $CLOUD_NAME = "your_actual_cloud_name"
   $API_KEY = "your_actual_api_key"
   $API_SECRET = "your_actual_api_secret"
   ```

### Step 3: Upload Videos to Cloudinary

Run the upload script:

```powershell
.\upload-to-cloudinary.ps1
```

This will upload all videos from:
- `frontend/public/Lessons` → `darwin-education/lessons`
- `frontend/public/b-rolls` → `darwin-education/brolls`
- `frontend/public/raw_people` → `darwin-education/anatomy`
- `frontend/public/foods_raw` → `darwin-education/foods`
- `frontend/public/Wins` → `darwin-education/wins`
- And other folders...

**Note**: This may take 30-60 minutes depending on your upload speed and number of videos.

### Step 4: Generate B-roll Video List

After upload completes, run:

```powershell
.\generate-video-list.ps1
```

This will output arrays of video filenames. Copy them into:
`frontend/src/app/api/brolls/route.ts`

Update the `CLOUDINARY_SOURCES` array with the generated lists.

### Step 5: Update Environment Variables

1. Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

2. Test locally:
   ```powershell
   cd frontend
   npm run dev
   ```

3. Visit http://localhost:3000 and check if videos load from Cloudinary

### Step 6: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository: `https://github.com/Tanex-netizen/Pislis`
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Environment Variables**:
     - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = your cloud name
     - `NEXT_PUBLIC_API_URL` = your backend URL (from Render)

5. Click "Deploy"

### Step 7: Deploy Backend to Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `darwin-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: (from `backend/.env.example`)
     - `PORT` = 5000
     - `SUPABASE_URL` = your_supabase_url
     - `SUPABASE_SERVICE_KEY` = your_service_key
     - `JWT_SECRET` = your_jwt_secret
     - `FRONTEND_URL` = your_vercel_url
     - `EMAIL_USER` = your_email
     - `EMAIL_PASS` = your_email_password

5. Click "Create Web Service"

### Step 8: Final Steps

1. After backend deploys, note the URL (e.g., `https://darwin-backend.onrender.com`)
2. Go back to Vercel → Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` = `https://darwin-backend.onrender.com/api`
4. Redeploy frontend

## 🎉 You're Done!

Your site is now live with:
- ✅ Videos hosted on Cloudinary CDN (fast global delivery)
- ✅ Automatic video optimization (smaller files, better quality)
- ✅ Frontend on Vercel (free, fast, auto-scaling)
- ✅ Backend on Render (handles API and authentication)

## 📊 Benefits

1. **No GitHub storage issues** - Videos are on Cloudinary
2. **Fast video delivery** - Global CDN with edge caching
3. **Automatic optimization** - Videos compressed without quality loss
4. **Free hosting** - Vercel + Render free tiers + Cloudinary free tier
5. **Scalable** - Can handle many students simultaneously

## 🔧 Troubleshooting

### Videos not loading?
- Check browser console for errors
- Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
- Check Cloudinary dashboard to confirm videos uploaded

### Upload script fails?
- Verify API credentials are correct
- Check internet connection
- Try uploading one folder at a time

### B-rolls not showing?
- Make sure you updated `route.ts` with video filenames
- Check the `videos: []` arrays aren't empty

## 📞 Need Help?

Contact Darwin Education support on Telegram: https://t.me/darwineducation
