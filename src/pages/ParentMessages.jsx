import { useState, useEffect } from 'react'
import { localDB } from '../lib/supabase'
import MessageThread from '../components/MessageThread'
import MessageComposer from '../components/MessageComposer'
import './ParentMessages.css'

function ParentMessages() {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    loadMessages()
    // Mark all messages to parent as read
    localDB.markAllMessagesAsRead('parent-1', 'parent')
  }, [])

  const loadMessages = () => {
    const allMessages = localDB.getMessages()
    setMessages(allMessages)
  }

  const handleSendMessage = (messageText) => {
    const newMessage = localDB.addMessage({
      sender_id: 'parent-1',
      sender_role: 'parent',
      recipient_id: 'kid-1',
      recipient_role: 'kid',
      content: messageText
    })

    setMessages([...messages, newMessage])
  }

  return (
    <div className="parent-messages">
      <div className="messages-header">
        <h2>💬 Messages</h2>
        <p className="messages-subtitle">Chat with your kid about challenges and progress</p>
      </div>

      <MessageThread
        messages={messages}
        currentUserRole="parent"
      />

      <MessageComposer
        onSend={handleSendMessage}
        placeholder="Send a message to your kid..."
      />
    </div>
  )
}

export default ParentMessages
