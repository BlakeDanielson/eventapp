# 🚀 Deploy EventApp to Render

This guide will help you deploy your EventApp to Render in under 10 minutes.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub ✅ (Done!)
2. **Render Account**: Sign up at [render.com](https://render.com) (Free tier available)
3. **Environment Variables**: Ready to configure in Render dashboard

---

## 🎯 Quick Deployment Steps

### 1. Create New Web Service on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: `BlakeDanielson/eventapp`
5. Configure the service:

```
Name: eventapp
Region: Oregon (US West) - or closest to you
Branch: main
Runtime: Node
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

### 2. Configure Environment Variables

In the Render dashboard, add these environment variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:./prisma/production.db` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_cHJvdWQtb3N0cmljaC0zLmNsZXJrLmFjY291bnRzLmRldiQ` |
| `CLERK_SECRET_KEY` | `sk_test_m4mwzHHKZKVoZy01b6yQIhQq2GncekjZHmdHzbz7LF` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `RESEND_API_KEY` | `re_LHog5zR7_2EqWhYZieXfrRrpuKQ1eW4md` |
| `RESEND_FROM_EMAIL` | `noreply@blakemakesthings.com` |

### 3. Deploy!

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your app
3. You'll get a live URL like: `https://eventapp-xyz.onrender.com`

---

## ⚠️ Important Notes for MVP

### SQLite Limitations on Render
- **Data resets on each deploy** - This is fine for MVP testing!
- For production, consider upgrading to PostgreSQL later
- All event data will be lost when you push new code

### Clerk Auth URLs
- Update your Clerk dashboard with the new Render URL
- Go to Clerk Dashboard → Configure → Domains
- Add your Render URL (e.g., `https://eventapp-xyz.onrender.com`)

### First Deploy
- Initial build may take 5-10 minutes
- Subsequent deploys are much faster
- Watch the build logs for any issues

---

## 🎉 After Deployment

Your EventApp will be live with:
- ✅ Full event creation and management
- ✅ User authentication (Clerk)
- ✅ Email notifications (Resend)
- ✅ Ticket purchasing system
- ✅ Private events with invites
- ✅ Organizer profiles
- ✅ Responsive design

**Perfect for MVP testing and client demos!**

---

## 🔧 Troubleshooting

**Build fails?**
- Check environment variables are set correctly
- Ensure all secrets don't have extra spaces

**Database errors?**
- Verify `DATABASE_URL=file:./prisma/production.db`
- Check Prisma schema is valid

**Auth not working?**
- Update Clerk dashboard with new domain
- Verify Clerk keys are correct

**Need help?** Check Render's excellent documentation or logs in the dashboard. 