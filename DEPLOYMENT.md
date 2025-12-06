# Viprakarma - Production Deployment Guide

## Overview

This guide covers deploying the Viprakarma astrology platform to production.

## Prerequisites
- GitHub account
- Vercel account
- Turso database (already configured)
- Razorpay account (for payments)

## Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Production-ready astrology platform"

# Add your GitHub repository
git remote add origin YOUR_GITHUB_REPO_URL

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure environment variables:

```env
TURSO_CONNECTION_URL=your_turso_url
TURSO_AUTH_TOKEN=your_turso_token
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
JWT_SECRET=your_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret
OPENAI_API_KEY=your_openai_key (optional)
```

5. Click "Deploy"
6. Your app will be live in 2-3 minutes!

## Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Step 4: Database Setup

Your Turso database is already configured with:
- ✅ Users table
- ✅ Astrologers table
- ✅ Bookings table
- ✅ Subscriptions table
- ✅ Chat Sessions table
- ✅ Payments table (with verification)
- ✅ Pandits table

## Step 5: Test Production

1. Test user registration/login
2. Generate a Kundali
3. Try payment flow (test mode)
4. Book a consultation
5. Test AI chat
6. Verify admin dashboard

## Security Checklist

- ✅ Environment variables secured
- ✅ Payment verification implemented
- ✅ JWT authentication configured
- ✅ Database connection encrypted
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ XSS protection via React
- ✅ CSRF tokens (via form validation)

## Performance Optimizations

- ✅ Image optimization (Next.js Image component)
- ✅ Code splitting (automatic)
- ✅ Server-side rendering
- ✅ Static generation where possible
- ✅ CDN delivery (Vercel Edge Network)
- ✅ Lazy loading animations
- ✅ Optimized API routes

## Monitoring

- Set up Vercel Analytics
- Monitor error logs in Vercel dashboard
- Track payment success rate
- Monitor database performance

## Backup Strategy

1. Export Turso database regularly
2. Keep backup of environment variables
3. Maintain version control via Git
4. Document all configuration changes

## Support

For issues, contact: support@viprakarma.com

---

© 2024 Viprakarma. All rights reserved.

## Post-Deployment Checklist

- [ ] Verify homepage loads correctly
- [ ] Test user registration and login
- [ ] Generate sample Kundali
- [ ] Test payment flow with Razorpay
- [ ] Verify admin panel access (viprakarma@gmail.com)
- [ ] Check email notifications
- [ ] Test on mobile devices
- [ ] Monitor error logs