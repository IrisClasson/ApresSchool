import { createClient } from '@supabase/supabase-js'

// For now, we'll use localStorage as a fallback if Supabase isn't configured
// You can add your Supabase credentials in a .env file later

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || null
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || null

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Local storage fallback for demo purposes
export const useLocalStorage = !supabase

// Helper functions for localStorage mode
export const localDB = {
  challenges: [],
  notifications: [],

  getChallenges() {
    const data = localStorage.getItem('challenges')
    return data ? JSON.parse(data) : []
  },

  saveChallenges(challenges) {
    localStorage.setItem('challenges', JSON.stringify(challenges))
    this.challenges = challenges
  },

  addChallenge(challenge) {
    const challenges = this.getChallenges()
    const newChallenge = {
      ...challenge,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      status: 'pending'
    }
    challenges.push(newChallenge)
    this.saveChallenges(challenges)
    return newChallenge
  },

  updateChallenge(id, updates) {
    const challenges = this.getChallenges()
    const index = challenges.findIndex(c => c.id === id)
    if (index !== -1) {
      challenges[index] = { ...challenges[index], ...updates }
      this.saveChallenges(challenges)
      return challenges[index]
    }
    return null
  },

  deleteChallenge(id) {
    const challenges = this.getChallenges()
    const filtered = challenges.filter(c => c.id !== id)
    this.saveChallenges(filtered)
  },

  getKidStats() {
    const stats = localStorage.getItem('kidStats')
    return stats ? JSON.parse(stats) : { points: 0, badges: [], streak: 0 }
  },

  updateKidStats(stats) {
    localStorage.setItem('kidStats', JSON.stringify(stats))
  },

  // Challenge Sessions (for stats dashboard)
  getSessions() {
    const data = localStorage.getItem('challengeSessions')
    return data ? JSON.parse(data) : []
  },

  saveSessions(sessions) {
    localStorage.setItem('challengeSessions', JSON.stringify(sessions))
  },

  addSession(session) {
    const sessions = this.getSessions()
    const newSession = {
      ...session,
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      feedback: session.feedback || null // { sentiment, difficulty, comment, timestamp }
    }
    sessions.push(newSession)
    this.saveSessions(sessions)
    return newSession
  },

  getSessionById(sessionId) {
    const sessions = this.getSessions()
    return sessions.find(s => s.id === sessionId) || null
  },

  updateSession(sessionId, updates) {
    const sessions = this.getSessions()
    const index = sessions.findIndex(s => s.id === sessionId)
    if (index !== -1) {
      sessions[index] = {
        ...sessions[index],
        ...updates,
        // Allow feedback to be added after session creation
        feedback: updates.feedback !== undefined ? updates.feedback : sessions[index].feedback
      }
      this.saveSessions(sessions)
      return sessions[index]
    }
    return null
  },

  // Add feedback to an existing challenge
  addFeedbackToChallenge(challengeId, feedback) {
    const challenges = this.getChallenges()
    const index = challenges.findIndex(c => c.id === challengeId)
    if (index !== -1) {
      challenges[index] = {
        ...challenges[index],
        feedback: {
          ...feedback,
          timestamp: feedback.timestamp || new Date().toISOString()
        }
      }
      this.saveChallenges(challenges)
      return challenges[index]
    }
    return null
  },

  deleteSession(sessionId) {
    const sessions = this.getSessions()
    const filtered = sessions.filter(s => s.id !== sessionId)
    this.saveSessions(filtered)
  },

  // Messages (for parent-kid communication) - using SQL
  async getMessages() {
    if (!supabase) {
      // Fallback to localStorage if Supabase not configured
      const data = localStorage.getItem('messages')
      return data ? JSON.parse(data) : []
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    return data || []
  },

  async addMessage(message) {
    if (!supabase) {
      // Fallback to localStorage
      const messages = await this.getMessages()
      const newMessage = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
        sender_id: message.sender_id,
        sender_role: message.sender_role,
        recipient_id: message.recipient_id,
        recipient_role: message.recipient_role,
        content: message.content,
        is_read: false,
        created_at: new Date().toISOString()
      }
      messages.push(newMessage)
      localStorage.setItem('messages', JSON.stringify(messages))
      return newMessage
    }

    const { data, error} = await supabase
      .from('messages')
      .insert([{
        sender_id: message.sender_id,
        sender_role: message.sender_role,
        recipient_id: message.recipient_id,
        recipient_role: message.recipient_role,
        content: message.content,
        is_read: false
      }])
      .select()
      .single()

    if (error) {
      console.error('Error adding message:', error)
      return null
    }

    return data
  },

  async markMessageAsRead(messageId) {
    if (!supabase) {
      // Fallback to localStorage
      const messages = await this.getMessages()
      const index = messages.findIndex(m => m.id === messageId)
      if (index !== -1) {
        messages[index].is_read = true
        localStorage.setItem('messages', JSON.stringify(messages))
        return messages[index]
      }
      return null
    }

    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      console.error('Error marking message as read:', error)
      return null
    }

    return data
  },

  async markAllMessagesAsRead(recipientId, recipientRole) {
    if (!supabase) {
      // Fallback to localStorage
      const messages = await this.getMessages()
      const updated = messages.map(m => {
        if (m.recipient_id === recipientId && m.recipient_role === recipientRole && !m.is_read) {
          return { ...m, is_read: true }
        }
        return m
      })
      localStorage.setItem('messages', JSON.stringify(updated))
      return
    }

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('recipient_id', recipientId)
      .eq('recipient_role', recipientRole)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking messages as read:', error)
    }
  },

  async getUnreadCount(recipientId, recipientRole) {
    if (!supabase) {
      // Fallback to localStorage
      const messages = await this.getMessages()
      return messages.filter(m =>
        m.recipient_id === recipientId &&
        m.recipient_role === recipientRole &&
        !m.is_read
      ).length
    }

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', recipientId)
      .eq('recipient_role', recipientRole)
      .eq('is_read', false)

    if (error) {
      console.error('Error getting unread count:', error)
      return 0
    }

    return count || 0
  },

  async deleteMessage(messageId) {
    if (!supabase) {
      // Fallback to localStorage
      const messages = await this.getMessages()
      const filtered = messages.filter(m => m.id !== messageId)
      localStorage.setItem('messages', JSON.stringify(filtered))
      return
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) {
      console.error('Error deleting message:', error)
    }
  },

  // Cheer Notifications (real-time cheers that pause games)
  getCheers() {
    const data = localStorage.getItem('cheerNotifications')
    return data ? JSON.parse(data) : []
  },

  saveCheers(cheers) {
    localStorage.setItem('cheerNotifications', JSON.stringify(cheers))
  },

  // Get unread cheers for recipient
  getUnreadCheers(recipientId) {
    const cheers = this.getCheers()
    return cheers.filter(c => c.recipient_id === recipientId && !c.is_read)
  },

  addCheer(cheer) {
    const cheers = this.getCheers()
    const newCheer = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      sender_id: cheer.sender_id,
      recipient_id: cheer.recipient_id,
      message: cheer.message,
      emoji: cheer.emoji || '🎉',
      is_read: false,
      created_at: new Date().toISOString()
    }
    cheers.push(newCheer)
    this.saveCheers(cheers)
    return newCheer
  },

  markCheerAsRead(cheerId) {
    const cheers = this.getCheers()
    const index = cheers.findIndex(c => c.id === cheerId)
    if (index !== -1) {
      cheers[index].is_read = true
      this.saveCheers(cheers)
      return cheers[index]
    }
    return null
  },

  markAllCheersAsRead(recipientId) {
    const cheers = this.getCheers()
    const updated = cheers.map(c => {
      if (c.recipient_id === recipientId && !c.is_read) {
        return { ...c, is_read: true }
      }
      return c
    })
    this.saveCheers(updated)
  },

  deleteCheer(cheerId) {
    const cheers = this.getCheers()
    const filtered = cheers.filter(c => c.id !== cheerId)
    this.saveCheers(filtered)
  }
}
