/**
 * Générateur de quiz automatique pour Permis ou Galère
 * ─────────────────────────────────────────────────────
 * Usage :
 *   node scripts/generate-quiz.mjs <fichier_transcription.txt> <id_leçon>
 *
 * Exemple :
 *   node scripts/generate-quiz.mjs transcripts/theme1.txt "1-2"
 *
 * Prérequis :
 *   - Node.js 18+
 *   - Variable d'environnement ANTHROPIC_API_KEY
 *     → export ANTHROPIC_API_KEY=sk-ant-xxxx
 */

import fs from 'fs'
import path from 'path'

const [,, transcriptFile, lessonId] = process.argv

if (!transcriptFile || !lessonId) {
  console.error('Usage: node scripts/generate-quiz.mjs <fichier.txt> <id_leçon>')
  console.error('Exemple: node scripts/generate-quiz.mjs transcripts/theme1.txt "1-2"')
  process.exit(1)
}

const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  console.error('❌ Variable ANTHROPIC_API_KEY manquante.')
  console.error('   Lance : export ANTHROPIC_API_KEY=sk-ant-xxxx')
  process.exit(1)
}

const transcript = fs.readFileSync(path.resolve(transcriptFile), 'utf-8')

console.log(`📄 Transcription chargée (${transcript.length} caractères)`)
console.log('🤖 Génération des questions en cours...\n')

const prompt = `Tu es un expert en pédagogie du Code de la Route français.

Voici la transcription d'une vidéo de cours :

---
${transcript}
---

Génère exactement 5 questions à choix multiples (QCM) basées UNIQUEMENT sur le contenu de cette vidéo.

Règles :
- Chaque question doit tester une notion importante abordée dans la vidéo
- 4 options de réponse par question (A, B, C, D)
- Une seule bonne réponse par question
- L'explication doit être claire et pédagogique (2-3 phrases max)
- Les questions doivent ressembler à celles du vrai examen du Code de la Route
- Rédige tout en français

Réponds UNIQUEMENT avec un JSON valide, sans aucun texte avant ou après, dans ce format exact :
[
  {
    "id": "q1",
    "text": "Question ici ?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Explication de la bonne réponse."
  }
]

Le champ "correct" est l'index (0-3) de la bonne réponse dans le tableau "options".`

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }]
  })
})

if (!response.ok) {
  const err = await response.text()
  console.error('❌ Erreur API Anthropic:', err)
  process.exit(1)
}

const data = await response.json()
const raw = data.content[0].text.trim()

let questions
try {
  questions = JSON.parse(raw)
} catch {
  console.error('❌ Le modèle n\'a pas renvoyé un JSON valide :')
  console.error(raw)
  process.exit(1)
}

// Formater en bloc prêt à coller dans courses.js
const output = `
// ── Colle ce bloc dans la leçon "${lessonId}" de courses.js ──────────────
{
  id: "${lessonId}",
  title: "Questions d'entraînement : [TITRE DU THÈME]",
  type: "quiz",
  duration: "${questions.length} questions",
  questions: ${JSON.stringify(questions, null, 4)}
},
// ────────────────────────────────────────────────────────────────────────
`

console.log('✅ Questions générées :\n')
console.log(output)

// Sauvegarder dans un fichier
const outFile = `scripts/quiz-${lessonId.replace('/', '-')}.js`
fs.writeFileSync(outFile, output)
console.log(`\n💾 Sauvegardé dans : ${outFile}`)
