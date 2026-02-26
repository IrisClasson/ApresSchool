import { useState, useEffect } from 'react'
import { localDB } from '../lib/supabase'
import authService from '../lib/authService'
import MessageThread from '../components/MessageThread'
import MessageComposer from '../components/MessageComposer'
import './KidMessages.css'

function KidMessages() {
  const [messages, setMessages] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [parentUser, setParentUser] = useState(null)

  useEffect(() => {
    loadUserAndMessages()

    // Poll for new messages every 2 seconds
    const interval = setInterval(() => {
      loadMessages()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const loadUserAndMessages = async () => {
    const user = await authService.getCurrentUser()
    setCurrentUser(user)

    if (user) {
      // Get parent info
      const parentResult = await authService.getMyParent()
      if (parentResult.success && parentResult.parent) {
        setParentUser(parentResult.parent)

        // Load messages and mark as read
        loadMessages()
        localDB.markAllMessagesAsRead(user.id, user.role)
      }
    }
  }

  const loadMessages = async () => {
    const allMessages = await localDB.getMessages()
    setMessages(allMessages)
  }

  const handleSendMessage = async (messageText) => {
    if (!currentUser || !parentUser) return

    const newMessage = await localDB.addMessage({
      sender_id: currentUser.id,
      sender_role: currentUser.role,
      recipient_id: parentUser.id,
      recipient_role: 'parent',
      content: messageText
    })

    if (newMessage) {
      // Reload all messages to get the latest
      await loadMessages()
    }
  }

  // Filter messages for the parent conversation
  const filteredMessages = parentUser
    ? messages.filter(msg =>
        (msg.sender_id === currentUser?.id && msg.recipient_id === parentUser.id) ||
        (msg.sender_id === parentUser.id && msg.recipient_id === currentUser?.id)
      )
    : []

  if (!currentUser) {
    return <div>Loading...</div>
  }

  if (!parentUser) {
    return (
      <div className="kid-messages">
        <div className="messages-header">
          <h2>💬 Messages</h2>
          <p className="messages-subtitle">No parent linked yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="kid-messages">
      <div className="messages-header">
        <h2>💬 Messages</h2>
        <p className="messages-subtitle">Chat with your parent</p>
      </div>

      <MessageThread
        messages={filteredMessages}
        currentUserRole="kid"
        currentUserId={currentUser.id}
      />

      <MessageComposer
        onSend={handleSendMessage}
        placeholder="Send a message to your parent..."
      />
    </div>
  )
}

export default KidMessages
