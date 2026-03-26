import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Navigate } from 'react-router-dom';

const OnboardingPage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/login" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!firstName || !lastName) {
      setError('Le prénom et le nom sont obligatoires.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName, phone: phone || null })
      .eq('id', user.id);
    if (err) {
      setError('Une erreur est survenue. Réessayez.');
      setLoading(false);
      return;
    }
    await refreshProfile();
    // Email de bienvenue — fire and forget
    supabase.functions.invoke('send-welcome-email').catch(() => {});
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center px-4">
      <div className="bg-slate-800 rounded-3xl p-8 w-full max-w-md border border-slate-700">
        <h1 className="text-2xl font-black text-white mb-1">Complétez votre profil</h1>
        <p className="text-slate-400 text-sm mb-8">Quelques informations avant d'accéder à votre espace.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border-slate-600 text-white focus:ring-primary focus:border-primary"
                placeholder="Jean"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border-slate-600 text-white focus:ring-primary focus:border-primary"
                placeholder="Dupont"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Téléphone <span className="text-slate-500 font-normal">(facultatif)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border-slate-600 text-white focus:ring-primary focus:border-primary"
              placeholder="06 00 00 00 00"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Enregistrement...' : 'Accéder à mon espace →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
