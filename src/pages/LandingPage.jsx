import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Reveal from '../components/Reveal';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const { user, hasAccess, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const testimonialsRef = useRef({ dragging: false, dragStartX: 0 });

  const testimonialImgs = [
    'WhatsApp Image 2026-03-18 at 18.16.00.jpeg',
    'WhatsApp Image 2026-03-18 at 18.16.00 (1).jpeg',
    'WhatsApp Image 2026-03-18 at 18.16.01.jpeg',
    'WhatsApp Image 2026-03-18 at 18.16.01 (1).jpeg',
    'WhatsApp Image 2026-03-18 at 18.20.47.jpeg',
    'WhatsApp Image 2026-03-18 at 18.22.10.jpeg',
    'WhatsApp Image 2026-03-18 at 18.28.14.jpeg',
    'Image.jpeg',
  ];

  const lightboxPrev = useCallback(() => setLightboxIndex(i => (i - 1 + testimonialImgs.length) % testimonialImgs.length), []);
  const lightboxNext = useCallback(() => setLightboxIndex(i => (i + 1) % testimonialImgs.length), []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e) {
      if (e.key === 'ArrowLeft') lightboxPrev();
      else if (e.key === 'ArrowRight') lightboxNext();
      else if (e.key === 'Escape') setLightboxIndex(null);
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, lightboxPrev, lightboxNext]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <>
      {/* Bandeau campagne de lancement */}
      {!hasAccess && (
        <div className="bg-primary text-black text-center text-xs sm:text-sm font-bold py-2.5 px-4 flex items-center justify-center gap-2 flex-wrap">
          <span>⚡ Offre de lancement — Les 50 premiers inscrits bénéficient de <strong>−30%</strong></span>
          <Link to="/preinscription" className="underline underline-offset-2 hover:no-underline whitespace-nowrap">
            Réserver ma place →
          </Link>
        </div>
      )}
      <nav className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 border-b-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-primary"><span className="material-symbols-outlined">directions_car</span></span>
              <span className="text-xl font-bold tracking-tight">Code ou galère <span className="text-primary"><span className="material-symbols-outlined">directions_car</span></span></span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <ThemeToggle />
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">Admin</Link>
                  )}
                  <Link to="/dashboard" className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all">Mon espace</Link>
                  <button onClick={handleSignOut} className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">Déconnexion</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all">Connexion</Link>
                  <Link to="/tarifs" className="bg-primary text-black px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">S'inscrire</Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 md:hidden">
              <ThemeToggle />
              <button className="p-1" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Menu">
                <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background-light dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 px-4 py-4 flex flex-col gap-3">
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition-colors py-2">Admin</Link>
                  )}
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 text-slate-900 px-4 py-3 rounded-lg text-sm font-bold text-center">Mon espace</Link>
                  <button onClick={handleSignOut} className="text-sm font-medium text-red-500 py-2 text-left">Déconnexion</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 text-slate-900 px-4 py-3 rounded-lg text-sm font-bold text-center">Connexion</Link>
                  <Link to="/tarifs" onClick={() => setMobileMenuOpen(false)} className="bg-primary text-black px-4 py-3 rounded-lg text-sm font-bold text-center">S'inscrire</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <header className="relative overflow-hidden pt-8 pb-12 lg:pt-20 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10">

            {/* Texte gauche */}
            <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
              <Reveal animation="fadeInUp" delay={0}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold mb-4 border border-slate-200">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  La méthode qui fait réussir
                </div>
              </Reveal>
              <Reveal animation="fadeInUp" delay={80}>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4">Code <span className="text-slate-900 dark:text-white border-b-4 border-primary">Express</span></h1>
              </Reveal>
              <Reveal animation="fadeInUp" delay={160}>
                <p className="text-base text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto lg:mx-0">
                  112 leçons vidéo commentées, organisées en 8 thèmes officiels du code — signalisation, priorités, vitesse, dépassement, alcool et plus — avec un quiz d'entraînement à la fin de chaque thème.
                </p>
              </Reveal>
              <Reveal animation="fadeInUp" delay={220}>
                <video
                  src="/presentation.mp4"
                  controls
                  playsInline
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
                />
              </Reveal>
            </div>

            {/* Carte paiement droite */}
            <Reveal animation="fadeIn" delay={200} className="w-full lg:w-auto lg:min-w-[360px] order-1 lg:order-2">
              {hasAccess ? (
                <div className="bg-primary p-8 rounded-2xl flex flex-col shadow-2xl text-black max-w-sm mx-auto">
                  <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-black text-2xl">school</span>
                  </div>
                  <h3 className="text-xl font-black mb-2">Tu as déjà accès !</h3>
                  <p className="text-sm text-black/70 mb-6">Continue tes révisions depuis ton espace personnel.</p>
                  <Link to="/dashboard" className="w-full py-4 rounded-xl bg-black text-white text-center text-lg font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-black/20 block">
                    Accéder à mes cours
                  </Link>
                </div>
              ) : (
                <div className="bg-primary p-8 rounded-2xl flex flex-col shadow-2xl text-black max-w-sm mx-auto">
                  <div className="bg-black/10 text-[10px] font-bold uppercase py-1 px-3 rounded-full self-start mb-4">Accès Illimité</div>
                  <h3 className="text-xl font-bold mb-2">Pack Vidéo Intégral</h3>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black">49€</span>
                    <span className="text-xs font-bold text-black/70">/accès à vie</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1 text-sm font-medium">
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-base">check</span> 112 leçons vidéo · +2h30 de contenu</li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-base">check</span> Quiz d'entraînement après chaque thème</li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-base">check</span> Signalisation, priorités, alcool, dépassement…</li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-base">check</span> Accès à vie · mobile, tablette, ordi</li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-base">check</span>
                      <span>Accès inclus</span>
                      <img src="/logo-prepacode.webp" alt="Prépa Code" className="h-5 object-contain" />
                    </li>
                  </ul>
                  <Link to="/tarifs" className="w-full py-4 rounded-xl bg-black text-white text-center text-lg font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-black/20 block">Commencer la formation</Link>
                  <Link to="/preinscription" className="w-full mt-3 py-3 rounded-xl border-2 border-black/20 text-black text-center text-sm font-bold hover:border-black hover:bg-black/5 transition-colors block">⚡ Offre de lancement −30% →</Link>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    {/* Stripe */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="20" viewBox="0 0 46 20" fill="none"><path d="M45.117 10.22c0-3.387-1.64-6.06-4.773-6.06-3.147 0-5.048 2.673-5.048 6.035 0 3.983 2.25 5.994 5.48 5.994 1.576 0 2.765-.357 3.666-.861v-2.647c-.9.45-1.933.728-3.245.728-1.285 0-2.422-.451-2.568-2.014h6.475c0-.172.013-.86.013-1.175zm-6.54-1.257c0-1.496.916-2.12 1.75-2.12.808 0 1.67.624 1.67 2.12h-3.42zM30.97 4.16c-1.298 0-2.132.61-2.596 1.034l-.172-.82h-2.912v15.62l3.307-.703.013-3.786c.477.345 1.178.833 2.343.833 2.37 0 4.53-1.906 4.53-6.1-.013-3.84-2.2-6.078-4.513-6.078zm-.794 9.368c-.781 0-1.245-.278-1.563-.623l-.013-4.913c.344-.384.82-.649 1.576-.649 1.205 0 2.04 1.35 2.04 3.074 0 1.762-.821 3.111-2.04 3.111zM23.24.649L19.92 1.365v2.674l3.32-.717V.649zM19.92 4.346h3.32v11.6h-3.32V4.346zM16.36 5.327l-.212-.981H13.29v11.6h3.307V8.291c.781-1.02 2.106-.834 2.516-.69V4.346c-.424-.159-1.975-.45-2.752.981zM9.977 1.577L6.75 2.267 6.737 12.69c0 2.12 1.59 3.68 3.707 3.68 1.178 0 2.04-.212 2.516-.477v-2.686c-.463.186-2.74.849-2.74-1.271V7.072h2.74V4.346H10.24l-.263-2.77zM3.32 6.97c0-.517.424-.717 1.126-.717 1.005 0 2.277.305 3.282.849V4.053A8.72 8.72 0 0 0 4.446 3.6C1.788 3.6 0 4.993 0 7.138c0 3.31 4.553 2.78 4.553 4.21 0 .61-.53.81-1.271.81-1.099 0-2.503-.451-3.614-1.062v3.1c1.231.53 2.476.756 3.614.756 2.728 0 4.6-1.35 4.6-3.52C7.882 7.985 3.32 8.648 3.32 6.97z" fill="#000"/></svg>
                    {/* Apple Pay */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="20" viewBox="0 0 50 20" fill="none"><path d="M9.17 2.56c-.5.59-1.3 1.05-2.1.98-.1-.8.29-1.65.75-2.18C8.32.77 9.2.35 9.9.32c.09.83-.24 1.65-.73 2.24zm.72 1.15c-1.16-.07-2.15.66-2.7.66-.56 0-1.4-.63-2.32-.61-1.19.02-2.3.69-2.9 1.76-1.24 2.14-.33 5.31.88 7.05.59.86 1.29 1.81 2.22 1.78.88-.03 1.22-.57 2.28-.57 1.07 0 1.37.57 2.3.55.96-.02 1.56-.86 2.15-1.72.67-.98.95-1.93.97-1.98-.02-.01-1.86-.72-1.88-2.84-.02-1.78 1.45-2.63 1.52-2.68-.83-1.23-2.13-1.37-2.52-1.4zm6.54-2.35v13.1h2.03V10.7h2.81c2.57 0 4.37-1.76 4.37-4.32 0-2.56-1.77-4.3-4.3-4.3h-4.91zm2.03 1.71h2.34c1.76 0 2.77.94 2.77 2.6 0 1.66-1.01 2.61-2.78 2.61h-2.33V3.07zm10.46 11.47c1.27 0 2.45-.64 2.99-1.66h.04v1.56h1.88V8.1c0-1.89-1.51-3.11-3.83-3.11-2.16 0-3.75 1.24-3.81 2.94h1.83c.15-.81.9-1.34 1.93-1.34 1.25 0 1.94.58 1.94 1.65v.72l-2.54.15c-2.36.14-3.63 1.11-3.63 2.79 0 1.7 1.31 2.84 3.2 2.84zm.55-1.55c-1.09 0-1.78-.52-1.78-1.33 0-.83.67-1.31 1.94-1.39l2.26-.14v.74c0 1.24-1.05 2.12-2.42 2.12zm7.32 4.97c1.98 0 2.91-.76 3.73-3.04l3.57-10.02h-2.07l-2.39 7.73h-.04l-2.39-7.73h-2.13l3.45 9.54-.18.58c-.31.97-.8 1.34-1.69 1.34-.16 0-.46-.02-.59-.04v1.58c.12.04.55.06.73.06z" fill="#000"/></svg>
                  </div>
                </div>
              )}
            </Reveal>

          </div>
        </div>
      </header>

      {/* Programme */}
      <section className="py-16 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal animation="fadeInUp">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold mb-4 border border-primary/20">
                <span className="material-symbols-outlined text-xs">menu_book</span>
                Programme complet
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2">8 thèmes · 112 leçons · 7 quiz</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tout le programme officiel du code de la route — plus de 2h30 de vidéo commentée.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: 0, label: "Introduction",                      icon: "play_circle",  lessons: 1,  quiz: false, topics: ["Présentation de la méthode", "Déroulement de la formation"] },
              { num: 1, label: "La signalisation",                  icon: "signpost",     lessons: 16, quiz: true,  topics: ["Panneaux danger, interdiction, obligation", "Marquages au sol, ligne continue et mixte", "Cartouches, balises, panonceaux"] },
              { num: 2, label: "Intersections & priorités",         icon: "fork_right",   lessons: 8,  quiz: true,  topics: ["Priorité à droite & giratoires", "Feux tricolores : tous les cas", "Feu en panne, feu de travaux"] },
              { num: 3, label: "Vitesse & stationnement",           icon: "speed",        lessons: 15, quiz: true,  topics: ["Limitations selon le type de route", "Zone 30, zone de rencontre", "Stationnement alterné semi-mensuel"] },
              { num: 4, label: "Croisement & dépassement",          icon: "swap_horiz",   lessons: 21, quiz: true,  topics: ["Règles de croisement en côte", "Interdictions et conditions de dépassement", "Distance latérale cyclistes (1 m / 1,5 m)"] },
              { num: 5, label: "Le conducteur",                     icon: "person",       lessons: 15, quiz: true,  topics: ["Taux d'alcool légaux & sanctions", "Distance d'arrêt & temps de réaction", "Médicaments, vision, fatigue"] },
              { num: 6, label: "Conditions de conduite",            icon: "cloud",        lessons: 14, quiz: true,  topics: ["Feux selon la météo (brouillard, neige)", "Passages à niveau & tunnels", "Véhicules prioritaires & écoconduite"] },
              { num: 7, label: "Réglementation & véhicule",         icon: "description",  lessons: 16, quiz: true,  topics: ["Documents obligatoires & assurance", "Ceinture, siège enfant, PAS", "Pneus, batterie, liquides"] },
              { num: 8, label: "Entraînement — séries de questions",icon: "quiz",         lessons: 7,  quiz: false, topics: ["Séries type examen commentées", "Analyse de situations complexes", "Repérage des pièges classiques"] },
            ].map((t, i) => (
              <Reveal key={i} animation="fadeInUp" delay={i * 40}>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">{t.icon}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        {t.num === 0 ? 'Intro' : `Thème ${t.num}`}
                      </span>
                    </div>
                    {t.quiz && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">+ quiz</span>}
                  </div>
                  <h3 className="font-black text-sm mb-1">{t.label}</h3>
                  <p className="text-xs text-slate-400 mb-3">{t.lessons} leçon{t.lessons > 1 ? 's' : ''}</p>
                  <ul className="space-y-1.5">
                    {t.topics.map((topic, j) => (
                      <li key={j} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                        <span className="text-primary leading-4 shrink-0">›</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Avis Google */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal animation="fadeInUp">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {/* Logo Google SVG */}
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Avis Google</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xl">★</span>)}
                  </div>
                  <span className="text-2xl font-black">5,0</span>
                  <span className="text-sm text-slate-500">· 5 avis</span>
                </div>
              </div>
              <a
                href="https://maps.app.goo.gl/qUsxMKm5cC5M4fuk6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold hover:border-primary transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Voir tous les avis
              </a>
            </div>
          </Reveal>

          <div className="flex overflow-x-auto gap-4 pt-2 pb-4 no-scrollbar -mx-4 px-4 snap-x">
            {[
              {
                name: 'Saliha', initial: 'S', color: 'bg-red-400', badge: 'Local Guide',
                text: "Je n'ai pas passée mon permis dans cette auto école mais j'ai suivie beaucoup de vidéos que le moniteur a posté sur TikTok (conseils, parcours examens etc...) ce qui m'a permis de l'avoir du premier coup 🫰 merci pour tous les conseils !",
                date: 'août 2025'
              },
              {
                name: 'Emma Neveu', initial: 'E', color: 'bg-purple-500',
                text: "super vidéo qui m'ont bien aidé pour le code !",
                date: 'janvier 2026'
              },
              {
                name: 'Osato Destiny', initial: 'O', color: 'bg-pink-400',
                text: "Vos vidéos m'ont beaucoup aidée à réussir mon examen, merci infiniment 🙏🙏🙏🙏🙏🙏🙏",
                date: 'décembre 2025'
              },
              {
                name: 'Mahamed Traore', initial: 'M', color: 'bg-slate-500',
                text: "Grâce à ses vidéos que je vois sur les réseaux, très bon gars, fais-lui confiance et vous aurez votre permis.",
                date: 'août 2025'
              },
              {
                name: 'Yasser Kehouadji', initial: 'Y', color: 'bg-violet-500',
                text: "Un grand merci à Bhs Permis ! Grâce à ses vidéos super claires et bien foutues, j'ai décroché mon code de la route avec 39/40 en seulement 2 semaines ! Je recommande à fond ! 🔥",
                date: 'juillet 2025'
              },
            ].map((review, i) => (
              <Reveal key={i} animation="scaleIn" delay={i * 80} className="min-w-[85%] sm:min-w-[320px] md:min-w-[360px] snap-center">
                <div className="h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                        {review.initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-tight">{review.name}</p>
                        {review.badge && <p className="text-[10px] text-slate-400">{review.badge}</p>}
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-sm">★</span>)}
                    <span className="text-xs text-slate-400 ml-1">{review.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">"{review.text}"</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages messages privés */}
      <section className="py-12 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal animation="fadeInUp">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
                Messages TikTok
              </div>
              <h2 className="text-2xl font-black mb-2">Ils nous ont écrit</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Messages reçus directement de nos élèves.</p>
            </div>
          </Reveal>

          <div
            className="flex overflow-x-auto gap-4 pt-2 pb-4 no-scrollbar -mx-4 px-4 snap-x"
            onTouchStart={e => { testimonialsRef.current.dragStartX = e.touches[0].clientX; testimonialsRef.current.dragging = false; }}
            onTouchMove={e => { if (Math.abs(e.touches[0].clientX - testimonialsRef.current.dragStartX) > 8) testimonialsRef.current.dragging = true; }}
          >
            {testimonialImgs.map((img, i) => (
              <Reveal key={i} animation="scaleIn" delay={i * 60} className="shrink-0 snap-center">
                <button
                  onClick={() => { if (!testimonialsRef.current.dragging) setLightboxIndex(i); }}
                  className="w-48 sm:w-56 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 hover:scale-105 hover:shadow-xl transition-all duration-300 block"
                >
                  <img
                    src={`/testimonials/${encodeURIComponent(img)}`}
                    alt={`Témoignage ${i + 1}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-white dark:bg-background-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal animation="fadeInUp">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black mb-2">Questions fréquentes</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tout ce que vous devez savoir avant de vous lancer.</p>
            </div>
          </Reveal>
          <div className="space-y-3">
            {[
              {
                q: "Est-ce que la formation est vraiment efficace ?",
                a: "Oui. La formation couvre l'intégralité du programme officiel : 8 thèmes, 112 leçons vidéo commentées (signalisation, priorités, vitesse, dépassement, alcool, conditions météo, réglementation…) et un quiz d'entraînement à la fin de chaque thème pour valider vos acquis avant l'examen."
              },
              {
                q: "L'accès est-il vraiment à vie ?",
                a: "Oui, une fois votre paiement effectué, vous accédez à l'intégralité du contenu sans limitation de durée. Vous pouvez réviser à votre rythme, y compris après votre examen."
              },
              {
                q: "Est-ce que je peux regarder sur mon téléphone ?",
                a: "Absolument. La plateforme est entièrement optimisée pour mobile, tablette et ordinateur. Vous pouvez réviser où que vous soyez, depuis n'importe quel appareil."
              },
              {
                q: "Combien de temps faut-il pour se préparer ?",
                a: "En révisant 30 à 45 minutes par jour, la plupart de nos élèves se sentent prêts en 2 à 4 semaines. Vous avancez à votre propre rythme."
              },
              {
                q: "Que se passe-t-il si je ne réussis pas mon examen ?",
                a: "Vous gardez l'accès à vie à la formation pour vous perfectionner et vous représenter. Vous pouvez repasser autant de fois que nécessaire avec le même contenu."
              },
            ].map((item, i) => (
              <Reveal key={i} animation="fadeInUp" delay={i * 40}>
                <details className="group bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-bold text-sm select-none">
                    {item.q}
                    <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-3">expand_more</span>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                    {item.a}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-dark-accent border-t border-white/10 pt-12 pb-8 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary"><span className="material-symbols-outlined text-2xl">directions_car</span></span>
                <span className="text-lg font-bold tracking-tight">Code ou galère <span className="text-primary"><span className="material-symbols-outlined">directions_car</span></span></span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Apprendre à conduire n'a jamais été aussi simple. Rejoignez la communauté et passez votre code sereinement.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Navigation</h4>
              <ul className="text-slate-400 text-xs space-y-2">
                <li><a className="hover:text-primary transition-colors" href="#">Accueil</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Cours vidéo</a></li>
<li><a className="hover:text-primary transition-colors" href="#tarifs">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Légal</h4>
              <ul className="text-slate-400 text-xs space-y-2">
                <li><Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link></li>
                <li><Link to="/politique-de-confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link></li>
                <li><Link to="/cgv" className="hover:text-primary transition-colors">CGV</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Contact</h4>
              <ul className="text-slate-400 text-xs space-y-3">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">mail</span> permisougalere@gmail.com</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">location_on</span> Châtenay-Malabry, France</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-[10px]">© 2026 BHS Permis. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="https://www.tiktok.com/@permisougalere" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors" aria-label="TikTok @permisougalere">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
          onTouchStart={e => { testimonialsRef.current.lbStartX = e.touches[0].clientX; }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].clientX - testimonialsRef.current.lbStartX;
            if (dx < -50) lightboxNext();
            else if (dx > 50) lightboxPrev();
            else if (e.target === e.currentTarget) setLightboxIndex(null);
          }}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={e => { e.stopPropagation(); lightboxPrev(); }}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <img
            src={`/testimonials/${encodeURIComponent(testimonialImgs[lightboxIndex])}`}
            alt={`Témoignage ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={e => { e.stopPropagation(); lightboxNext(); }}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {testimonialImgs.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === lightboxIndex ? 'bg-white w-4' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default LandingPage;
