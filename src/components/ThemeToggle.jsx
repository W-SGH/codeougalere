import React from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10 ${className}`}
    >
      <span className="material-symbols-outlined text-xl">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  )
}
