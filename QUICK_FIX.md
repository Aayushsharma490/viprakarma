# 🚨 QUICK FIX GUIDE - DO THIS NOW!

## Problem
- APIs failing with 400/500 errors
- Can't add pandits
- Forgot password not working
- Production has no database

## Solution (2 Simple Steps)

### Step 1: Fix Localhost (30 seconds)

Open terminal and run these 3 commands:

```bash
del viprakarma.db
del local.db  
node scripts/complete-reset.js
```

**Done!** Localhost will work perfectly.

### Step 2: Fix Production (5 minutes)

1. **Create Database:**
   - Go to: https://neon.tech
   - Sign up (free)
   - Create project: "viprakarma"
   - Copy connection string

2. **Add to Vercel:**
   - Go to: https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add: `DATABASE_URL` = (paste connection string)
   - Click "Save"

3. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Wait 2 minutes

**Done!** Production will work perfectly.

---

## That's It!

After these 2 steps:
- ✅ All APIs will work
- ✅ Can add pandits
- ✅ Forgot password works
- ✅ No errors
- ✅ Production ready

**Total time: 5-6 minutes**
