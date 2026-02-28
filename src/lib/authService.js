// Authentication service using Supabase database
// Provides secure password hashing using PBKDF2 (Web Crypto API)

import { supabase } from './supabase'

const authService = {
  // Hash password using PBKDF2 (secure browser-based hashing)
  async hashPassword(password, salt = null) {
    const encoder = new TextEncoder()

    // Generate or use provided salt
    const saltBuffer = salt
      ? Uint8Array.from(atob(salt), c => c.charCodeAt(0))
      : crypto.getRandomValues(new Uint8Array(16))

    // Import password as key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )

    // Derive hash using PBKDF2
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    )

    // Convert to base64 strings
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray))
    const saltBase64 = btoa(String.fromCharCode.apply(null, Array.from(saltBuffer)))

    return `${saltBase64}:${hashBase64}`
  },

  // Verify password against hash
  async verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':')
    const computedHash = await this.hashPassword(password, salt)
    return computedHash === storedHash
  },

  // Generate a unique parent code
  generateParentCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude similar looking characters
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  },

  // Register a new user
  async register(username, password, role, parentCode = null) {
    try {
      // Validate inputs
      if (!username || username.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters' }
      }

      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' }
      }

      if (role !== 'parent' && role !== 'kid') {
        return { success: false, error: 'Invalid role' }
      }

      // If registering as kid, validate parent code
      let parentId = null
      if (role === 'kid') {
        if (!parentCode) {
          return { success: false, error: 'Parent code is required for kids' }
        }

        // Find parent by code
        const { data: parent } = await supabase
          .from('users')
          .select('id')
          .eq('parent_code', parentCode.toUpperCase())
          .eq('role', 'parent')
          .single()

        if (!parent) {
          return { success: false, error: 'Invalid parent code' }
        }

        parentId = parent.id
      }

      // Check if username already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .single()

      if (existing) {
        return { success: false, error: 'Username already taken' }
      }

      // Hash password
      const passwordHash = await this.hashPassword(password)

      // Generate parent code for parents
      const newParentCode = role === 'parent' ? this.generateParentCode() : null

      // Insert user
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username: username.toLowerCase(),
            password_hash: passwordHash,
            role,
            parent_code: newParentCode,
            parent_id: parentId,
            language: 'en' // Default language
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Registration error:', error)
        return { success: false, error: 'Registration failed' }
      }

      // Auto-login after registration
      this.setCurrentUser({
        id: data.id,
        username: data.username,
        role: data.role,
        language: data.language || 'en'
      })

      return {
        success: true,
        user: {
          id: data.id,
          username: data.username,
          role: data.role,
          language: data.language || 'en'
        },
        parentCode: newParentCode // Return parent code for new parents
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Login user
  async login(username, password, role) {
    try {
      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.toLowerCase())
        .eq('role', role)
        .single()

      if (error || !user) {
        return { success: false, error: 'Invalid username, password, or role' }
      }

      // Verify password
      const isValid = await this.verifyPassword(password, user.password_hash)

      if (!isValid) {
        return { success: false, error: 'Invalid username, password, or role' }
      }

      // Set current user session
      this.setCurrentUser({
        id: user.id,
        username: user.username,
        role: user.role,
        language: user.language || 'en'
      })

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          language: user.language || 'en'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Set current user session in localStorage
  setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  },

  // Get current user session
  async getCurrentUser() {
    const session = localStorage.getItem('currentUser')
    return session ? JSON.parse(session) : null
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const user = await this.getCurrentUser()
    return user !== null
  },

  // Logout
  async logout() {
    try {
      localStorage.removeItem('currentUser')
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Get user role
  async getUserRole() {
    const user = await this.getCurrentUser()
    return user ? user.role : null
  },

  // Mock auth state change listener for compatibility
  onAuthStateChange(callback) {
    // Return a mock subscription object
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  },

  // Get parent code for current user (parents only)
  // If parent doesn't have a code yet, generate one
  async getMyParentCode() {
    try {
      const user = await this.getCurrentUser()
      if (!user || user.role !== 'parent') {
        return { success: false, error: 'Not a parent' }
      }

      const { data, error } = await supabase
        .from('users')
        .select('parent_code')
        .eq('id', user.id)
        .single()

      if (error) {
        return { success: false, error: 'Failed to get parent code' }
      }

      // If parent code is null, generate one
      if (!data.parent_code) {
        const newCode = this.generateParentCode()

        // Update database with new code
        const { error: updateError } = await supabase
          .from('users')
          .update({ parent_code: newCode })
          .eq('id', user.id)

        if (updateError) {
          console.error('Failed to generate parent code:', updateError)
          return { success: false, error: 'Failed to generate parent code' }
        }

        return { success: true, parentCode: newCode }
      }

      return { success: true, parentCode: data.parent_code }
    } catch (error) {
      console.error('Get parent code error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Get list of kids linked to current parent
  async getMyKids() {
    try {
      const user = await this.getCurrentUser()
      if (!user || user.role !== 'parent') {
        return { success: false, error: 'Not a parent' }
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, username, created_at')
        .eq('parent_id', user.id)
        .eq('role', 'kid')
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: 'Failed to get kids' }
      }

      return { success: true, kids: data || [] }
    } catch (error) {
      console.error('Get kids error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Get parent info for current kid user
  async getMyParent() {
    try {
      const user = await this.getCurrentUser()
      if (!user || user.role !== 'kid') {
        return { success: false, error: 'Not a kid' }
      }

      // First get the kid's parent_id
      const { data: kidData, error: kidError } = await supabase
        .from('users')
        .select('parent_id')
        .eq('id', user.id)
        .single()

      if (kidError || !kidData || !kidData.parent_id) {
        return { success: false, error: 'No parent linked', parent: null }
      }

      // Then get the parent's info
      const { data: parentData, error: parentError } = await supabase
        .from('users')
        .select('id, username, created_at')
        .eq('id', kidData.parent_id)
        .eq('role', 'parent')
        .single()

      if (parentError || !parentData) {
        return { success: false, error: 'Failed to get parent info', parent: null }
      }

      return { success: true, parent: parentData }
    } catch (error) {
      console.error('Get parent error:', error)
      return { success: false, error: 'An unexpected error occurred', parent: null }
    }
  },

  // Update user's language preference
  async updateLanguagePreference(language) {
    try {
      const user = await this.getCurrentUser()
      if (!user) {
        return { success: false, error: 'Not authenticated' }
      }

      // Update database
      const { error } = await supabase
        .from('users')
        .update({ language })
        .eq('id', user.id)

      if (error) {
        console.error('Update language error:', error)
        return { success: false, error: 'Failed to update language' }
      }

      // Update current user session
      user.language = language
      this.setCurrentUser(user)

      return { success: true }
    } catch (error) {
      console.error('Update language error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Link current kid user to a parent using parent code
  async linkToParent(parentCode) {
    try {
      const user = await this.getCurrentUser()
      if (!user || user.role !== 'kid') {
        return { success: false, error: 'Not a kid account' }
      }

      if (!parentCode || parentCode.length !== 6) {
        return { success: false, error: 'Invalid parent code' }
      }

      // Find parent by code
      const { data: parent, error: parentError } = await supabase
        .from('users')
        .select('id')
        .eq('parent_code', parentCode.toUpperCase())
        .eq('role', 'parent')
        .single()

      if (parentError || !parent) {
        return { success: false, error: 'Invalid parent code' }
      }

      // Update kid's parent_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ parent_id: parent.id })
        .eq('id', user.id)

      if (updateError) {
        console.error('Link parent error:', updateError)
        return { success: false, error: 'Failed to link to parent' }
      }

      return { success: true }
    } catch (error) {
      console.error('Link parent error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Check if current kid user is linked to a parent
  async hasParent() {
    try {
      const user = await this.getCurrentUser()
      if (!user || user.role !== 'kid') {
        return { success: false, hasParent: false }
      }

      const { data, error } = await supabase
        .from('users')
        .select('parent_id')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Check parent error:', error)
        return { success: false, hasParent: false }
      }

      return { success: true, hasParent: !!data.parent_id }
    } catch (error) {
      console.error('Check parent error:', error)
      return { success: false, hasParent: false }
    }
  },

  // Get user by ID (for looking up usernames in messages)
  async getUserById(userId) {
    if (!supabase) {
      console.error('Supabase not initialized')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user by ID:', error)
      return null
    }
  }
}

export default authService
