import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const EARLY_BIRD_LIMIT = 50;

export default function PreRegistrationPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // null | { isEarlyBird, alreadyRegistered }
  const [error, setError] = useState('');
  const [spotsLeft, setSpotsLeft] = useState(null);

  useEffect(() => {
    supabase.functions.invoke('preregister', { method: 'GET' })
      .then(({ data }) => { if (data) setSpotsLeft(data.spotsLeft); })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error: fnError } = await supabase.functions.invoke('preregister', {
      method: 'POST',
      body: { email },
    });
    setLoading(false);
    if (fnError || data?.error) {
      setError("Une erreur est survenue. Réessayez dans un instant.");
      return;
    }
    setResult(data);
    if (data.isEarlyBird && !data.alreadyRegistered) {
      setSpotsLeft(s => Math.max(0, (s ?? EARLY_BIRD_LIMIT) - 1));
    }
  }

  const isEarlyBirdAvailable = spotsLeft === null || spotsLeft > 0;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      {/* Nav minimal */}
      <nav className="px-6 py-4 flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined">directions_car</span>
          <span className="font-bold text-white">Code ou Galère</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Badge early bird */}
          {isEarlyBirdAvailable && (
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary text-sm font-bold px-4 py-1.5 rounded-full mb-6">
              <span>⚡</span>
              {spotsLeft !== null
                ? `Plus que ${spotsLeft} place${spotsLeft > 1 ? 's' : ''} à prix réduit`
                : 'Offre de lancement — places limitées'}
            </div>
          )}

          {!result ? (
            <>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Réussis ton code<br />
                <span className="text-primary">sans te ruiner.</span>
              </h1>

              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                {isEarlyBirdAvailable
                  ? <>Sois parmi les <strong className="text-white">50 premiers inscrits</strong> et bénéficie de <strong className="text-primary">−30%</strong> sur la formation complète. Ton code promo arrive directement par email.</>
                  : <>Inscris-toi pour être prévenu dès l'ouverture et ne pas rater nos prochaines offres.</>
                }
              </p>

              {/* Bénéfices */}
              <ul className="space-y-2 mb-8 text-slate-300 text-sm">
                {[
                  '7 thèmes complets du code de la route',
                  '14 vidéos HD commentées par un expert',
                  '70+ questions d\'entraînement avec corrections',
                  'Accès à vie, sans abonnement',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  className="flex-1 px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 bg-primary text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-60 whitespace-nowrap text-sm"
                >
                  {loading ? 'Envoi...' : isEarlyBirdAvailable ? 'Obtenir −30% →' : 'M\'inscrire →'}
                </button>
              </form>

              {error && (
                <p className="text-red-400 text-sm mt-3">{error}</p>
              )}

              <p className="text-slate-600 text-xs mt-4">
                Aucun paiement demandé. Désabonnement en un clic.
              </p>
            </>
          ) : (
            /* État succès */
            <div className="text-center py-8">
              {result.isEarlyBird ? (
                <>
                  <div className="text-6xl mb-6">🎉</div>
                  <h2 className="text-3xl font-black mb-3">
                    {result.alreadyRegistered ? 'Déjà inscrit !' : 'Tu es dans les 50 !'}
                  </h2>
                  <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                    {result.alreadyRegistered
                      ? 'Ton code promo t\'a déjà été envoyé. Vérifie ta boîte mail (et les spams).'
                      : 'Ton code promo −30% vient d\'être envoyé à ton adresse email. Vérifie ta boîte mail (et les spams si besoin).'}
                  </p>
                  <div className="bg-slate-800 border border-primary/30 rounded-2xl p-6 mb-8 inline-block">
                    <p className="text-slate-400 text-sm mb-2">Ton code promo</p>
                    <p className="text-primary text-3xl font-black tracking-widest">LANCEMENT</p>
                    <p className="text-white font-bold mt-1">−30% sur la formation</p>
                  </div>
                  <div>
                    <Link
                      to="/tarifs?promo=LANCEMENT"
                      className="inline-block px-8 py-4 bg-primary text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors text-base"
                    >
                      Démarrer ma formation →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-6">✅</div>
                  <h2 className="text-3xl font-black mb-3">
                    {result.alreadyRegistered ? 'Déjà inscrit !' : "C'est noté !"}
                  </h2>
                  <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    {result.alreadyRegistered
                      ? 'Tu es déjà sur la liste. On te préviendra à l\'ouverture.'
                      : 'Tu seras parmi les premiers prévenus à l\'ouverture. Reste connecté !'}
                  </p>
                  <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Voir la formation →
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
