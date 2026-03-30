import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  // Ref pour savoir si le mot de passe a été changé avant de quitter la page
  const passwordChangedRef = useRef(false);

  // Supabase envoie le token dans le hash de l'URL (#access_token=...&type=recovery)
  // onAuthStateChange intercepte PASSWORD_RECOVERY et établit la session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Flux PKCE (Supabase v2) : le code est dans les query params (?code=xxx)
    if (params.has('code')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setReady(true);
      });
    }

    // Flux implicite (ancien) : type=recovery dans le hash
    if (window.location.hash.includes('type=recovery')) {
      setReady(true);
    }

    // Écouter l'événement PASSWORD_RECOVERY dans les deux cas
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Sécurité : si l'utilisateur quitte sans changer son mot de passe,
    // on le déconnecte pour éviter qu'il reste connecté via le token de reset
    return () => {
      subscription.unsubscribe();
      if (!passwordChangedRef.current) {
        supabase.auth.signOut();
      }
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError('Une erreur est survenue. Le lien a peut-être expiré, refaites une demande.');
      return;
    }

    passwordChangedRef.current = true;
    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 3000);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center px-4">
        <div className="bg-slate-800 rounded-3xl p-10 w-full max-w-md border border-slate-700 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Mot de passe mis à jour !</h1>
          <p className="text-slate-400 text-sm">Redirection vers votre espace dans quelques secondes…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center px-4">
      <div className="bg-slate-800 rounded-3xl p-8 w-full max-w-md border border-slate-700">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-6"
        >
          ← Retour à l'accueil
        </button>
        <h1 className="text-2xl font-black text-white mb-1">Nouveau mot de passe</h1>
        <p className="text-slate-400 text-sm mb-8">Choisissez un mot de passe sécurisé pour votre compte.</p>

        {!ready && (
          <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
            Vérification du lien en cours…
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={!ready}
                className="w-full rounded-xl bg-slate-900 border border-slate-600 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10 disabled:opacity-50"
                placeholder="Minimum 6 caractères"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirmer le mot de passe</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              disabled={!ready}
              className="w-full rounded-xl bg-slate-900 border border-slate-600 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              placeholder="Répétez le mot de passe"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !ready}
            className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Mise à jour…' : 'Enregistrer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
