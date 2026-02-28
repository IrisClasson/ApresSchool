# Deployment Guide - Vercel

## Overview

This guide covers deploying Apres School to Vercel with automatic deployments triggered by pushes to the main branch.

## Prerequisites

- GitHub account with ApresSchool repository
- Vercel account (free tier works great)
- Git installed locally
- Node.js and npm installed

## Initial Vercel Setup

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `IrisClasson/ApresSchool` repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2. Configure Environment Variables

In Vercel project settings → Environment Variables, add:

**Optional (for enhanced features):**
- `VITE_ANTHROPIC_API_KEY` - For AI-powered math challenges
- `VITE_SUPABASE_URL` - For cross-device syncing
- `VITE_SUPABASE_ANON_KEY` - Supabase public key

**Note**: The app works fully without these. They're progressive enhancements.

### 3. Deploy Settings

Vercel will automatically:
- Deploy on every push to `main` branch
- Generate preview deployments for pull requests
- Provide automatic HTTPS
- Handle caching and CDN distribution

## Deployment Workflow

### Automatic Deployment (Recommended)

```bash
# 1. Make your changes
git add .
git commit -m "feat: add new feature"

# 2. Push to main branch
git push origin main

# 3. Vercel automatically:
#    - Detects the push
#    - Runs npm install
#    - Runs npm run build
#    - Deploys to production
#    - Updates version (if using GitHub Actions)
```

### Manual Version Bump (Without GitHub Actions)

```bash
# Bump version and deploy
npm run deploy

# Or manually bump specific version type:
npm run version:patch  # 1.0.0 → 1.0.1 (bug fixes)
npm run version:minor  # 1.0.0 → 1.1.0 (new features)
npm run version:major  # 1.0.0 → 2.0.0 (breaking changes)

# Then push
git push origin main
```

## Post-Deployment Verification

After each deployment, verify:

### 1. Service Worker Updates
1. Open your production URL
2. Check browser console for: `[SW] Service worker registered`
3. Check Application → Service Workers in DevTools

### 2. Version Number
1. Check the app footer shows the new version
2. Verify `version.json` is accessible: `https://your-app.vercel.app/version.json`

### 3. PWA Update Notification
1. Keep the app open in one tab
2. Deploy a new version
3. Within 60 seconds, you should see the update prompt

### 4. Core Functionality
- [ ] Login/Register works
- [ ] Create challenge works (parent role)
- [ ] Accept challenge works (kid role)
- [ ] Messages send/receive properly
- [ ] Offline mode works (service worker caching)
- [ ] Language switcher works (EN/SV)

## Custom Domain Setup (Optional)

### 1. Add Domain in Vercel
1. Go to Vercel project → Settings → Domains
2. Add your custom domain (e.g., `apresschool.com`)
3. Follow DNS configuration instructions

### 2. Update PWA Manifest
Edit `public/manifest.json`:
```json
{
  "start_url": "https://apresschool.com/",
  "scope": "https://apresschool.com/"
}
```

## Performance Optimization

### Build Optimization
Already configured in `vite.config.js`:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

### Vercel Edge Caching
Headers are configured in `vercel.json` for:
- Service worker (no cache)
- Static assets (long cache)
- HTML files (short cache)

## Monitoring and Analytics

### Vercel Analytics (Built-in)
1. Go to Vercel project → Analytics
2. View:
   - Page views
   - Performance metrics (Core Web Vitals)
   - Geographic distribution
   - Device types

### Custom Analytics (Optional)
Add to `public/index.html` or `src/main.jsx`:
- Google Analytics
- Plausible Analytics (privacy-friendly)
- Umami Analytics (self-hosted)

## Rollback Procedure

If a deployment breaks something:

### Option 1: Vercel Instant Rollback
1. Go to Vercel project → Deployments
2. Find the last working deployment
3. Click "..." menu → "Promote to Production"
4. Instant rollback (no rebuild needed)

### Option 2: Git Revert
```bash
# Find the problematic commit
git log --oneline

# Revert to previous version
git revert <commit-hash>

# Push (triggers auto-deploy)
git push origin main
```

### Option 3: Force Hard Reload (Users)
If users are stuck on a broken version:
1. Temporarily add `ForceReloadButton` to the app
2. Deploy the fix
3. Instruct users to click "Force Reload"
4. Remove the button in next deployment

## Troubleshooting

### Build Fails on Vercel

**Check build logs:**
1. Vercel dashboard → Deployments → [Failed deployment]
2. Click "View Build Logs"

**Common issues:**
- Missing environment variables
- Node version mismatch
- Build command error

**Fix:**
```bash
# Test build locally first
npm run build

# If it works locally, check Vercel settings match
```

### Service Worker Not Updating

**Cause**: Vercel might cache the service worker

**Fix**: Add `vercel.json` with proper headers (see vercel.json configuration)

### Users Not Seeing Updates

**Cause**: Service worker update check interval

**Quick fix:**
1. Add `ForceReloadButton` temporarily
2. Ask users to force reload
3. Remove button after everyone updates

**Long-term fix**: Already implemented - 60-second update checks

### Version.json 404 Error

**Cause**: Not copied during build

**Fix**: Check `public/` folder contains version.json before build

## Security Considerations

### Environment Variables
- Never commit `.env` files to git
- Use Vercel Environment Variables for secrets
- Prefix all public variables with `VITE_`

### HTTPS Only
- Vercel automatically provides HTTPS
- Service workers require HTTPS (except localhost)
- PWA features require HTTPS

### Content Security Policy (Optional)
Add to `vercel.json` for enhanced security:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

## Deployment Checklist

Before each deployment:
- [ ] Run `npm run build` locally to test
- [ ] Test in production preview mode: `npm run preview`
- [ ] Verify version number in `version.json`
- [ ] Check git status: `git status`
- [ ] Review commit message follows conventions
- [ ] Verify all tests pass (if you have tests)
- [ ] Check no sensitive data in code
- [ ] Push to main branch
- [ ] Monitor Vercel deployment logs
- [ ] Test production URL after deployment
- [ ] Verify update prompt appears in existing sessions

## Getting Help

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vite Documentation**: [vitejs.dev](https://vitejs.dev)
- **Service Workers**: [web.dev/service-workers](https://web.dev/service-workers)
- **PWA Guide**: [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps)

## Quick Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Bump version and deploy
npm run deploy

# Manual version bumps
npm run version:patch  # Bug fixes
npm run version:minor  # New features
npm run version:major  # Breaking changes

# Check deployment status
git log --oneline -5
git status
```
