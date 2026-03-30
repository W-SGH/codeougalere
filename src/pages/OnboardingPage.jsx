import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const OnboardingPage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/login" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!firstName || !lastName || !birthDate || !phone || !address || !city || !postalCode) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        birth_date: birthDate || null,
        address: address || null,
        address_complement: addressComplement || null,
        city: city || null,
        postal_code: postalCode || null,
      })
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

  const inputClass = "w-full rounded-xl bg-slate-900 border border-slate-600 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors placeholder-slate-500";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center px-4 py-12">
      <div className="bg-slate-800 rounded-3xl p-8 w-full max-w-md border border-slate-700">
        <h1 className="text-2xl font-black text-white mb-1">Complétez votre profil</h1>
        <p className="text-slate-400 text-sm mb-8">Ces informations sont nécessaires pour votre contrat de formation.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom / Prénom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Prénom <span className="text-red-400">*</span></label>
              <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} placeholder="Jean" />
            </div>
            <div>
              <label className={labelClass}>Nom <span className="text-red-400">*</span></label>
              <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} placeholder="Dupont" />
            </div>
          </div>

          {/* Date de naissance */}
          <div>
            <label className={labelClass}>Date de naissance <span className="text-red-400">*</span></label>
            <input type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputClass} max={new Date().toISOString().split('T')[0]} />
          </div>

          {/* Téléphone */}
          <div>
            <label className={labelClass}>Téléphone <span className="text-red-400">*</span></label>
            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="06 00 00 00 00" />
          </div>

          {/* Adresse */}
          <div>
            <label className={labelClass}>Adresse (numéro et rue) <span className="text-red-400">*</span></label>
            <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className={inputClass} placeholder="12 rue de la Paix" />
          </div>
          <div>
            <label className={labelClass}>Complément d'adresse <span className="text-slate-500 font-normal">(facultatif)</span></label>
            <input type="text" value={addressComplement} onChange={e => setAddressComplement(e.target.value)} className={inputClass} placeholder="Apt 3, Bât B…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Code postal <span className="text-red-400">*</span></label>
              <input type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)} className={inputClass} placeholder="75001" maxLength={10} />
            </div>
            <div>
              <label className={labelClass}>Ville <span className="text-red-400">*</span></label>
              <input type="text" required value={city} onChange={e => setCity(e.target.value)} className={inputClass} placeholder="Paris" />
            </div>
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
