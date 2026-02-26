# Apres School - Deployment Guide

This guide covers deploying your Apres School PWA app for free and making it installable on iPad/iPhone.

## 📱 PWA Icons (Required Before Deployment)

Your app needs the following icon files in the `/public` directory:

- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)
- `icon-152.png` (152x152px) - iOS
- `icon-180.png` (180x180px) - iOS
- `icon-167.png` (167x167px) - iOS
- `ski.svg` (favicon)

### Creating Icons

**Option 1: Use an online PWA icon generator**
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload your logo/icon (minimum 512x512px)
3. Download the generated icons
4. Place them in the `/public` directory

**Option 2: Use design software**
- Create a square image with your app branding
- Export in multiple sizes listed above
- Ensure icons work on both light and dark backgrounds
- Use simple, recognizable design (shows small on home screen)

## 🚀 Free Hosting Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero configuration for Vite apps
- Automatic HTTPS
- Global CDN
- Unlimited bandwidth for hobby projects

**Steps:**
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? (select your account)
   - Link to existing project? `N`
   - Project name? `apres-school` (or your choice)
   - Directory? `./` (press Enter)
   - Override settings? `N`

5. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

6. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

**Steps:**
1. Create a `netlify.toml` file in project root:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

3. Login and deploy:
   ```bash
   netlify login
   netlify init
   netlify deploy --prod
   ```

4. Add environment variables in Netlify dashboard:
   - Site settings → Environment variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## 🗄️ Supabase Setup

### Get Your Credentials

1. Go to https://supabase.com/dashboard
2. Select your project (or create one)
3. Go to Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

### Run Database Setup

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-setup.sql`
3. Paste and run in SQL Editor
4. Verify the `users` table was created in Table Editor

### Enable Row Level Security

Your users table should have RLS policies that:
- Allow users to read their own data
- Allow new registrations (inserts)
- Prevent unauthorized access

If you need to adjust policies, use the Supabase dashboard under Authentication → Policies.

## 📲 Installing on iPad/iPhone

### Testing Installation

1. Deploy your app using Vercel or Netlify
2. Open the deployed URL in Safari on your iPad/iPhone
3. Tap the Share button (square with arrow pointing up)
4. Scroll down and tap "Add to Home Screen"
5. Customize the name if desired
6. Tap "Add"

### Requirements for iOS Installation

Your app must:
- ✅ Be served over HTTPS (Vercel/Netlify provide this)
- ✅ Have a valid `manifest.json` (already configured)
- ✅ Include apple-specific meta tags (already configured)
- ✅ Have apple-touch-icon images (need to create icons)
- ✅ Register a service worker (already configured)

### Testing PWA Features

**Test offline functionality:**
1. Open your installed app
2. Navigate around a bit (caches pages)
3. Turn on Airplane Mode
4. Try opening the app - should still work!

**Check service worker:**
1. Open Safari Developer Tools (if available)
2. Go to Application → Service Workers
3. Verify service worker is registered

## 🔧 Build Configuration

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `/dist` directory.

### Preview Production Build Locally

```bash
npm run preview
```

### Environment Variables

Create a `.env` file for local development:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important:** Never commit `.env` to git! It's already in `.gitignore`.

## ✅ Pre-Deployment Checklist

- [ ] Create all required PWA icons
- [ ] Run `supabase-setup.sql` in Supabase SQL Editor
- [ ] Add environment variables to your hosting platform
- [ ] Test authentication (register and login)
- [ ] Test on actual iOS device
- [ ] Verify "Add to Home Screen" appears in Safari
- [ ] Test offline functionality
- [ ] Verify app icon appears correctly on home screen

## 🐛 Troubleshooting

### App won't install on iOS
- Ensure you're using Safari (not Chrome)
- Check that HTTPS is enabled
- Verify all icon files exist
- Check browser console for service worker errors

### Service Worker not registering
- Check browser console for errors
- Verify `/service-worker.js` is accessible
- Ensure site is served over HTTPS

### Database connection errors
- Verify environment variables are set correctly
- Check Supabase project status
- Ensure RLS policies allow necessary operations

### Authentication not working
- Verify `users` table exists in Supabase
- Check browser console for errors
- Ensure password length meets minimum (6 characters)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [iOS PWA Guidelines](https://developer.apple.com/design/human-interface-guidelines/web-apps)

## 🎉 Next Steps

After deployment:
1. Share the URL with your family
2. Have everyone install it on their devices
3. Test the messaging and challenge features
4. Monitor usage in Supabase dashboard
5. Gather feedback and iterate!

Enjoy your family learning adventure! ⛷️
