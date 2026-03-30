import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Capturé au niveau du module, en tout premier, avant que Supabase nettoie l'URL
const _isOAuthCallback =
  new URLSearchParams(window.location.search).has('code') ||
  window.location.hash.includes('access_token')

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const fetchingRef = useRef(false)
  const initializedRef = useRef(false)
  const currentUserIdRef = useRef(null)
  const oauthRedirectRef = useRef(_isOAuthCallback)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {

      if (_event === 'INITIAL_SESSION') {
        // Toujours traiter INITIAL_SESSION (chargement initial de la page)
        if (session?.user) {
          currentUserIdRef.current = session.user.id
          setUser(session.user)
          setTimeout(() => fetchProfile(session.user.id), 0)
        } else {
          // Si un redirect OAuth est en cours, attendre le SIGNED_IN
          if (oauthRedirectRef.current) return
          currentUserIdRef.current = null
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      } else if (_event === 'SIGNED_IN') {
        oauthRedirectRef.current = false
        // Ignorer si c'est le même utilisateur déjà chargé
        if (session?.user && session.user.id !== currentUserIdRef.current) {
          currentUserIdRef.current = session.user.id
          setUser(session.user)
          setTimeout(() => fetchProfile(session.user.id), 0)
        }
      } else if (_event === 'TOKEN_REFRESHED') {
        // Token rafraîchi après sommeil/inactivité — mettre à jour user et profil si nécessaire
        if (session?.user) {
          currentUserIdRef.current = session.user.id
          setUser(session.user)
          setTimeout(() => fetchProfile(session.user.id), 0)
        }
      } else if (_event === 'SIGNED_OUT') {
        currentUserIdRef.current = null
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    // Fallback si onAuthStateChange ne se déclenche pas
    const fallback = setTimeout(() => setLoading(false), 4000)

    // Détection bfcache (Chromium) : quand la page est restaurée depuis le cache
    function handlePageShow(e) {
      if (e.persisted) {
        // Page restaurée depuis le bfcache — vérifier la session réelle
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            currentUserIdRef.current = null
            setUser(null)
            setProfile(null)
            setLoading(false)
          } else if (session.user.id !== currentUserIdRef.current) {
            // Session restaurée pour un utilisateur différent ou après refresh
            currentUserIdRef.current = session.user.id
            setUser(session.user)
            fetchProfile(session.user.id)
          }
        })
      }
    }
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallback)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  async function fetchProfile(userId) {
    // Éviter les appels simultanés
    if (fetchingRef.current) {
      return
    }
    fetchingRef.current = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[Auth] fetchProfile error:', error.message, error.code)
        // PGRST116 = 406 : aucune ligne trouvée (user Google sans profil créé)
        // → créer le profil minimal pour débloquer le spinner
        if (error.code === 'PGRST116') {
          const { data: created } = await supabase
            .from('profiles')
            .upsert({ id: userId, has_access: false }, { onConflict: 'id' })
            .select()
            .single()
          if (created && currentUserIdRef.current === userId) setProfile(created)
        }
        return
      }
      // Ne pas mettre à jour si l'utilisateur s'est déconnecté entre-temps
      if (data && currentUserIdRef.current === userId) setProfile(data)
    } catch (err) {
      console.error('[Auth] fetchProfile erreur:', err.message)
    } finally {
      fetchingRef.current = false
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp(email, password, firstName, lastName, phone = '', extraFields = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName }
      }
    })
    if (error) throw error
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        has_access: false,
        address: extraFields.address || null,
        address_complement: extraFields.addressComplement || null,
        city: extraFields.city || null,
        postal_code: extraFields.postalCode || null,
        birth_date: extraFields.birthDate || null,
        contract_accepted_at: extraFields.contractAcceptedAt || null,
      })
    }
    return data
  }

  async function signInWithGoogle(redirectTo = `${window.location.origin}/dashboard`) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    })
    if (error) throw error
  }

  async function signOut() {
    // Supprimer les tokens avant signOut pour éviter toute restauration de session
    Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k))
    Object.keys(sessionStorage).filter(k => k.startsWith('sb-')).forEach(k => sessionStorage.removeItem(k))
    await supabase.auth.signOut({ scope: 'global' }).catch(() => {})
    // Rechargement complet pour garantir un état propre
    window.location.href = '/'
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) throw error
  }

  const hasAccess = profile?.has_access === true
  const isAdmin = profile?.is_admin === true

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      hasAccess,
      isAdmin,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword,
      refreshProfile: async () => {
        if (!user) return
        try {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
          if (data && currentUserIdRef.current === user.id) setProfile(data)
        } catch (e) {}
      }
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
