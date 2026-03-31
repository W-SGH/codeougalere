import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Reveal from '../components/Reveal';
import DemoModal from '../components/DemoModal';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const { user, hasAccess, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
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
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#formats">Apprentissage</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#avantages">Avantages</a>
              {!hasAccess && <a className="text-sm font-medium hover:text-primary transition-colors" href="#tarifs">Tarifs</a>}
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
            <a className="text-sm font-medium hover:text-primary transition-colors py-2" href="#formats" onClick={() => setMobileMenuOpen(false)}>Apprentissage</a>
            <a className="text-sm font-medium hover:text-primary transition-colors py-2" href="#avantages" onClick={() => setMobileMenuOpen(false)}>Avantages</a>
            {!hasAccess && <a className="text-sm font-medium hover:text-primary transition-colors py-2" href="#tarifs" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>}
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

      <header className="relative overflow-hidden pt-8 pb-12 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
              <Reveal animation="fadeInUp" delay={0}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold mb-4 border border-slate-200">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  La méthode qui fait réussir
                </div>
              </Reveal>
              <Reveal animation="fadeInUp" delay={80}>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4">Réussissez votre <span className="text-slate-900 dark:text-white border-b-4 border-primary">Code de la Route</span> du premier coup !</h1>
              </Reveal>
              <Reveal animation="fadeInUp" delay={160}>
                <div className="flex flex-col gap-3 justify-center lg:justify-start mb-6 lg:order-last">
                  {hasAccess ? (
                    <Link to="/dashboard" className="animate-glow bg-primary text-black px-8 py-3.5 rounded-xl text-lg font-bold shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
                      Accéder à mes cours
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                  ) : (
                    <>
                      <Link to="/tarifs" className="animate-glow bg-primary text-black px-8 py-3.5 rounded-xl text-lg font-bold shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
                        Commencer maintenant
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </Link>
                      <Link to="/preinscription" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center justify-center gap-1">
                        ⚡ Offre de lancement — 50 places à −30%
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </>
                  )}
                  <button onClick={() => setShowDemo(true)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-3.5 rounded-xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 md:hidden">
                    <span className="material-symbols-outlined text-lg">play_circle</span>
                    Voir la démo
                  </button>
                </div>
              </Reveal>
              <Reveal animation="fadeInUp" delay={220}>
                <p className="text-base text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto lg:mx-0">
                  La meilleure préparation avec des cours en vidéo commentés, des questions d'entraînement par thème, et des examens blancs pour vous assurer de réussir le Code de la Route du premier coup.
                </p>
              </Reveal>
              <div className="hidden md:flex flex-row gap-4 justify-start">
                <button onClick={() => setShowDemo(true)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">play_circle</span>
                  Voir la démo
                </button>
              </div>
            </div>

            {/* Bloc design hero */}
            <Reveal animation="fadeIn" delay={250} className="flex-1 w-full hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md h-96">

                {/* Carte principale — cours en cours */}
                <div className="animate-float absolute top-0 left-4 right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-black text-xl">play_circle</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Thème 3 — En cours</p>
                      <p className="text-sm font-black truncate">La circulation routière</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 shrink-0">18:20</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-1">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>62% complété</span>
                    <span>11:20 restantes</span>
                  </div>
                </div>

                {/* Carte quiz flottante */}
                <div className="absolute bottom-12 left-0 bg-slate-900 rounded-2xl shadow-xl p-4 w-56 border border-slate-700" style={{ animation: 'float 6s ease-in-out 1s infinite' }}>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Question 3/5</p>
                  <p className="text-xs font-bold text-white mb-3">Taux légal d'alcoolémie pour un conducteur confirmé ?</p>
                  <div className="space-y-1.5">
                    {['0,2 g/L', '0,5 g/L', '0,8 g/L'].map((opt, i) => (
                      <div key={i} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${i === 1 ? 'bg-primary text-black' : 'bg-slate-800 text-slate-400'}`}>{opt}</div>
                    ))}
                  </div>
                </div>

                {/* Badge score */}
                <div className="absolute bottom-8 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl px-4 py-3 border border-slate-100 dark:border-slate-700 flex items-center gap-3" style={{ animation: 'float 7s ease-in-out 0.5s infinite' }}>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600 text-xl">emoji_events</span>
                  </div>
                  <div>
                    <p className="text-xs font-black">Score moyen</p>
                    <p className="text-lg font-black text-green-600">4,8 / 5</p>
                  </div>
                </div>

                {/* Badge élèves */}
                <div className="absolute top-4 -right-2 bg-primary rounded-xl shadow-lg px-3 py-2 flex items-center gap-2" style={{ animation: 'float 5.5s ease-in-out 0.8s infinite' }}>
                  <span className="material-symbols-outlined text-black text-base">groups</span>
                  <p className="text-xs font-black text-black">+200 élèves</p>
                </div>

              </div>
            </Reveal>

          </div>
        </div>
      </header>

      <section className="py-12 bg-white dark:bg-slate-900/50" id="formats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal animation="fadeInUp">
            <div className="text-left mb-6">
              <h2 className="text-2xl font-bold mb-2">Nos formats d'apprentissage</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Une méthode hybride conçue pour s'adapter à votre style de vie.</p>
            </div>
          </Reveal>
          <div className="flex overflow-x-auto gap-4 pt-2 pb-4 no-scrollbar -mx-4 px-4 snap-x">

            {/* Cours vidéo */}
            <Reveal animation="scaleIn" delay={0} className="min-w-[85%] md:min-w-[400px] snap-center">
            <div className="h-full group p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:-translate-y-1 shadow-sm transition-all duration-300">
              <div className="w-12 h-12 bg-primary text-black rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">co_present</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Cours vidéo commentés</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Je commente chaque thème du code sur des slides PowerPoint en vous expliquant les règles, les pièges et les points importants en vidéo.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Avancez thème par thème</li>
                <li className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Explications du formateur</li>
              </ul>
              <a className="text-sm text-black dark:text-white font-bold inline-flex items-center gap-2 hover:gap-3 transition-all" href="#">Découvrir <span className="material-symbols-outlined text-base">arrow_right_alt</span></a>
            </div>
            </Reveal>

            {/* Questions d'entraînement */}
            <Reveal animation="scaleIn" delay={100} className="min-w-[85%] md:min-w-[400px] snap-center">
            <div className="h-full group p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:-translate-y-1 shadow-sm transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">quiz</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Questions d'entraînement</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Après chaque vidéo, entraînez-vous sur des questions type examen. Un corrigé détaillé vous aide à comprendre chaque erreur.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Corrélées aux leçons</li>
                <li className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Corrigés ultra détaillés</li>
              </ul>
            </div>
            </Reveal>

            {/* Examens Blancs */}
            <Reveal animation="scaleIn" delay={200} className="min-w-[85%] md:min-w-[400px] snap-center">
            <div className="h-full group p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:-translate-y-1 shadow-sm transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">event_available</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Examens Blancs finaux</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                À la fin du parcours, mettez-vous en conditions réelles d'examen pour vérifier que vous avez les bases solides pour réussir.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Conditions réelles 40 questions</li>
                <li className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Prépare à l'examen officiel</li>
              </ul>
            </div>
            </Reveal>

          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-background-dark" id="avantages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal animation="fadeInUp">
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-3 leading-tight">Pourquoi nous choisir ?</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Une méthode éprouvée pour garantir votre succès.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            <Reveal animation="fadeInUp" delay={0}>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent dark:border-slate-700 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-10 h-10 bg-primary rounded-full shadow-md flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-black text-xl">schedule</span>
                </div>
                <h4 className="text-sm font-bold mb-1">Accès 24/7</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Révisez à votre rythme, sans contraintes.</p>
              </div>
            </Reveal>
            <Reveal animation="fadeInUp" delay={100}>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent dark:border-slate-700 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-10 h-10 bg-primary rounded-full shadow-md flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-black text-xl">school</span>
                </div>
                <h4 className="text-sm font-bold mb-1">Experts</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Apprenez auprès des meilleurs pros.</p>
              </div>
            </Reveal>
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
                a: "Oui. Nos élèves obtiennent leur code du premier coup grâce à une méthode en vidéo commentée thème par thème, des questions d'entraînement après chaque leçon, et des examens blancs en conditions réelles."
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

      {!hasAccess && <section className="py-16 bg-dark-accent text-white" id="tarifs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">Accédez au cours complet</h2>
            <p className="text-sm text-slate-400">La meilleure préparation en vidéo.</p>
          </div>
          <div className="max-w-lg mx-auto w-full">
            <Reveal animation="scaleIn">
            <div className="bg-primary p-8 rounded-2xl flex flex-col shadow-2xl text-black transform hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-black/10 text-[10px] font-bold uppercase py-1 px-3 rounded-full self-start mb-4">Accès Illimité</div>
              <h3 className="text-xl font-bold mb-2">Pack Vidéo Intégral</h3>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-black">49€</span>
                <span className="text-xs font-bold text-black/70">/accès à vie</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm font-medium">
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-base">check</span> 50+ heures de cours vidéo HD</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-base">check</span> Explications complètes</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-base">check</span> Cas pratiques & pièges</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-base">check</span> Support pédagogique</li>
              </ul>
              <Link to="/tarifs" className="w-full py-4 rounded-xl bg-black text-white text-center text-lg font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-black/20 block">Commencer la formation</Link>
              <Link to="/preinscription" className="w-full mt-3 py-3 rounded-xl border-2 border-white/30 text-white text-center text-sm font-bold hover:border-primary hover:text-primary transition-colors block">⚡ Offre de lancement −30% →</Link>
            </div>
            </Reveal>
          </div>
        </div>
      </section>}

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
                <li><a className="hover:text-primary transition-colors" href="#">Examens blancs</a></li>
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

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}

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
