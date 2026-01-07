# R2 CORS Configuration Required

## Problem
R2 videos are blocked by CORS (OpaqueResponseBlocking error)

## Solution
You need to configure CORS on your R2 bucket `darwin-videos`

### Steps:

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Navigate to: R2 → Buckets → `darwin-videos`

2. **Configure CORS Settings**
   - Click on "Settings" tab
   - Find "CORS Policy" section
   - Add the following CORS configuration:

```json
[
  {
    "AllowedOrigins": [
      "https://pislis.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

3. **Save and Wait**
   - Save the CORS configuration
   - Wait 1-2 minutes for changes to propagate
   - Refresh your site

### Alternative: Public Domain
If you set up a public R2 domain:
1. Go to R2 bucket settings
2. Connect a custom domain or use R2.dev subdomain
3. Enable "Public Access"
4. Update the R2_BUCKET URL in code to use the public domain

### Verification
After CORS is configured, videos should load without the `OpaqueResponseBlocking` error.
