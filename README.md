<!-- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. -->













🌟 Kundali Platform

A Next.js 15 + TypeScript based Vedic Astrology and Numerology Platform, built with modern UI components, Drizzle ORM (SQLite), JWT authentication, and Nodemailer for emails.
It provides Kundali generation, numerology calculator, user authentication, and a payment-ready backend — making it production-ready.

🚀 Tech Stack
Category	Tools / Libraries
Frontend	Next.js 15 (App Router), React 19, Tailwind CSS 4, Framer Motion
Backend	Node.js (built into Next.js API routes)
Database	SQLite (via Drizzle ORM)
Authentication	JWT (jsonwebtoken + custom middleware)
Email Service	Nodemailer
Styling & UI	Radix UI, ShadCN, Lucide Icons
3D / Visuals	Three.js, React Three Fiber, GSAP
Utilities	Dotenv, Date-fns, Razorpay (future payments), QRCode
Form Validation	React Hook Form + Zod
📁 Project Structure
kundali-platform-main/
├── src/
│   ├── app/
│   │   ├── page.tsx                # Homepage
│   │   ├── kundali/page.tsx        # Kundali Generator
│   │   ├── numerology/page.tsx     # Numerology Calculator
│   │   ├── login/page.tsx          # Login Page
│   │   ├── signup/page.tsx         # Signup Page
│   │   ├── admin/page.tsx          # Admin Dashboard
│   │   ├── layout.tsx              # Root layout
│   │   ├── globals.css             # Global styles
│   │   ├── api/
│   │   │   ├── auth/               # Authentication APIs
│   │   │   ├── email/              # Email send API
│   │   │   ├── kundali/            # Kundali API
│   │   │   ├── numerology/         # Numerology API
│   ├── lib/
│   │   ├── db.ts                   # SQLite connection via Drizzle ORM
│   │   ├── jwt.ts                  # JWT token helpers
│   │   ├── email.ts                # Nodemailer setup
│   │   ├── auth.ts                 # Authentication helpers
│   ├── components/                 # UI Components (Cards, Navbar, etc.)
│   └── utils/                      # Helpers / Reusable Logic
├── .env.example                    # Example env file
├── package.json
├── drizzle.config.ts               # Drizzle ORM config
└── README.md                       # This file

⚙️ Environment Variables

Create a .env file in the root directory and fill in these:

# JWT Secret Key
JWT_SECRET=your-secret-key-change-in-production

# Database (SQLite local file)
DATABASE_URL=file:./kundali.db

# Email Configuration (for Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-app-password

# Optional Razorpay Integration
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

🧠 Database Setup (SQLite + Drizzle ORM)

The project uses SQLite for simplicity (no server setup needed).

Generate Database File

npx drizzle-kit generate


Push Schema to Database

npx drizzle-kit push


Your database will be created at:

./kundali.db


If you want to switch to MySQL or PostgreSQL, just update:

DATABASE_URL="mysql://user:password@localhost:3306/kundali"


and install the respective driver.

🔐 Authentication (JWT)

Signup and login are handled in /api/auth/signup and /api/auth/login.

On successful login, a JWT token is generated via:

import jwt from "jsonwebtoken";
const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });


Tokens are verified in protected routes using a middleware that reads headers or cookies.

📧 Email (Nodemailer)

Configured in src/lib/email.ts:

import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


Used for OTPs, user verification, and notifications.

🧩 Installation & Setup

Clone the Repository

git clone https://github.com/yourusername/kundali-platform.git
cd kundali-platform-main


Install Dependencies

npm install --legacy-peer-deps


Set up Environment

cp .env.example .env
# Fill values in .env


Run the App in Dev Mode

npm run dev


Build for Production

npm run build
npm run start

🧾 Common Build Issues & Fixes
Error	Fix
ICO image entry has too many color planes	Replace favicon.ico with a new valid one (e.g., 64x64 PNG renamed to .ico)
Module not found: jsonwebtoken / nodemailer	Run npm install jsonwebtoken nodemailer sqlite3 dotenv --legacy-peer-deps
ERESOLVE better-auth conflict	Update "better-auth": "1.3.27" or use --legacy-peer-deps
Cannot find module drizzle-kit	Run npm install drizzle-kit
Database not created	Run npx drizzle-kit push to sync tables
🌍 Deployment Guide
Vercel (Recommended)

Push code to GitHub.

Connect to Vercel.

Add .env variables in Project Settings → Environment Variables.

Deploy.

Self Hosting
npm run build
npm run start


Ensure .env variables and database file exist on the server.

👨‍💻 Contributing

Fork the repository

Create your branch (feature/new-module)

Commit your changes

Push and create a pull request



can see live cms at -  https://local.drizzle.studio/











💡 Future Enhancements

Astrology AI Assistant for Kundali insights

Payment & Subscription Plans

User Dashboard & Report Downloads

Cloud database migration (PostgreSQL or Supabase)

Dark mode personalization

🧾 License

MIT License © 2025 Aayush Sharma