# Deployment Checklist

Use this checklist before every deployment to ensure quality and consistency.

## Pre-Deployment (Development Phase)

### Code Quality
- [ ] All features work as expected in local development
- [ ] No console errors in browser DevTools
- [ ] No TypeScript/ESLint warnings (if configured)
- [ ] Code is properly formatted and readable
- [ ] Removed all `console.log()` debugging statements (or use proper logging)
- [ ] No commented-out code blocks (unless intentionally documented)

### Testing
- [ ] Test all user flows:
  - [ ] Parent login/logout
  - [ ] Kid login/logout
  - [ ] Create challenge (parent)
  - [ ] Accept challenge (kid)
  - [ ] Complete challenge (kid)
  - [ ] Send/receive messages (both roles)
  - [ ] Language switcher (EN ↔ SV)
- [ ] Test on mobile viewport (Chrome DevTools responsive mode)
- [ ] Test offline functionality (disable network in DevTools)
- [ ] Verify service worker registration (Application tab in DevTools)

### Build Verification
```bash
# Test production build locally
npm run build
npm run preview
```
- [ ] Build completes without errors
- [ ] Preview server starts successfully
- [ ] All routes work in preview mode
- [ ] Assets load correctly (images, fonts, icons)
- [ ] Service worker registers properly
- [ ] PWA installable (check install prompt)

### Version Management
- [ ] Review commits since last deployment: `git log --oneline -10`
- [ ] Verify commit messages follow conventions (feat:, fix:, chore:, etc.)
- [ ] Decide on version bump type (or use auto-detection):
  - **Patch** (x.x.1): Bug fixes only
  - **Minor** (x.1.x): New features added
  - **Major** (1.x.x): Breaking changes
- [ ] Update `version.json` description field to summarize changes

### Security & Privacy
- [ ] No API keys or secrets in code (use environment variables)
- [ ] No sensitive user data logged to console
- [ ] `.env` file is in `.gitignore`
- [ ] Environment variables set in Vercel dashboard (if needed)

### Git Status
```bash
git status
```
- [ ] All changes are committed
- [ ] Working directory is clean
- [ ] On correct branch (usually `main`)
- [ ] Branch is up to date with remote: `git pull origin main`

## Deployment Process

### Option 1: Automated Version Bump (Recommended)

```bash
# Auto-detects version bump from commit messages and deploys
npm run deploy
```

This will:
1. Analyze commits since last tag
2. Determine version bump type (major/minor/patch)
3. Update `version.json` and `package.json`
4. Create git commit and tag
5. Push to main branch (triggers Vercel deployment)

### Option 2: Manual Version Bump

```bash
# Choose appropriate bump type
npm run version:patch  # Bug fixes
npm run version:minor  # New features
npm run version:major  # Breaking changes

# Push to trigger deployment
git push origin main --follow-tags
```

### Deployment Execution
- [ ] Run deployment command
- [ ] Verify version bump commit created
- [ ] Verify git tag created (e.g., `v2.1.0`)
- [ ] Confirm push completed successfully
- [ ] Check Vercel dashboard for deployment start

## Post-Deployment (Verification)

### Vercel Dashboard
Go to: https://vercel.com/dashboard

- [ ] Deployment status shows "Ready" (green)
- [ ] Build logs show no errors
- [ ] Deployment preview URL is accessible
- [ ] Production URL updated

### Production Verification

Visit your production URL:

#### Service Worker & PWA
- [ ] Open DevTools → Application → Service Workers
- [ ] Service worker shows "activated and is running"
- [ ] No errors in console
- [ ] PWA install prompt appears (if on supported device)

#### Version Check
- [ ] App footer shows correct new version number
- [ ] Direct URL check: `https://your-app.vercel.app/version.json`
- [ ] Version.json shows correct version and cache version

#### Core Functionality
Test critical user flows on production:
- [ ] Login works (both parent and kid)
- [ ] Registration works
- [ ] Challenge creation works (parent)
- [ ] Challenge acceptance works (kid)
- [ ] Messages send and receive properly
- [ ] Language switcher works (EN ↔ SV)
- [ ] Offline mode works (try disconnecting network)

#### Update Notification System
**Important:** Test that existing users will see update prompt

1. Open app in one browser tab (before deployment)
2. Deploy new version
3. Wait 60 seconds
4. [ ] Update prompt appears in the first tab
5. [ ] Clicking "Update Now" reloads the app
6. [ ] New version number appears after reload

### Performance Check
- [ ] Lighthouse score (optional but recommended):
  ```bash
  # In Chrome DevTools → Lighthouse
  # Run audit for: Performance, Accessibility, PWA
  ```
  - Performance: > 90
  - Accessibility: > 90
  - PWA: > 90

### Cross-Browser Testing (Recommended)
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (iOS/macOS if available)

### Mobile Device Testing (If Available)
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] PWA install works
- [ ] Offline mode works
- [ ] Notifications work (if permission granted)

## Post-Deployment Tasks

### Communication
- [ ] Notify users of update (if major changes)
- [ ] Update release notes or changelog (optional)
- [ ] Post about new features (if applicable)

### Monitoring
First 24 hours after deployment:
- [ ] Check Vercel Analytics for errors
- [ ] Monitor user feedback/bug reports
- [ ] Watch for error reports in browser console (if users report)

### Documentation
- [ ] Update README if new features added
- [ ] Update API documentation if endpoints changed
- [ ] Update user guide if UI changed significantly

### Cleanup
- [ ] Close related GitHub issues/PRs
- [ ] Archive old deployment branches (if any)
- [ ] Update project board/kanban (if using)

## Rollback Procedure (If Issues Arise)

If the deployment causes problems:

### Quick Rollback via Vercel
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback (no rebuild)

### Git Rollback
```bash
# Find the problematic commit
git log --oneline

# Revert to previous version
git revert <commit-hash>
git push origin main

# Or hard reset (dangerous!)
git reset --hard <previous-tag>
git push origin main --force
```

### User Communication
- [ ] Notify users if rollback affects them
- [ ] Provide workaround if possible
- [ ] Communicate timeline for fix

## Emergency Contacts

- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: https://github.com/IrisClasson/ApresSchool/issues
- **Documentation**: See `DEPLOYMENT_GUIDE.md`

## Version History Template

Keep track of recent deployments:

```
v2.2.0 - 2026-02-28 - PWA update system + Swedish translations
v2.1.0 - 2026-02-26 - Clean UI redesign + presence system
v2.0.0 - 2026-02-20 - Major architecture refactor
```

## Quick Reference Commands

```bash
# Development
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build

# Deployment
npm run deploy             # Auto version bump + push
npm run version:patch      # Manual patch bump
npm run version:minor      # Manual minor bump
npm run version:major      # Manual major bump

# Git
git status                 # Check working directory
git log --oneline -10      # Recent commits
git tag -l                 # List all tags
git push --follow-tags     # Push with tags

# Verification
curl https://your-app.vercel.app/version.json  # Check version
```

## Notes Section

Use this space to document deployment-specific notes:

---
**Date:** ___________

**Version:** ___________

**Deployed by:** ___________

**Issues encountered:** ___________

**Time to deploy:** ___________

**Notes:** ___________

---
