import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, ArrowRight, AlertCircle, Eye, EyeOff, Lock, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// Passer à true dans Vercel (VITE_PROMO_PHASE=true) pour bloquer les inscriptions sans code promo
const PROMO_PHASE = import.meta.env.VITE_PROMO_PHASE === 'true'

// ⚠️ TODO : mettre à jour le prix du contrat quand il est arrêté
const CONTRACT_PRICE_DISPLAY = '[PRIX À COMPLÉTER]'

const CONTRACT_TEXT = `CONTRAT DE FORMATION À L'UNITÉ – CODE DE LA ROUTE EN LIGNE

Entre les soussignés :

L'auto-école BHS Permis
Adresse : 58 chemin de la justice, 92290 Châtenay-Malabry, France
SIRET : 93200579600010
Représentée par : Le responsable de BHS Permis
Ci-après désignée « l'Auto-école »

Et l'élève :
Nom : {lastName}
Prénom : {firstName}
Date de naissance : {birthDate}
Adresse : {address}{addressComplement}
Email : {email}
Ci-après désigné « l'Élève »

Article 1 – Objet de la formation
La présente formation concerne un module de code de la route en ligne, comprenant :
- Supports pédagogiques (slides, vidéos, exercices)
- Accès en ligne via la plateforme Code ou Galère
- Correction et suivi pédagogique par l'Auto-école
L'accès est fourni uniquement à l'élève inscrit, via son compte personnel.

Article 2 – Durée et modalités
- Durée d'accès : À vie à compter de la date d'inscription.
- L'accès est personnel et non transférable.
- La formation est disponible en ligne 24h/24 et 7j/7.

Article 3 – Conditions financières
- Prix du module : ${CONTRACT_PRICE_DISPLAY} TTC
- Modalités de paiement : Paiement en ligne par carte bancaire via Stripe.
- Paiement unique, sans abonnement.

Article 4 – Renonciation au droit de rétractation
Conformément à l'article L.221-28 du Code de la consommation, l'élève reconnaît expressément que la prestation de formation commencera immédiatement après la validation du paiement et que l'accès à la plateforme sera ouvert sans délai. En conséquence, l'élève renonce expressément à son droit de rétractation de 14 jours prévu par l'article L.221-18 du Code de la consommation.

Article 5 – Obligations de l'élève
L'élève s'engage à :
1. Utiliser les supports strictement pour son apprentissage personnel.
2. Ne pas reproduire, partager ou diffuser les contenus à des tiers.
3. Respecter les conditions générales d'utilisation de la plateforme.

Article 6 – Propriété intellectuelle
Les supports pédagogiques sont la propriété de BHS Permis. Toute reproduction ou diffusion est strictement interdite.

Article 7 – Responsabilité
L'Auto-école ne peut être tenue responsable des problèmes techniques liés à l'accès Internet de l'élève. L'élève est responsable du bon usage de ses identifiants d'accès.

Article 8 – Acceptation électronique
En cochant la case d'acceptation, l'élève confirme avoir pris connaissance de l'intégralité du présent contrat, accepter les obligations liées à l'usage de la plateforme, et renoncer expressément à son droit de rétractation. Cette acceptation électronique a valeur de signature conformément à la loi n°2000-230 du 13 mars 2000 sur la signature électronique.

Fait à Châtenay-Malabry, le {date}`

function buildContract(fields) {
  const addressFull = [fields.address, fields.city && fields.postalCode ? `${fields.postalCode} ${fields.city}` : fields.city || fields.postalCode].filter(Boolean).join(', ')
  const complement = fields.addressComplement ? `, ${fields.addressComplement}` : ''
  const dateStr = new Date().toLocaleDateString('fr-FR')
  return CONTRACT_TEXT
    .replace('{firstName}', fields.firstName || '')
    .replace('{lastName}', fields.lastName || '')
    .replace('{birthDate}', fields.birthDate ? new Date(fields.birthDate).toLocaleDateString('fr-FR') : '')
    .replace('{address}', addressFull)
    .replace('{addressComplement}', complement)
    .replace('{email}', fields.email || '')
    .replace('{date}', dateStr)
}

