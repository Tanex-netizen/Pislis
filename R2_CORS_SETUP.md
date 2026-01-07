# R2 Public Access Setup (REQUIRED for R2 videos)

## ⚠️ Critical Issue
R2's internal storage URLs (`*.r2.cloudflarestorage.com`) **CANNOT** be accessed directly by web browsers. They are for S3 API access only. You MUST set up a public domain.

## Solution: Enable Public R2 Access

### Option 1: R2.dev Subdomain (Easiest - Free)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Navigate to: **R2 → darwin-videos bucket → Settings**

2. **Find "Public Development URL" section**
   - Look for "R2.dev subdomain" or "Public URL"
   - Click **"Allow Access"** or **"Connect Domain"**
   - You'll get a URL like: `https://pub-xxxxxxxxxxxx.r2.dev`

3. **Copy the Public URL**
   - Example: `https://pub-1234567890abcdef.r2.dev`
   
4. **Tell me the URL** so I can update the code

### Option 2: Custom Domain (Advanced)

1. Go to bucket settings → **Custom Domains**
2. Click "Connect Domain"
3. Enter your domain (e.g., `videos.yourdomain.com`)
4. Follow DNS setup instructions
5. Wait for DNS propagation

## Alternative: Upload Large Videos to Cloudinary

If R2 setup is too complex, consider:
1. Upgrading Cloudinary plan to support larger videos
2. Compressing videos to under 100MB
3. Using Cloudinary's chunked upload for large files

## Current Status

🔴 **R2 videos are DISABLED** - All videos currently use Cloudinary to avoid errors
✅ Once you provide the R2 public URL, I'll re-enable R2 for large videos
