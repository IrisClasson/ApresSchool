import { useState, useEffect, useRef } from 'react'
import { localDB } from '../lib/supabase'
import authService from '../lib/authService'
import notificationService from '../lib/notificationService'
import MessageThread from '../components/MessageThread'
import MessageComposer from '../components/MessageComposer'
import './ParentMessages.css'

function ParentMessages() {
  const [messages, setMessages] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [linkedKids, setLinkedKids] = useState([])
  const [selectedKid, setSelectedKid] = useState(null)
  const previousMessageCount = useRef(0)

  useEffect(() => {
    loadUserAndMessages()

    // Request notification permission if not already granted
    if (notificationService.isSupported() && notificationService.getPermission() === 'default') {
      notificationService.requestPermission()
    }
  }, [])

  // Separate effect for polling messages
  useEffect(() => {
    if (!currentUser) return

    // Poll for new messages every 2 seconds
    const interval = setInterval(() => {
      loadMessages()
    }, 2000)

    return () => clearInterval(interval)
  }, [currentUser])

  const loadUserAndMessages = async () => {
    const user = await authService.getCurrentUser()
    setCurrentUser(user)

    if (user) {
      // Get linked kids
      const kidsResult = await authService.getMyKids()
      if (kidsResult.success && kidsResult.kids.length > 0) {
        setLinkedKids(kidsResult.kids)
        // Auto-select first kid
        setSelectedKid(kidsResult.kids[0])

        // Load messages and mark as read
        loadMessages()
        localDB.markAllMessagesAsRead(user.id, user.role)
      }
    }
  }

  const loadMessages = async () => {
    const allMessages = await localDB.getMessages()

    // Check for new messages and show notification
    if (currentUser && selectedKid && previousMessageCount.current > 0) {
      const newMessages = allMessages.filter(msg =>
        msg.sender_id === selectedKid.id &&
        msg.recipient_id === currentUser.id &&
        !messages.some(m => m.id === msg.id)
      )

      // Show notification for new messages from the kid
      // For iOS, always show in-app notification. For others, only when tab is hidden
      if (newMessages.length > 0 && (notificationService.isIOS() || document.hidden)) {
        const latestMessage = newMessages[newMessages.length - 1]
        // Get sender username if available
        const senderUsername = selectedKid?.username
        notificationService.notifyNewMessage(latestMessage, senderUsername)
      }
    }

    previousMessageCount.current = allMessages.length
    setMessages(allMessages)
  }

  const handleSendMessage = async (messageText) => {
    if (!currentUser || !selectedKid) return

    const newMessage = await localDB.addMessage({
      sender_id: currentUser.id,
      sender_role: currentUser.role,
      recipient_id: selectedKid.id,
      recipient_role: 'kid',
      content: messageText
    })

    if (newMessage) {
      // Reload all messages to get the latest
      await loadMessages()
    }
  }

  // Filter messages for the selected kid conversation
  const filteredMessages = selectedKid
    ? messages.filter(msg =>
        (msg.sender_id === currentUser?.id && msg.recipient_id === selectedKid.id) ||
        (msg.sender_id === selectedKid.id && msg.recipient_id === currentUser?.id)
      )
    : []

  if (!currentUser) {
    return <div>Loading...</div>
  }

  if (linkedKids.length === 0) {
    return (
      <div className="parent-messages">
        <div className="messages-header">
          <h2>💬 Messages</h2>
          <p className="messages-subtitle">No kids linked yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="parent-messages">
      <div className="messages-header">
        <h2>💬 Messages</h2>
        <p className="messages-subtitle">Chat with your kid about challenges and progress</p>
      </div>

      {linkedKids.length > 1 && (
        <div style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <label style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
            Chatting with:
          </label>
          <select
            value={selectedKid?.id || ''}
            onChange={(e) => {
              const kid = linkedKids.find(k => k.id === e.target.value)
              setSelectedKid(kid)
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '2px solid var(--medium-purple)',
              background: 'var(--white)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {linkedKids.map(kid => (
              <option key={kid.id} value={kid.id}>
                👤 {kid.username}
              </option>
            ))}
          </select>
        </div>
      )}

      <MessageThread
        messages={filteredMessages}
        currentUserRole="parent"
        currentUserId={currentUser.id}
      />

      <MessageComposer
        onSend={handleSendMessage}
        placeholder={`Send a message to ${selectedKid?.username || 'your kid'}...`}
      />
    </div>
  )
}

export default ParentMessages
