# Push Notifications Implementation

## Current Implementation: Cross-Tab Notifications ✅

The app currently uses **BroadcastChannel API** for notifications that work across tabs/windows on the same device.

### How It Works:
1. When a parent creates a challenge or sends a message in one tab
2. All other tabs (including kid's tabs) receive the notification via BroadcastChannel
3. Browser shows native notification if the recipient has granted permission
4. Works great for **same-device**, **multi-tab** usage

### Features:
- ✅ Cross-tab communication (parent tab → kid tab)
- ✅ Browser native notifications with icons
- ✅ Click-to-navigate functionality
- ✅ Works offline with service worker
- ✅ No server needed
- ✅ Zero cost

### Limitations:
- ❌ Doesn't work across different devices
- ❌ Doesn't work when app is closed
- ❌ Only works within same browser/device

---

## Future Implementation: Full Web Push (Cross-Device)

For **real cross-device push notifications** (e.g., parent on phone → kid on tablet), you'll need to complete the following steps:

### Prerequisites:
1. **Supabase Setup** (You already have this!)
2. **VAPID Keys** (Already generated and in `.env`)
3. **Database Migration** (Already created: `supabase/migrations/003_push_subscriptions.sql`)
4. **Edge Function** (Already created: `supabase/functions/send-push-notification/index.ts`)

### Steps to Enable Full Web Push:

#### 1. Run Database Migration
```bash
# If using Supabase CLI
supabase db push

# Or run the SQL manually in Supabase dashboard:
# Copy contents of supabase/migrations/003_push_subscriptions.sql
# and run in SQL Editor
```

#### 2. Deploy Edge Function
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Set environment variables
supabase secrets set VAPID_PUBLIC_KEY="BNNTssLVnCtBG7Ww7sn0ThqTWkxhSUyPWpSmkbpGoXLieYoEcpCk36Qdc5B38CxUr5_pYJUVzwomWOQLY49PPHw"
supabase secrets set VAPID_PRIVATE_KEY="pH4CjfEjsIMQ_RLIocwc3SoivfJSgHVlriQVBGgNo00"

# Deploy the function
supabase functions deploy send-push-notification
```

#### 3. Update Notification Service

Replace `src/lib/notificationService.js` with the full implementation that includes:
- Push subscription management
- Supabase database storage of subscriptions
- Calling the Edge Function to send cross-device pushes

#### 4. Update Service Worker

Add push subscription code to `public/service-worker.js`:
```javascript
// Subscribe to push notifications
self.addEventListener('activate', async (event) => {
  const subscription = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  })

  // Save subscription to Supabase
  await saveSubscription(subscription)
})
```

### Architecture:

```
Parent's Phone                    Supabase Cloud                     Kid's Tablet
     │                                  │                                  │
     │ 1. Create Challenge              │                                  │
     ├─────────────────────────────────>│                                  │
     │                                   │                                  │
     │ 2. Call Edge Function             │                                  │
     │    (send-push-notification)       │                                  │
     ├──────────────────────────────────>│                                  │
     │                                   │                                  │
     │                                   │ 3. Fetch kid's push subscription │
     │                                   │    from database                 │
     │                                   │                                  │
     │                                   │ 4. Send push notification        │
     │                                   │    via Web Push Protocol         │
     │                                   ├─────────────────────────────────>│
     │                                   │                                  │
     │                                   │                            5. Show
     │                                   │                            Notification
```

### Cost Considerations:

- **BroadcastChannel (Current)**: FREE, but same-device only
- **Web Push (Full)**: FREE for push delivery, but requires:
  - Supabase Edge Functions (generous free tier: 500k requests/month)
  - Database storage for subscriptions (negligible)

### Testing Full Web Push:

1. Open parent view in Chrome on your computer
2. Open kid view in Chrome on your phone (or different browser/device)
3. Grant notification permissions on both devices
4. Create a challenge from parent device
5. Kid's device should receive a push notification even if app is closed!

---

## Current vs. Full Implementation Comparison:

| Feature | BroadcastChannel (Current) | Full Web Push |
|---------|----------------------------|---------------|
| Cross-tab notifications | ✅ | ✅ |
| Cross-device notifications | ❌ | ✅ |
| Works when app is closed | ❌ | ✅ |
| Requires server | ❌ | ✅ |
| Setup complexity | Easy | Moderate |
| Cost | Free | Free (with limits) |

---

## Browser Support:

- **BroadcastChannel**: Chrome, Firefox, Edge, Safari 15.4+
- **Web Push**: Chrome, Firefox, Edge, Safari 16.4+ (iOS)

---

## Recommendation:

**For now**: The current BroadcastChannel implementation is perfect for:
- Testing the app
- Single-device usage with multiple tabs
- Development and prototyping

**Upgrade to Full Web Push when**:
- You have actual users on different devices
- You need notifications when app is closed
- You're ready to deploy to production

The infrastructure is already in place - you just need to run the migrations and deploy the Edge Function!
