import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function ConsentNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  function refuse() {
    localStorage.setItem('cookie_consent', 'refused')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-accent border-t border-slate-200 dark:border-white/10 shadow-lg px-4 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-slate-600 dark:text-slate-300 text-sm flex-1 leading-relaxed">
          Ce site utilise des cookies strictement nécessaires à son fonctionnement (authentification, paiement). Aucun cookie publicitaire n'est utilisé.{' '}
          <Link to="/politique-de-confidentialite" className="text-primary hover:underline">En savoir plus</Link>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={refuse}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-lg bg-primary text-black text-sm font-bold hover:bg-primary-dark transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
