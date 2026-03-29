import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Play, FileText, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const { user, hasAccess, refreshProfile } = useAuth();
  const [accessReady, setAccessReady] = useState(false);
  const pollingRef = useRef(null);

  useEffect(() => {
    if (hasAccess) { setAccessReady(true); return; }
    // Valider le format Stripe avant d'appeler l'edge function
    if (!sessionId || !sessionId.startsWith('cs_') || !user) return;

    // Lancer verify-payment en arrière-plan avec fetch + clé anon (même fix que create-checkout :
    // supabase.functions.invoke envoie le token ES256 Google rejeté par le gateway Supabase)
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, userId: user.id }),
    }).catch(() => {});

    // Interroger la DB toutes les 2s jusqu'à has_access = true
    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      attempts++;
      const { data } = await supabase
        .from('profiles')
        .select('has_access')
        .eq('id', user.id)
        .single();

      if (data?.has_access) {
        clearInterval(pollingRef.current);
        setAccessReady(true);
        await refreshProfile();
      }

      // Arrêter après 30s (15 tentatives)
      if (attempts >= 15) clearInterval(pollingRef.current);
    }, 2000);

    return () => clearInterval(pollingRef.current);
  }, [sessionId, user]);

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 text-center relative">

          {/* Header */}
          <div className="bg-primary pt-12 pb-24 px-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 -left-4 w-24 h-24 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
              <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            <div className="relative z-10 flex justify-center mb-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <h1 className="relative z-10 text-3xl sm:text-4xl font-black text-black mb-2">Paiement validé !</h1>
            <p className="relative z-10 text-black/80 font-medium">
              Merci {userName && <span className="font-bold">{userName}</span>}{!userName && 'pour votre confiance'} !
            </p>
          </div>

          {/* Delivery Content */}
          <div className="px-8 pt-8 pb-12 -mt-16 relative z-20">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 text-left mb-8">
              <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Votre commande est prête</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Accès à la plateforme vidéo</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Vous avez maintenant accès à l'intégralité du cours. 7 thèmes, 14 vidéos, 70+ questions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Facture & Reçu</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Une facture a été envoyée à votre adresse email.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {accessReady ? (
                <a
                  href="/dashboard"
                  className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg"
                >
                  Accéder à mes cours →
                </a>
              ) : (
                <div className="flex items-center gap-3 px-8 py-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 font-medium">
                  <Loader className="w-4 h-4 animate-spin" />
                  Activation de votre accès...
                </div>
              )}
              <Link
                to="/"
                className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
