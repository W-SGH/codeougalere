import React from 'react'
import { Link } from 'react-router-dom'

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background-dark">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/" className="text-sm text-slate-500 hover:text-primary transition-colors mb-8 inline-block">← Retour à l'accueil</Link>
        <h1 className="text-3xl font-black mb-2">Politique de confidentialité</h1>
        <p className="text-slate-500 text-sm mb-10">Conformément au Règlement Général sur la Protection des Données (RGPD) — UE 2016/679 — et à la loi Informatique et Libertés.</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">1. Responsable du traitement</h2>
          <div className="text-slate-600 dark:text-slate-300 text-sm space-y-1 leading-relaxed">
            <p><strong>BHS Permis</strong></p>
            <p>58 chemin de la justice, 92290 Châtenay-Malabry, France</p>
            <p>Email : permisougalere@gmail.com</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">2. Données collectées</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">Nous collectons les données suivantes :</p>
          <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Données d'identité :</strong> nom, prénom, date de naissance</li>
            <li><strong>Données de contact :</strong> adresse e-mail, numéro de téléphone, adresse postale complète (rue, complément, ville, code postal)</li>
            <li><strong>Données de connexion :</strong> identifiant, historique des connexions, mot de passe (chiffré)</li>
            <li><strong>Données contractuelles :</strong> date d'acceptation du contrat de formation, exemplaire du contrat signé</li>
            <li><strong>Données de progression :</strong> thèmes consultés, scores aux quiz, temps de visionnage, avancement dans les cours</li>
            <li><strong>Données de paiement :</strong> traitées directement par Stripe — nous ne stockons aucune donnée bancaire</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">3. Finalités du traitement</h2>
          <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-2 list-disc list-inside leading-relaxed">
            <li>Création et gestion de votre compte utilisateur</li>
            <li>Fourniture de l'accès aux contenus pédagogiques achetés</li>
            <li>Suivi de votre progression dans les cours</li>
            <li>Traitement et validation des paiements</li>
            <li>Envoi d'e-mails transactionnels (confirmation de paiement, réinitialisation de mot de passe)</li>
            <li>Gestion des demandes de support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">4. Base légale</h2>
          <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Exécution du contrat</strong> : gestion du compte, accès aux cours, paiement</li>
            <li><strong>Obligation légale</strong> : conservation des données comptables</li>
            <li><strong>Intérêt légitime</strong> : amélioration du service, sécurité</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">5. Sous-traitants et transferts</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">Nous faisons appel aux prestataires suivants, qui traitent vos données en notre nom :</p>
          <div className="overflow-x-auto">
            <table className="text-sm text-slate-600 dark:text-slate-300 w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 pr-4 font-semibold">Prestataire</th>
                  <th className="text-left py-2 pr-4 font-semibold">Rôle</th>
                  <th className="text-left py-2 font-semibold">Localisation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr><td className="py-2 pr-4">Vercel</td><td className="py-2 pr-4">Hébergement du site web (frontend)</td><td className="py-2">USA (clauses contractuelles types)</td></tr>
                <tr><td className="py-2 pr-4">Supabase</td><td className="py-2 pr-4">Hébergement base de données et authentification</td><td className="py-2">UE (AWS Frankfurt)</td></tr>
                <tr><td className="py-2 pr-4">Stripe</td><td className="py-2 pr-4">Paiement en ligne</td><td className="py-2">UE/USA (clauses contractuelles types)</td></tr>
                <tr><td className="py-2 pr-4">Google (OAuth)</td><td className="py-2 pr-4">Connexion via compte Google (optionnel)</td><td className="py-2">USA (clauses contractuelles types)</td></tr>
                <tr><td className="py-2 pr-4">Resend</td><td className="py-2 pr-4">Envoi d'e-mails transactionnels</td><td className="py-2">USA (clauses contractuelles types)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">6. Durée de conservation</h2>
          <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Données de compte :</strong> durée de vie du compte + 3 ans après la dernière activité</li>
            <li><strong>Données de paiement :</strong> 10 ans (obligation comptable)</li>
            <li><strong>Données de connexion :</strong> 12 mois</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">7. Vos droits</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-1 list-disc list-inside leading-relaxed">
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement (« droit à l'oubli »)</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition et de limitation du traitement</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-3">
            Pour exercer ces droits, contactez-nous à <strong>permisougalere@gmail.com</strong>. Vous disposez également du droit d'introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CNIL</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">8. Cookies</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Ce site utilise uniquement des cookies strictement nécessaires à son fonctionnement (authentification, session de paiement). Aucun cookie publicitaire ou de traçage n'est utilisé. Pour plus d'informations, consultez notre <Link to="/cookies" className="text-primary hover:underline">politique cookies</Link>.
          </p>
        </section>

        <p className="text-slate-400 text-xs mt-10">Dernière mise à jour : mars 2026</p>
      </div>
    </div>
  )
}
