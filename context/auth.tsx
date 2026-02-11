import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase'

type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  isLoggedIn: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider')
  return ctx
}

type Props = {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.warn('supabase.getSession error', error)
        }

        if (!mounted) return

        setSession(currentSession ?? null)
        setUser(currentSession?.user ?? null)
        setIsLoading(false)
      } catch (err) {
        console.error('Error getting initial session', err)
        if (mounted) setIsLoading(false)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, payload) => {
      const newSession = payload.session ?? null
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => {
      mounted = false
      // unsubscribe
      if (listener && typeof listener.subscription?.unsubscribe === 'function') {
        listener.subscription.unsubscribe()
      } else if (listener && typeof listener.unsubscribe === 'function') {
        listener.unsubscribe()
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ?? null }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ?? null }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    // local state will be updated by onAuthStateChange listener
    return { error: error ?? null }
  }

  const value: AuthContextValue = {
    session,
    user,
    isLoading,
    isLoggedIn: Boolean(user),
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}