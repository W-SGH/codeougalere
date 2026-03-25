import React, { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export function ProtectedRoute({ children, requireAccess = false, requireAdmin = false }) {
  const { user, profile, hasAccess, isAdmin, loading } = useAuth()
  const location = useLocation()
  const [dbAccess, setDbAccess] = useState(null)
  const checkedRef = useRef(false)

  useEffect(() => {
    checkedRef.current = false
    setDbAccess(null)
  }, [user?.id])

  useEffect(() => {
    if (loading || !user || !requireAccess || hasAccess || isAdmin) return
    if (checkedRef.current) return
    checkedRef.current = true

    supabase
      .from('profiles')
      .select('has_access')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setDbAccess(data?.has_access === true))
      .catch(() => setDbAccess(false))
  }, [loading, user, hasAccess])

  const isChecking = requireAccess && !hasAccess && !isAdmin && user && dbAccess === null

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Rediriger vers l'onboarding si le profil est incomplet (connexion Google)
  if (profile !== null && !profile?.first_name) {
    return <Navigate to="/onboarding" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (requireAccess && !hasAccess && !isAdmin && dbAccess !== true) {
    return <Navigate to="/tarifs" state={{ message: "Vous devez avoir un accès payant pour voir ce contenu." }} replace />
  }

  return children
}
