import { useState, useEffect } from 'react'
import { localDB } from '../lib/supabase'
import MessageThread from '../components/MessageThread'
import MessageComposer from '../components/MessageComposer'
import './KidMessages.css'

function KidMessages() {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    loadMessages()
    // Mark all messages to kid as read
    localDB.markAllMessagesAsRead('kid-1', 'kid')
  }, [])

  const loadMessages = () => {
    const allMessages = localDB.getMessages()
    setMessages(allMessages)
  }

  const handleSendMessage = (messageText) => {
    const newMessage = localDB.addMessage({
      sender_id: 'kid-1',
      sender_role: 'kid',
      recipient_id: 'parent-1',
      recipient_role: 'parent',
      content: messageText
    })

    setMessages([...messages, newMessage])
  }

  return (
    <div className="kid-messages">
      <div className="messages-header">
        <h2>💬 Messages</h2>
        <p className="messages-subtitle">Chat with your parent</p>
      </div>

      <MessageThread
        messages={messages}
        currentUserRole="kid"
      />

      <MessageComposer
        onSend={handleSendMessage}
        placeholder="Send a message to your parent..."
      />
    </div>
  )
}

export default KidMessages