const PricingPage = () => {
  const { user, profile, loading: authLoading, hasAccess, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  // Étape : 'register' | 'contract'
  const [step, setStep] = useState('register');

  // Champs personnels
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Contrat
  const [contractAccepted, setContractAccepted] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(message || '');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Attendre que le profil soit chargé avant de décider si il est incomplet
  const profileLoaded = user && profile !== null;
  // Profil incomplet = user Google connecté sans avoir rempli les infos obligatoires
  const profileIncomplete = profileLoaded && (!profile?.birth_date || !profile?.address || !profile?.contract_accepted_at);

  useEffect(() => {
    if (user && hasAccess) navigate('/dashboard', { replace: true });
  }, [user, hasAccess]);

  // Pré-remplir les champs depuis les métadonnées Google quand l'utilisateur arrive
  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata || {};
    if (meta.given_name && !firstName) setFirstName(meta.given_name);
    if (meta.family_name && !lastName) setLastName(meta.family_name);
    if (meta.full_name && !firstName && !meta.given_name) {
      const parts = meta.full_name.split(' ');
      if (parts[0]) setFirstName(parts[0]);
      if (parts[1]) setLastName(parts.slice(1).join(' '));
    }
  }, [user]);

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
      // Rediriger vers /tarifs après Google auth pour collecter les infos et le contrat
      await signInWithGoogle(`${window.location.origin}/tarifs`);
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

  // Étape 1 → vérifier les champs et passer au contrat
  function handleGoToContract(e) {
    e.preventDefault();
    setError('');

    // Validation des champs : obligatoire pour nouveaux inscrits ET pour users Google (profil incomplet)
    if (!user || profileIncomplete) {
      if (!firstName || !lastName || !birthDate || !address || !city || !postalCode || !phone) {
        setError('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      if (!user && !email) {
        setError('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      if (!user && (!password || password.length < 6)) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
      const birth = new Date(birthDate);
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 15);
      if (birth > minAge) {
        setError('Vous devez avoir au moins 15 ans pour vous inscrire.');
        return;
      }
    }

    setStep('contract');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Étape 2 → créer le compte + payer
  async function handleAcceptAndPay(e) {
    e.preventDefault();
    if (!contractAccepted) {
      setError('Vous devez accepter le contrat de formation pour continuer.');
      return;
    }
    setLoading(true);
    setError('');
    const contractAcceptedAt = new Date().toISOString();

    try {
      if (user) {
        // Mettre à jour le profil avec tous les champs + consentement contrat
        await supabase.from('profiles').update({
          first_name: firstName || profile?.first_name || null,
          last_name: lastName || profile?.last_name || null,
          phone: phone || profile?.phone || null,
          birth_date: birthDate || null,
          address: address || null,
          address_complement: addressComplement || null,
          city: city || null,
          postal_code: postalCode || null,
          contract_accepted_at: contractAcceptedAt,
        }).eq('id', user.id);
        await redirectToCheckout(user.id, user.email);
        return;
      }

      const data = await signUp(email, password, firstName, lastName, phone, {
        address,
        addressComplement,
        city,
        postalCode,
        birthDate,
        contractAcceptedAt,
      });

      if (data.user) {
        await redirectToCheckout(data.user.id, email);
      }
    } catch (err) {
      setError(getFrenchError(err.message));
      setLoading(false);
    }
  }

  async function redirectToCheckout(userId, userEmail) {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    let data;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email: userEmail,
          productName: 'Pack Vidéo Intégral - Code de la Route',
          amount: 4900,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/tarifs`,
          promoCode: promoDiscount?.code || null,
        }),
      });
      data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('tentatives')) {
        setError('Trop de tentatives. Réessayez dans une heure.');
      } else {
        setError('Impossible de démarrer le paiement. Réessayez ou contactez le support.');
      }
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  const finalPrice = promoDiscount ? Math.round(49 * (1 - promoDiscount.percent / 100)) : 49;
  const contractFilled = buildContract({ firstName, lastName, birthDate, address, addressComplement, city, postalCode, email: email || user?.email });

  const inputClass = "w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

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
              <p className="font-bold">✓ Accès à vie garanti</p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">

            {/* Attendre le chargement du profil pour éviter la race condition Google OAuth */}
            {user && !profileLoaded ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Chargement de votre profil...</p>
              </div>
            ) : /* === PHASE PROMO === */
            PROMO_PHASE && !user && !promoDiscount ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Inscriptions en avant-première</h3>
                <p className="text-slate-500 text-sm mb-8 max-w-xs">
                  L'accès est réservé aux personnes disposant d'un code promo de lancement.
                  Entrez votre code pour débloquer l'inscription.
                </p>
                <div className="w-full space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoDiscount(null); setPromoError(''); }}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                      placeholder="Votre code promo"
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary uppercase tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                      className="px-5 py-3 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary-dark disabled:opacity-50 transition-colors shrink-0"
                    >
                      {promoLoading ? '...' : 'Valider'}
                    </button>
                  </div>
                  {promoError && <p className="text-xs text-red-500 text-left">{promoError}</p>}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 w-full text-center text-sm text-slate-500">
                  Pas encore de code ?{' '}
                  <Link to="/preinscription" className="font-bold text-primary hover:text-primary-dark transition-colors">
                    Préinscrivez-vous →
                  </Link>
                </div>
              </div>
            ) : step === 'register' ? (
              /* === ÉTAPE 1 : INFOS PERSONNELLES === */
              <>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-7 h-7 rounded-full bg-primary text-black text-xs font-black flex items-center justify-center">1</span>
                  <div>
                    <h3 className="text-xl font-bold">{user ? 'Complétez votre inscription' : 'Vos informations'}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Étape 1/2 — Informations personnelles</p>
                  </div>
                </div>

                {user && profileIncomplete && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 text-sm">
                    <span>Connecté via Google — veuillez compléter vos informations pour continuer.</span>
                  </div>
                )}

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

                <form className="space-y-4" onSubmit={handleGoToContract}>
                  {(!user || profileIncomplete) && (
                    <>
                      {/* Nom / Prénom */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Prénom <span className="text-red-500">*</span></label>
                          <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} placeholder="Jean" />
                        </div>
                        <div>
                          <label className={labelClass}>Nom <span className="text-red-500">*</span></label>
                          <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} placeholder="Dupont" />
                        </div>
                      </div>

                      {/* Date de naissance */}
                      <div>
                        <label className={labelClass}>Date de naissance <span className="text-red-500">*</span></label>
                        <input type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputClass} max={new Date().toISOString().split('T')[0]} />
                      </div>

                      {/* Téléphone */}
                      <div>
                        <label className={labelClass}>Téléphone <span className="text-red-500">*</span></label>
                        <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="06 00 00 00 00" />
                      </div>

                      {/* Adresse */}
                      <div>
                        <label className={labelClass}>Adresse (numéro et rue) <span className="text-red-500">*</span></label>
                        <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className={inputClass} placeholder="12 rue de la Paix" />
                      </div>
                      <div>
                        <label className={labelClass}>Complément d'adresse <span className="text-slate-400 font-normal">(facultatif)</span></label>
                        <input type="text" value={addressComplement} onChange={e => setAddressComplement(e.target.value)} className={inputClass} placeholder="Apt 3, Bât B…" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Code postal <span className="text-red-500">*</span></label>
                          <input type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)} className={inputClass} placeholder="75001" maxLength={10} />
                        </div>
                        <div>
                          <label className={labelClass}>Ville <span className="text-red-500">*</span></label>
                          <input type="text" required value={city} onChange={e => setCity(e.target.value)} className={inputClass} placeholder="Paris" />
                        </div>
                      </div>

                      {/* Email / Mot de passe — uniquement pour les nouveaux inscrits (pas Google) */}
                      {!user && (
                        <>
                          <div>
                            <label className={labelClass}>Adresse email <span className="text-red-500">*</span></label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="jean.dupont@email.com" />
                          </div>
                          <div>
                            <label className={labelClass}>Mot de passe <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className={`${inputClass} pr-10`}
                                placeholder="Minimum 6 caractères"
                              />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Code promo */}
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
                      className="block w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-center text-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg"
                    >
                      Continuer — Lire le contrat →
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      Paiement sécurisé par Stripe (SSL 256-bit)
                    </p>
                  </div>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center text-sm text-slate-500">
                  Vous avez déjà un compte ?{' '}
                  <Link to="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">Se connecter</Link>
                </div>
              </>
            ) : (
              /* === ÉTAPE 2 : CONTRAT === */
              <>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-7 h-7 rounded-full bg-primary text-black text-xs font-black flex items-center justify-center">2</span>
                  <div>
                    <h3 className="text-xl font-bold">Contrat de formation</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Étape 2/2 — Lisez et acceptez le contrat</p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Contrat scrollable */}
                <div className="relative mb-4">
                  <div className="h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-4 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {contractFilled}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent rounded-b-xl pointer-events-none flex items-end justify-center pb-1">
                    <ChevronDown className="w-4 h-4 text-slate-400 animate-bounce" />
                  </div>
                </div>

                <form onSubmit={handleAcceptAndPay} className="space-y-4">
                  {/* Case à cocher */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={contractAccepted}
                      onChange={e => setContractAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary shrink-0"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      J'ai lu et j'accepte le contrat de formation. Je reconnais avoir été informé(e) que la prestation débutera immédiatement après le paiement et{' '}
                      <strong>je renonce expressément à mon droit de rétractation</strong>{' '}
                      conformément à l'article L.221-28 du Code de la consommation.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading || !contractAccepted}
                    className="block w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-center text-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></span>
                        Redirection vers le paiement...
                      </span>
                    ) : (
                      `Accepter et payer ${finalPrice}€ →`
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Paiement sécurisé par Stripe (SSL 256-bit)
                  </p>
                </form>

                <button
                  type="button"
                  onClick={() => { setStep('register'); setError(''); }}
                  className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  ← Modifier mes informations
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
