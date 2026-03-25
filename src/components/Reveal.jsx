import React from 'react'
import { useInView } from '../hooks/useInView'

/**
 * Wrapper léger pour animer les éléments à l'entrée dans le viewport.
 * @param {string} animation - 'fadeInUp' | 'fadeIn' | 'scaleIn'
 * @param {number} delay - délai en ms (pour les animations décalées)
 */
export default function Reveal({ children, animation = 'fadeInUp', delay = 0, className = '' }) {
  const [ref, inView] = useInView()

  return (
    <div
      ref={ref}
      className={`reveal-${animation} ${inView ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}
