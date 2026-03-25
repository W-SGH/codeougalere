import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

const TIKTOK_VIDEO_ID = '7618313956557442326'

export default function DemoModal({ onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative bg-slate-900 shadow-2xl w-full flex flex-col rounded-none h-[100dvh] sm:rounded-2xl sm:max-w-sm sm:h-auto sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Aperçu</p>
            <h2 className="text-base font-black text-white">Code ou Galère</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center shrink-0"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Lecteur TikTok + CTA superposé */}
        <div className="relative flex-1 min-h-0 bg-black">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.tiktok.com/embed/v2/${TIKTOK_VIDEO_ID}`}
            allowFullScreen
            scrolling="no"
            allow="encrypted-media"
          />
          {/* CTA flottant en bas */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-3 justify-between bg-gradient-to-t from-black/80 to-transparent">
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">Prêt à te lancer ?</p>
              <p className="text-white/60 text-xs">7 thèmes · 14 vidéos · 70+ questions</p>
            </div>
            <Link
              to="/tarifs"
              onClick={onClose}
              className="shrink-0 bg-primary text-black px-4 py-2 rounded-xl text-sm font-black hover:bg-primary-dark transition-colors"
            >
              Commencer — 49€
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
