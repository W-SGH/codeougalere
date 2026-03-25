# Guide de configuration — Auto-École en ligne

## Ce qui est implémenté

- **Authentification** : Email/mot de passe + Google OAuth via Supabase Auth
- **Paiement** : Stripe Checkout (redirection sécurisée vers la page Stripe)
- **Accès** : Le dashboard/player sont protégés — accès uniquement après paiement confirmé
- **Vidéos** : Lecteur react-player (YouTube, Vimeo, ou auto-hébergé)
- **Quiz** : 5 questions par thème avec corrections détaillées
- **Progression** : Sauvegardée en base de données, affichée dans le dashboard
- **Admin** : Dashboard avec ventes réelles depuis Supabase

## Configuration en 3 étapes

### 1. Créer un projet Supabase

1. Allez sur [app.supabase.com](https://app.supabase.com) → New Project
2. Dans **SQL Editor**, copiez-collez le contenu de `supabase/schema.sql` et exécutez
3. Dans **Project Settings > API**, copiez ces deux valeurs dans votre fichier `.env` :
   - `Project URL` → collez-la comme valeur de `VITE_SUPABASE_URL` dans `.env`
   - `anon public key` → collez-la comme valeur de `VITE_SUPABASE_ANON_KEY` dans `.env`

   Exemple de ce que doit contenir votre `.env` à ce stade :
   ```
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### Activer Google OAuth (optionnel)
- Authentication > Providers > Google → activer et configurer votre Google OAuth App

#### Créer votre compte admin
Après vous être inscrit sur le site :
```sql
UPDATE public.profiles SET is_admin = TRUE WHERE id = 'votre-uuid-ici';
```

### 2. Configurer Stripe

1. Créez un compte sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Clé publique** (`pk_live_...`) → collez-la dans `.env` comme valeur de `VITE_STRIPE_PUBLISHABLE_KEY`
3. **Clé secrète** (`sk_live_...`) → ne pas mettre dans `.env` ! Elle ira dans le terminal à l'étape 3c ci-dessous

### 3. Déployer les Edge Functions Supabase

Les "Edge Functions" sont de petits programmes côté serveur qui tournent chez Supabase. Ils servent ici à communiquer avec Stripe (créer un paiement, confirmer une vente). Voici comment les déployer :

#### a) Installer l'outil Supabase en ligne de commande

Dans votre terminal (une seule fois sur votre machine) :
```bash
npm install -g supabase
```

#### b) Se connecter et lier votre projet

```bash
# Se connecter à votre compte Supabase
supabase login
# (ouvre votre navigateur pour vous authentifier)

# Lier la commande à votre projet Supabase
# VOTRE_PROJECT_REF = la partie de l'URL avant .supabase.co
# ex : si votre URL est https://abcdefgh.supabase.co → ref = abcdefgh
supabase link --project-ref VOTRE_PROJECT_REF
```

#### c) Ajouter la clé secrète Stripe

```bash
# Clé secrète Stripe — dans dashboard.stripe.com > Développeurs > Clés API > Clé secrète
supabase secrets set STRIPE_SECRET_KEY=sk_live_votre_cle_secrete
```

#### d) Déployer les 3 fonctions

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy verify-payment
```

#### e) Créer le webhook dans Stripe et récupérer son secret

Un webhook = Stripe appelle automatiquement votre site quand un paiement est validé, pour donner l'accès à l'acheteur.

1. Allez sur **[dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)**
2. Cliquez **"Ajouter un endpoint"**
3. Dans le champ **URL de l'endpoint**, collez :
   ```
   https://VOTRE_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
   _(remplacez VOTRE_PROJECT_REF par les lettres de votre URL Supabase, ex: `abcdefgh`)_
4. Dans **"Événements à écouter"**, cherchez et cochez :
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Cliquez **"Ajouter l'endpoint"**
6. Vous arrivez sur la page de l'endpoint → cliquez **"Révéler"** à côté de **"Secret de signature"**
7. Copiez la valeur qui commence par `whsec_...`

#### f) Enregistrer le secret webhook dans Supabase

Retournez dans votre terminal et collez le secret récupéré à l'étape précédente :

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_le_secret_copie_depuis_stripe
```

### 4. Créer le fichier .env

```bash
cp .env.example .env
```

Remplissez `.env` avec vos vraies valeurs.

### 5. Ajouter vos vidéos

Editez `src/data/courses.js` et remplacez les `videoUrl` par vos vraies URLs :
- YouTube : `https://www.youtube.com/watch?v=VIDEO_ID`
- Vimeo : `https://vimeo.com/VIDEO_ID`
- Auto-hébergé : `https://votre-cdn.com/video.mp4`

## Lancer le projet en développement

```bash
npm run dev
```

## Déploiement

```bash
npm run build
# Déployez le dossier dist/ sur Vercel, Netlify, ou tout autre hébergeur statique
```

## Flux de paiement

1. L'utilisateur remplit le formulaire → compte créé dans Supabase Auth
2. Redirection vers Stripe Checkout (page sécurisée Stripe)
3. Après paiement → Stripe appelle le webhook → `has_access = true` dans la DB
4. Redirection vers `/success?session_id=xxx` → vérification finale
5. L'utilisateur peut accéder au dashboard et aux cours

## Structure des fichiers clés

```
src/
├── context/
│   ├── AuthContext.jsx      # Auth Supabase + état utilisateur
│   └── ProgressContext.jsx  # Progression des cours
├── components/
│   └── ProtectedRoute.jsx   # Protection des routes
├── data/
│   └── courses.js           # Contenu des cours (vidéos + quiz)
├── lib/
│   └── supabase.js          # Client Supabase
└── pages/
    ├── LoginPage.jsx         # Connexion réelle
    ├── PricingPage.jsx       # Inscription + paiement Stripe
    ├── DashboardPage.jsx     # Dashboard élève avec vraie progression
    ├── CoursePlayerPage.jsx  # Lecteur vidéo + quiz interactifs
    ├── SuccessPage.jsx       # Confirmation paiement
    └── AdminDashboard.jsx    # Dashboard admin avec données réelles
supabase/
├── schema.sql               # Tables + RLS + triggers
└── functions/
    ├── create-checkout/      # Crée la session Stripe
    ├── stripe-webhook/       # Reçoit les confirmations Stripe
    └── verify-payment/       # Vérifie un paiement côté client
```
