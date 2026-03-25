import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, ArrowRight, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const PricingPage = () => {
  const { user, hasAccess, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(message || '');
  const [step, setStep] = useState('register'); // 'register' | 'payment'
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    if (user && hasAccess) navigate('/dashboard', { replace: true });
  }, [user, hasAccess]);

  function getFrenchError(msg) {
    if (msg.includes('already registered') || msg.includes('already exists')) return 'Cet email est déjà utilisé. Connectez-vous.';
    if (msg.includes('Password should')) return 'Le mot de passe doit contenir au moins 6 caractères.';
    if (msg.includes('Invalid email')) return 'Adresse email invalide.';
    return 'Une erreur est survenue. Réessayez ou contactez le support.';
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(getFrenchError(err.message));
      setLoading(false);
    }
  }

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoDiscount(null);

    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.trim().toUpperCase())
      .eq('active', true)
      .single();

    if (!promo) {
      setPromoError('Code invalide ou inactif.');
    } else {
      const notExpired = !promo.expires_at || new Date(promo.expires_at) > new Date();
      const hasUsesLeft = !promo.max_uses || promo.used_count < promo.max_uses;
      if (!notExpired) setPromoError('Ce code a expiré.');
      else if (!hasUsesLeft) setPromoError('Ce code a atteint sa limite d\'utilisation.');
      else setPromoDiscount({ percent: promo.discount_percent, code: promo.code });
    }
    setPromoLoading(false);
  }

  async function handleRegisterAndPay(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Si l'utilisateur est déjà connecté, aller directement au paiement
      if (user) {
        await redirectToCheckout(user.id, user.email);
        return;
      }

      if (!firstName || !lastName || !email || !password) {
        setError('Veuillez remplir tous les champs.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        setLoading(false);
        return;
      }

      // Sinon, créer le compte
      const data = await signUp(email, password, firstName, lastName, phone);
      if (data.user) {
        await redirectToCheckout(data.user.id, email);
      }
    } catch (err) {
      setError(getFrenchError(err.message));
      setLoading(false);
    }
  }

  async function redirectToCheckout(userId, userEmail) {
    // Appel à la Supabase Edge Function pour créer une session Stripe Checkout
    const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
      body: {
        userId,
        email: userEmail,
        productName: 'Pack Vidéo Intégral - Code de la Route',
        amount: 4900,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/tarifs`,
        promoCode: promoDiscount?.code || null,
      }
    });

    if (fnError || !data?.url) {
      setError('Impossible de démarrer le paiement. Vérifiez la configuration Stripe.');
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  const finalPrice = promoDiscount ? Math.round(49 * (1 - promoDiscount.percent / 100)) : 49;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-black dark:hover:text-white transition-colors mb-8">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Retour à l'accueil
          </Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Investissez dans votre <span className="text-primary border-b-4 border-primary">réussite</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Rejoignez des milliers de candidats qui ont obtenu leur code du premier coup. Paiement sécurisé et accès immédiat.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          {/* Card Pricing */}
          <div className="bg-primary p-8 md:p-12 rounded-3xl shadow-2xl text-black transform hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-9xl">workspace_premium</span>
            </div>
            <div className="bg-black/10 text-xs font-bold uppercase py-1.5 px-4 rounded-full self-start inline-block mb-6">Accès Illimité à Vie</div>
            <h2 className="text-3xl font-bold mb-2">Pack Vidéo Intégral</h2>
            <div className="mb-8 flex items-end gap-2">
              <span className="text-6xl font-black">49€</span>
              <span className="text-sm font-bold text-black/70 mb-2">Paiement unique</span>
            </div>
            <ul className="space-y-4 mb-10 text-base font-medium">
              <li className="flex items-center gap-3"><Check className="w-6 h-6 shrink-0" /> 7 thèmes complets du code de la route</li>
              <li className="flex items-center gap-3"><Check className="w-6 h-6 shrink-0" /> 14 vidéos HD commentées par un expert</li>
              <li className="flex items-center gap-3"><Check className="w-6 h-6 shrink-0" /> 70+ questions d'entraînement avec corrections</li>
              <li className="flex items-center gap-3"><Check className="w-6 h-6 shrink-0" /> Accès disponible sur PC, Mobile et Tablette</li>
              <li className="flex items-center gap-3"><Check className="w-6 h-6 shrink-0" /> Mise à jour gratuite (normes 2024)</li>
              <li className="flex items-center gap-3"><Check className="w-6 h-6 shrink-0" /> Suivi de progression détaillé</li>
            </ul>
            <div className="bg-black/10 rounded-2xl p-4 text-sm">
              <p className="font-bold mb-1">✓ Accès immédiat après paiement</p>
              <p className="font-bold">✓ Satisfait ou remboursé 30 jours</p>
            </div>
          </div>

          {/* Form Checkout */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-2xl font-bold mb-2">
              {user ? 'Finaliser le paiement' : 'Créer votre compte'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {user ? `Connecté en tant que ${user.email}` : 'Étape 1/2 — Création du compte'}
            </p>

            {!user && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-6 disabled:opacity-60"
                >
                  <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                  Continuer avec Google
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 font-medium">Ou inscription par email</span>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleRegisterAndPay}>
              {!user && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prénom</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary transition-colors text-slate-900 dark:text-white"
                        placeholder="Jean"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary transition-colors text-slate-900 dark:text-white"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Téléphone <span className="text-slate-400 font-normal">(facultatif)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary transition-colors text-slate-900 dark:text-white"
                      placeholder="06 00 00 00 00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary transition-colors text-slate-900 dark:text-white"
                      placeholder="jean.dupont@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary transition-colors text-slate-900 dark:text-white pr-10"
                        placeholder="Minimum 6 caractères"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Code promo</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoDiscount(null); setPromoError(''); }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                    placeholder="EXEMPLE20"
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {promoLoading ? '...' : 'Appliquer'}
                  </button>
                </div>
                {promoError && <p className="text-xs text-red-500 mt-1.5">{promoError}</p>}
                {promoDiscount && (
                  <p className="text-xs text-green-600 font-bold mt-1.5">✓ -{promoDiscount.percent}% appliqué — vous payez {finalPrice}€ au lieu de 49€</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="block w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-center text-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></span>
                      {user ? 'Redirection vers le paiement...' : 'Création du compte...'}
                    </span>
                  ) : (
                    user ? `Procéder au paiement sécurisé → ${finalPrice}€` : `Créer mon compte et payer ${finalPrice}€`
                  )}
                </button>
                <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Paiement sécurisé par Stripe (SSL 256-bit)
                </p>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center text-sm text-slate-500">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
