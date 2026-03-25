# Guide — Génération automatique des quiz

Ce script analyse la transcription d'une vidéo et génère automatiquement
5 questions QCM prêtes à coller dans `courses.js`.

---

## Prérequis

- Node.js 18 ou supérieur
- Une clé API Anthropic (https://console.anthropic.com → API Keys)

---

## Étape 1 — Récupérer la transcription de ta vidéo

### Si ta vidéo est sur YouTube :
1. Ouvre ta vidéo sur YouTube
2. Clique sur `...` (les trois points sous la vidéo)
3. Clique sur **"Afficher la transcription"**
4. Sélectionne tout le texte (Cmd+A) et copie-le (Cmd+C)
5. Colle dans un nouveau fichier texte dans `scripts/transcripts/`
   - Exemple : `scripts/transcripts/theme1.txt`

### Si ta vidéo n'est pas encore sur YouTube :
- Regarde ta vidéo et retranscris les points clés à la main
- Ou utilise un outil de transcription automatique comme :
  - **MacWhisper** (app Mac, gratuit pour les bases)
  - **Whisper** en ligne sur huggingface.co

---

## Étape 2 — Configurer la clé API

Ouvre le terminal et lance :

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-xxxx
```

> Ta clé se trouve sur https://console.anthropic.com dans la section "API Keys".
> Elle commence toujours par `sk-ant-`.

---

## Étape 3 — Lancer le script

Dans le terminal, depuis le dossier du projet :

```bash
node scripts/generate-quiz.mjs scripts/transcripts/theme1.txt "1-2"
```

**Paramètres :**
- `scripts/transcripts/theme1.txt` → le fichier de transcription
- `"1-2"` → l'identifiant de la leçon quiz dans courses.js
  - Thème 1 quiz → `"1-2"`
  - Thème 2 quiz → `"2-2"`
  - Thème 3 quiz → `"3-2"`
  - etc.

---

## Étape 4 — Récupérer le résultat

Le script crée automatiquement un fichier dans `scripts/` :
- Exemple : `scripts/quiz-1-2.js`

Ouvre ce fichier, copie le bloc JSON, et colle-le dans `src/data/courses.js`
à la place de la leçon quiz correspondante.

---

## Exemple de commandes pour tous les thèmes

```bash
node scripts/generate-quiz.mjs scripts/transcripts/theme1.txt "1-2"
node scripts/generate-quiz.mjs scripts/transcripts/theme2.txt "2-2"
node scripts/generate-quiz.mjs scripts/transcripts/theme3.txt "3-2"
node scripts/generate-quiz.mjs scripts/transcripts/theme4.txt "4-2"
node scripts/generate-quiz.mjs scripts/transcripts/theme5.txt "5-2"
node scripts/generate-quiz.mjs scripts/transcripts/theme6.txt "6-2"
node scripts/generate-quiz.mjs scripts/transcripts/theme7.txt "7-2"
```

---

## En cas d'erreur

**"ANTHROPIC_API_KEY manquante"**
→ Relance `export ANTHROPIC_API_KEY=sk-ant-xxxx` dans le terminal

**"Le modèle n'a pas renvoyé un JSON valide"**
→ Relance la même commande, ça arrive rarement

**"Cannot find module"**
→ Vérifie que tu es bien dans le dossier du projet (`cd /chemin/vers/auto-ecole`)
