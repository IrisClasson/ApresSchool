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
  }
}
