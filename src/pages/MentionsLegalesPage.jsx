import React from 'react'
import { Link } from 'react-router-dom'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background-dark">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/" className="text-sm text-slate-500 hover:text-primary transition-colors mb-8 inline-block">← Retour à l'accueil</Link>
        <h1 className="text-3xl font-black mb-2">Mentions légales</h1>
        <p className="text-slate-500 text-sm mb-10">Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN).</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">1. Éditeur du site</h2>
          <div className="text-slate-600 dark:text-slate-300 text-sm space-y-1 leading-relaxed">
            <p><strong>Raison sociale :</strong> BHS Permis</p>
            <p><strong>SIRET :</strong> 93200579600010</p>
            <p><strong>Adresse :</strong> 58 chemin de la justice, 92290 Châtenay-Malabry, France</p>
            <p><strong>Email :</strong> permisougalere@gmail.com</p>
            <p><strong>Directeur de la publication :</strong> Le responsable de BHS Permis</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">2. Hébergeur</h2>
          <div className="text-slate-600 dark:text-slate-300 text-sm space-y-1 leading-relaxed">
            <p><strong>Hébergeur :</strong> [NOM HÉBERGEUR À COMPLÉTER]</p>
            <p><strong>Adresse :</strong> [ADRESSE HÉBERGEUR À COMPLÉTER]</p>
            <p><strong>Site web :</strong> [URL HÉBERGEUR À COMPLÉTER]</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">3. Propriété intellectuelle</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            L'ensemble du contenu de ce site (textes, vidéos, images, questions d'entraînement, etc.) est la propriété exclusive de BHS Permis et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est interdite.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">4. Responsabilité</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            BHS Permis s'efforce d'assurer l'exactitude des informations diffusées sur ce site, mais ne peut garantir leur exhaustivité ou leur mise à jour en temps réel. La préparation au Code de la Route proposée sur ce site est un complément pédagogique et ne saurait remplacer les cours dispensés par un établissement agréé.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">5. Données personnelles</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Le traitement des données personnelles est décrit dans notre <Link to="/politique-de-confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">6. Droit applicable</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Le présent site est soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </section>
      </div>
    </div>
  )
}
