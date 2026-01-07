# Deployment Instructions

## 🚀 Quick Fix for "Route not found" Error

### Vercel Environment Variables (Frontend)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

1. **Backend API URL:**
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://pislis-backend.onrender.com/api`
   - Environment: Production, Preview, Development

2. **Cloudinary Cloud Name:**
   - Key: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - Value: `Your actual Cloudinary cloud name from https://cloudinary.com/console`
   - Environment: Production, Preview, Development

After adding these, click **"Redeploy"** to apply the changes.

---

## Backend Deployment (Render)

### Environment Variables to Set:

```env
PORT=5000
NODE_ENV=production

# Supabase (from your Supabase dashboard)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# JWT Secret (generate a strong random string)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Frontend URL (Vercel deployment URL)
FRONTEND_URL=https://pislis.vercel.app

# Email configuration (optional - for sending enrollment emails)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in Render matches your Vercel domain exactly
- Backend CORS is configured to allow: localhost:3000, pislis.vercel.app

### Videos Not Loading
- Check Cloudinary cloud name is set correctly in Vercel
- Verify videos are uploaded to Cloudinary with correct folder structure

### Login Issues
- Ensure `NEXT_PUBLIC_API_URL` points to your Render backend
- Check backend is running and accessible
- Test API health check: https://pislis-backend.onrender.com/api/health
