import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCourses } from '../context/CoursesContext'
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const EXAM_DURATION = 40 * 60 // 40 minutes en secondes
const PASS_SCORE = 35          // 35/40 pour réussir (comme le vrai examen)

function getAllQuestions(courses) {
  const questions = []
  courses.forEach(course => {
    course.lessons.forEach(lesson => {
      if (lesson.type === 'quiz' && lesson.questions) {
        lesson.questions.forEach(q => {
          questions.push({ ...q, theme: course.theme, themeTitle: course.title })
        })
      }
    })
  })
  // Mélanger aléatoirement
  return questions.sort(() => Math.random() - 0.5)
}

// ── Écran d'accueil ──────────────────────────────────────────────
function ExamIntro({ questions, onStart }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Dashboard
        </Link>
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
          <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">fact_check</span>
          </div>
          <h1 className="text-2xl font-black mb-2">Examen Blanc</h1>
          <p className="text-slate-400 text-sm mb-8">Mets-toi en conditions réelles d'examen.</p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-2xl font-black text-primary">{questions.length}</p>
              <p className="text-xs text-slate-400 mt-1">questions</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-2xl font-black text-primary">40 min</p>
              <p className="text-xs text-slate-400 mt-1">durée max</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-2xl font-black text-primary">{PASS_SCORE}/{questions.length}</p>
              <p className="text-xs text-slate-400 mt-1">score pour réussir</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-2xl font-black text-primary">7</p>
              <p className="text-xs text-slate-400 mt-1">thèmes couverts</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-200 leading-relaxed">
                Une fois lancé, le chronomètre ne s'arrête pas. Assure-toi d'avoir 40 minutes devant toi.
              </p>
            </div>
          </div>

          <button
            onClick={onStart}
            className="w-full py-4 bg-primary text-black font-black rounded-xl hover:bg-primary-dark transition-colors text-lg"
          >
            Lancer l'examen
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Examen en cours ──────────────────────────────────────────────
function ExamInProgress({ questions, onFinish }) {
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) { clearInterval(t); onFinish(answers); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  function handleAnswer(qId, idx) {
    setAnswers(prev => ({ ...prev, [qId]: idx }))
  }

  function handleSubmit() {
    if (Object.keys(answers).length < questions.length) {
      const unanswered = questions.length - Object.keys(answers).length
      if (!window.confirm(`Il reste ${unanswered} question(s) sans réponse. Terminer quand même ?`)) return
    }
    onFinish(answers)
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const isLow = timeLeft < 5 * 60
  const q = questions[current]
  const answered = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header sticky */}
      <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400">{current + 1}/{questions.length}</span>
          <div className="h-1.5 w-24 sm:w-48 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{answered} répondues</span>
        </div>
        <div className={`flex items-center gap-2 font-black text-lg ${isLow ? 'text-red-400' : 'text-white'}`}>
          <Clock className="w-4 h-4" />
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Thème */}
        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{q.theme} — {q.themeTitle}</p>

        {/* Question */}
        <h2 className="text-xl font-black mb-6 leading-snug">{q.text}</h2>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === i
            return (
              <button
                key={i}
                onClick={() => handleAnswer(q.id, i)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                  selected
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                <span className="font-black mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
                {opt}
              </button>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-bold disabled:opacity-30 hover:bg-slate-800 transition-colors"
          >
            ← Précédent
          </button>

          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent(c => c + 1)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-black hover:bg-primary-dark transition-colors"
            >
              Terminer l'examen
            </button>
          )}
        </div>

        {/* Dots de navigation */}
        <div className="flex flex-wrap gap-1.5 mt-8 justify-center">
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-6 h-6 rounded-md text-[10px] font-black transition-all ${
                i === current
                  ? 'bg-primary text-black'
                  : answers[q.id] !== undefined
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

// ── Résultats ────────────────────────────────────────────────────
function ExamResults({ questions, answers, onRetry }) {
  const score = questions.filter(q => answers[q.id] === q.correct).length
  const passed = score >= PASS_SCORE
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Score */}
        <div className={`rounded-2xl border p-8 text-center mb-6 ${passed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          {passed
            ? <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            : <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          }
          <p className="text-5xl font-black mb-2">{score}<span className="text-2xl text-slate-400">/{questions.length}</span></p>
          <p className={`text-lg font-bold mb-1 ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {passed ? '🎉 Examen réussi !' : '📚 Examen non validé'}
          </p>
          <p className="text-slate-400 text-sm">
            {passed
              ? 'Félicitations, tu dépasses le seuil de réussite !'
              : `Il te manque ${PASS_SCORE - score} point${PASS_SCORE - score > 1 ? 's' : ''} pour valider.`
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900 rounded-xl p-4 text-center border border-slate-800">
            <p className="text-xl font-black text-green-400">{score}</p>
            <p className="text-xs text-slate-400 mt-1">Correctes</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 text-center border border-slate-800">
            <p className="text-xl font-black text-red-400">{questions.length - score}</p>
            <p className="text-xs text-slate-400 mt-1">Erreurs</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 text-center border border-slate-800">
            <p className="text-xl font-black text-primary">{Math.round((score / questions.length) * 100)}%</p>
            <p className="text-xs text-slate-400 mt-1">Réussite</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-xl border border-slate-700 text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Recommencer
          </button>
          <Link to="/dashboard" className="flex-1 py-3 rounded-xl bg-primary text-black text-sm font-black text-center hover:bg-primary-dark transition-colors">
            Retour aux cours
          </Link>
        </div>

        {/* Détail des réponses */}
        <button
          onClick={() => setShowDetails(v => !v)}
          className="w-full py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
        >
          {showDetails ? 'Masquer' : 'Voir'} le détail des réponses ↓
        </button>

        {showDetails && (
          <div className="mt-4 space-y-4">
            {questions.map((q, i) => {
              const userAnswer = answers[q.id]
              const correct = userAnswer === q.correct
              return (
                <div key={q.id} className={`rounded-xl border p-4 ${correct ? 'border-green-800/50 bg-green-500/5' : 'border-red-800/50 bg-red-500/5'}`}>
                  <div className="flex items-start gap-2 mb-3">
                    {correct
                      ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    }
                    <p className="text-sm font-bold text-white">{i + 1}. {q.text}</p>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`text-xs px-3 py-2 rounded-lg ${
                          oi === q.correct
                            ? 'bg-green-500/20 text-green-300 font-bold'
                            : oi === userAnswer && !correct
                            ? 'bg-red-500/20 text-red-300'
                            : 'text-slate-500'
                        }`}
                      >
                        {['A', 'B', 'C', 'D'][oi]}. {opt}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{q.explanation}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page principale ──────────────────────────────────────────────
export default function ExamPage() {
  const { courses } = useCourses()
  const [phase, setPhase] = useState('intro') // intro | exam | results
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})

  function startExam() {
    setQuestions(getAllQuestions(courses))
    setAnswers({})
    setPhase('exam')
  }

  function finishExam(finalAnswers) {
    setAnswers(finalAnswers)
    setPhase('results')
  }

  if (phase === 'intro') return <ExamIntro questions={getAllQuestions(courses)} onStart={startExam} />
  if (phase === 'exam') return <ExamInProgress questions={questions} onFinish={finishExam} />
  return <ExamResults questions={questions} answers={answers} onRetry={startExam} />
}
