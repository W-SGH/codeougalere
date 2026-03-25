import React from 'react'
import { Link } from 'react-router-dom'

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background-dark">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/" className="text-sm text-slate-500 hover:text-primary transition-colors mb-8 inline-block">← Retour à l'accueil</Link>
        <h1 className="text-3xl font-black mb-2">Conditions Générales de Vente</h1>
        <p className="text-slate-500 text-sm mb-10">Applicables à partir du 17 mars 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">1. Vendeur</h2>
          <div className="text-slate-600 dark:text-slate-300 text-sm space-y-1 leading-relaxed">
            <p><strong>BHS Permis</strong></p>
            <p>SIRET : 93200579600010</p>
            <p>58 chemin de la justice, 92290 Châtenay-Malabry, France</p>
            <p>Email : permisougalere@gmail.com</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">2. Objet</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Les présentes CGV régissent les ventes de contenus numériques (vidéos pédagogiques, quiz, examens blancs) proposés sur le site permisougalere.fr à destination de tout utilisateur souhaitant se préparer à l'examen du Code de la Route.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">3. Offre et tarifs</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
            L'accès complet à la plateforme est proposé sous forme d'un paiement unique de <strong>49 € TTC</strong> (TVA non applicable, article 293 B du CGI — régime de la franchise en base de TVA).
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Cet accès comprend :
          </p>
          <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-1 list-disc list-inside leading-relaxed mt-2">
            <li>7 thèmes complets du Code de la Route</li>
            <li>14 vidéos HD commentées par un expert</li>
            <li>70+ questions d'entraînement avec corrections détaillées</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-3">
            Les tarifs sont exprimés en euros. BHS Permis se réserve le droit de modifier ses tarifs à tout moment ; le prix applicable est celui affiché au moment de la commande.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">4. Commande et paiement</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
            La commande est confirmée après création d'un compte et paiement via la plateforme Stripe (carte bancaire). Le paiement est sécurisé — BHS Permis ne conserve aucune donnée bancaire.
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            L'accès aux contenus est activé automatiquement après confirmation du paiement par Stripe.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">5. Droit de rétractation</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
            Conformément à l'article L221-28 du Code de la consommation, <strong>le droit de rétractation ne peut être exercé</strong> pour la fourniture de contenus numériques non fournis sur support matériel, dès lors que l'exécution a commencé avec l'accord préalable exprès du consommateur et sa renonciation expresse à son droit de rétractation.
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            En procédant au paiement, vous reconnaissez expressément demander l'accès immédiat aux contenus et renoncer à votre droit de rétractation de 14 jours.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">6. Remboursement</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            En raison de la nature numérique du produit et de la renonciation au droit de rétractation (art. 5 ci-dessus), aucun remboursement ne sera accordé une fois l'accès activé. En cas de problème technique empêchant l'accès aux contenus, contactez-nous à permisougalere@gmail.com — nous traiterons votre demande dans les plus brefs délais.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">7. Accès et durée</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            L'accès est accordé à titre personnel et non transférable. Il est valable sans limitation de durée, tant que la plateforme est maintenue en activité. BHS Permis s'engage à prévenir les utilisateurs par e-mail au moins 30 jours avant toute fermeture de la plateforme.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">8. Propriété intellectuelle</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Les contenus accessibles sont la propriété exclusive de BHS Permis. Toute reproduction, rediffusion ou exploitation commerciale est strictement interdite et constituerait une contrefaçon.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">9. Responsabilité</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            BHS Permis met tout en œuvre pour garantir l'exactitude pédagogique des contenus, mais ne peut garantir le succès à l'examen du Code de la Route. La responsabilité de BHS Permis ne saurait être engagée au-delà du montant payé par l'utilisateur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">10. Données personnelles</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Le traitement de vos données personnelles est décrit dans notre <Link to="/politique-de-confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">11. Droit applicable et litiges</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, le consommateur peut saisir le médiateur de la consommation compétent ou les tribunaux français.
          </p>
        </section>

        <p className="text-slate-400 text-xs mt-10">Dernière mise à jour : mars 2026</p>
      </div>
    </div>
  )
}
