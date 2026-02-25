# Presence System Documentation

## Overview

The Ski Mission Control app includes a real-time presence system that tracks online/away/offline status between parents and kids.

## Features

### Status Types
- **Online** (Green 🟢): User is active in the app
- **Away** (Orange 🟡): User has been inactive for 60+ seconds
- **Offline** (Gray ⚫): User closed the app or hasn't been seen in 10+ seconds

### Automatic Status Detection
- **Online → Away**: Automatically after 60 seconds of inactivity
- **Away → Online**: Immediately when user interacts with the app
- **Visible → Away**: When app is minimized/backgrounded for 60 seconds
- **Hidden → Online**: When app returns to foreground
- **Close → Offline**: When app is closed

## Implementation

### Architecture

```
presenceService.js
├── Heartbeat (every 3 seconds)
├── Activity Detection (mouse, keyboard, touch, scroll)
├── Visibility Change Detection (tab switch, minimize)
├── Away Timer (60 seconds)
└── Polling (checks other users every 3 seconds)
```

### Key Components

**PresenceService** (`src/lib/presenceService.js`)
- Singleton service managing presence tracking
- Heartbeat mechanism (3s intervals)
- Activity event listeners
- Visibility change handlers
- localStorage-based storage with polling

**PresenceIndicator** (`src/components/PresenceIndicator.jsx`)
- UI component showing presence status
- Colored dot with pulse animation (online only)
- User name and last seen time
- Updates in real-time

## Usage

### Starting Presence Tracking

```javascript
import presenceService from './lib/presenceService'

// Start tracking for current user
presenceService.startTracking('user-123', 'parent') // or 'kid'

// Stop tracking (on logout or app close)
presenceService.stopTracking()
```

### Getting Presence Status

```javascript
// Get another user's presence
const presence = presenceService.getPresence('other-user-id')
console.log(presence.status) // 'online', 'away', or 'offline'
console.log(presence.lastSeen) // timestamp

// Get all presences
const allPresences = presenceService.getAllPresences()
```

### Subscribing to Changes

```javascript
// Subscribe to presence updates
const unsubscribe = presenceService.subscribe((presences) => {
  console.log('Presence updated:', presences)
})

// Unsubscribe when done
unsubscribe()
```

### Using the Component

```jsx
import PresenceIndicator from './components/PresenceIndicator'

function Header() {
  return (
    <PresenceIndicator
      userId="kid-1"
      userName="Sarah"
      showLabel={true}
    />
  )
}
```

## Testing

### Manual Testing

1. **Online Status**
   - Open app → Should show "Online" immediately
   - Check header → Other user's status displayed
   - Move mouse/interact → Keeps you online

2. **Away Status**
   - Stop interacting with app
   - Wait 60 seconds → Status changes to "Away"
   - Last seen shows "Away"

3. **Offline Status**
   - Close browser tab
   - Check from another tab → Shows "Offline" after ~10 seconds
   - Last seen shows time ago ("2m ago", "1h ago")

4. **Visibility Changes**
   - Switch to another tab → After 60s, status becomes "Away"
   - Return to app → Immediately returns to "Online"
   - Minimize window → After 60s, status becomes "Away"

5. **Multiple Tabs**
   - Open Parent Dashboard in one tab
   - Open Kid View in another tab
   - Watch presence indicators update in real-time

### Automated Testing

```javascript
// Test presence status changes
describe('PresenceService', () => {
  test('starts tracking with online status', () => {
    presenceService.startTracking('test-user', 'parent')
    const presence = presenceService.getPresence('test-user')
    expect(presence.status).toBe('online')
  })

  test('changes to away after 60 seconds', async () => {
    presenceService.startTracking('test-user', 'parent')
    await wait(61000) // Wait 61 seconds
    const presence = presenceService.getPresence('test-user')
    expect(presence.status).toBe('away')
  })

  test('marks as offline when stopped', () => {
    presenceService.startTracking('test-user', 'parent')
    presenceService.stopTracking()
    const presence = presenceService.getPresence('test-user')
    expect(presence.status).toBe('offline')
  })
})
```

## Performance

### Battery Optimization
- Heartbeat only runs when app is visible
- Pauses heartbeat when app is hidden
- Uses requestAnimationFrame where appropriate
- Minimal polling interval (3 seconds)

### Network Optimization
- localStorage-based (no network calls for demo)
- Ready for WebSocket/Supabase upgrade
- Batched updates (no update spam)
- Cleanup of stale presence data

### Memory Optimization
- Single service instance (singleton)
- Proper event listener cleanup
- Timer cleanup on unmount
- Garbage collection friendly

## Configuration

### Timers

```javascript
// In presenceService.js
const HEARTBEAT_INTERVAL = 3000 // 3 seconds
const AWAY_TIMEOUT = 60000 // 60 seconds
const OFFLINE_TIMEOUT = 10000 // 10 seconds
```

### Adjusting Sensitivity

**More Responsive** (faster updates, more battery):
```javascript
const HEARTBEAT_INTERVAL = 1000 // 1 second
const AWAY_TIMEOUT = 30000 // 30 seconds
```

**More Conservative** (slower updates, less battery):
```javascript
const HEARTBEAT_INTERVAL = 5000 // 5 seconds
const AWAY_TIMEOUT = 120000 // 2 minutes
```

## Upgrading to Real Backend

### Supabase Integration

```javascript
// Replace localStorage with Supabase realtime
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Subscribe to presence changes
supabase
  .channel('presence')
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    // Update UI
  })
  .subscribe()

// Track presence
channel.track({
  user_id: userId,
  status: 'online',
  last_seen: new Date()
})
```

### WebSocket Integration

```javascript
// Use WebSocket for real-time updates
const ws = new WebSocket('wss://your-server.com/presence')

ws.onopen = () => {
  // Send heartbeat
  setInterval(() => {
    ws.send(JSON.stringify({
      type: 'heartbeat',
      userId,
      status: 'online'
    }))
  }, 3000)
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // Update presence UI
}
```

## Troubleshooting

### Status Not Updating
- Check browser console for errors
- Verify localStorage is enabled
- Check that heartbeat timer is running
- Ensure app isn't in background mode

### Wrong Status Shown
- Check system clock accuracy
- Verify timeout constants
- Clear localStorage and restart
- Check for multiple tabs interfering

### High Battery Usage
- Increase `HEARTBEAT_INTERVAL`
- Reduce activity event listeners
- Disable when app in background
- Use passive event listeners

## Future Enhancements

- [ ] Push notifications for status changes
- [ ] Rich presence (custom status messages)
- [ ] Last activity type ("Playing game", "Viewing challenges")
- [ ] Presence history and analytics
- [ ] Group presence (multiple kids)
- [ ] Do Not Disturb mode

---

**Status**: ✅ Fully Implemented
**Last Updated**: 2026-02-25
**Version**: 1.0.0
