# PWA Update System

## Overview

The app now includes a comprehensive PWA (Progressive Web App) update system that automatically detects when new versions are available and prompts users to update.

## How It Works

### 1. Automatic Update Detection

The system checks for updates in two ways:
- **Periodic checks**: Every 60 seconds
- **Service worker updates**: Immediately when a new service worker is installed

### 2. User Notification

When an update is detected, a beautiful overlay notification appears showing:
- Update available message
- Current version number (from `version.json`)
- Two action buttons:
  - **Later**: Dismisses the prompt (user will see it again on next check)
  - **Update Now**: Applies the update and reloads the app

### 3. Automatic Reload

When the user clicks "Update Now":
1. The new service worker is activated immediately
2. The page automatically reloads with the new version
3. All caches are updated to the new version

## How to Deploy Updates

### Step 1: Update Version Number

Edit `public/version.json` and increment the version:

```json
{
  "version": "1.0.1",
  "cacheVersion": "v2",
  "updated": "2026-02-28T13:00:00Z"
}
```

**Important fields:**
- `version`: Display version shown to users (semantic versioning recommended)
- `cacheVersion`: Cache name suffix (increment this to force cache refresh)
- `updated`: ISO timestamp of when this version was deployed

### Step 2: Build and Deploy

```bash
# Build the production version
npm run build

# Deploy the dist/ folder to your hosting service
# (Netlify, Vercel, GitHub Pages, etc.)
```

### Step 3: Service Worker Updates Automatically

Once deployed:
1. Users with the app open will receive update check within 60 seconds
2. New users will get the latest version immediately
3. Users who haven't opened the app will get the update next time they visit

## Testing the Update Flow Locally

### Option 1: Test Update Notification

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser

3. Make a small change to any component file

4. The service worker will detect the change and show the update prompt

### Option 2: Force Hard Reload (Admin)

The `ForceReloadButton` component provides a nuclear option for testing:

1. Import it in any page:
   ```jsx
   import { ForceReloadButton } from '../components/UpdatePrompt'
   ```

2. Add it to the page:
   ```jsx
   <ForceReloadButton />
   ```

3. This shows a red "Force Reload" button that:
   - Clears ALL caches
   - Unregisters ALL service workers
   - Performs a hard reload from the server

**Warning**: Only use this for debugging. It clears all cached data.

## Update System Architecture

### Files Created

1. **`src/lib/pwaUpdateService.js`**
   - Core update detection and management
   - Methods: `init()`, `checkForUpdates()`, `applyUpdate()`, `forceHardReload()`

2. **`src/components/UpdatePrompt.jsx`**
   - User-facing update notification UI
   - Includes `ForceReloadButton` component for admin use

3. **`src/components/UpdatePrompt.css`**
   - Styles for the update notification overlay

### Files Modified

1. **`public/service-worker.js`**
   - Added message event listener for `SKIP_WAITING` command
   - Handles immediate activation of new service workers

2. **`src/App.jsx`**
   - Integrated `UpdatePrompt` component into main app

## Update Flow Diagram

```
1. User has app open (v1.0.0)
   ↓
2. New version deployed to server (v1.0.1)
   ↓
3. Service worker checks for updates (every 60s)
   ↓
4. New service worker detected and installed
   ↓
5. Update prompt appears to user
   ↓
6. User clicks "Update Now"
   ↓
7. New service worker activated (skipWaiting)
   ↓
8. Page reloads automatically (controllerchange event)
   ↓
9. User now on v1.0.1
```

## Troubleshooting

### Update Not Showing

1. **Check version.json**: Make sure you incremented both `version` and `cacheVersion`
2. **Check browser cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. **Check service worker**: Open DevTools → Application → Service Workers
4. **Use force reload**: Temporarily add `ForceReloadButton` to clear everything

### Update Prompt Appears Too Often

- The system checks every 60 seconds by default
- To change interval, edit `src/lib/pwaUpdateService.js` line 27:
  ```javascript
  setInterval(() => this.checkForUpdates(), 60000) // 60000ms = 60s
  ```

### Updates Not Working in Development

- Service workers behave differently in dev mode
- For full testing, build production version:
  ```bash
  npm run build
  npm run preview
  ```

## Best Practices

1. **Always increment cacheVersion**: This ensures old caches are cleared
2. **Use semantic versioning**: e.g., `1.0.0` → `1.0.1` (patch), `1.1.0` (minor), `2.0.0` (major)
3. **Test before deploying**: Use `npm run build && npm run preview` to test production builds
4. **Deploy during low usage**: Updates are non-disruptive but users will need to reload
5. **Communicate updates**: Consider adding release notes or changelog

## Advanced: Customizing the Update Prompt

The update prompt can be customized by editing `src/components/UpdatePrompt.jsx`:

- **Change text**: Edit the JSX content
- **Add version notes**: Fetch from a changelog API
- **Change timing**: Modify the "Later" behavior to show again after X hours
- **Add auto-update**: Skip the prompt and auto-update after a delay

Example: Auto-update after 5 seconds:

```jsx
useEffect(() => {
  if (showPrompt) {
    const timer = setTimeout(() => {
      handleUpdate()
    }, 5000)
    return () => clearTimeout(timer)
  }
}, [showPrompt])
```

## Security Considerations

- The update system only works over HTTPS (PWA requirement)
- Service workers are restricted to same-origin
- Users always control when updates are applied
- No automatic background updates without user consent
