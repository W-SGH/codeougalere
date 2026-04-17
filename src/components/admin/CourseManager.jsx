import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Check, X, Upload, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useCourses } from '../../context/CoursesContext'
import { COURSES as STATIC_COURSES } from '../../data/courses'

// ─── Helpers ───────────────────────────────────────────────────────────────

const INPUT = 'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
const TEXTAREA = INPUT + ' resize-none'
const BTN_SAVE = 'px-3 py-1.5 bg-primary text-black text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors'
const BTN_CANCEL = 'px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors'
const BTN_ICON = 'p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-white'

function KeyPointsEditor({ value, onChange }) {
  return (
    <div className="space-y-2">
      {value.map((kp, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={INPUT}
            value={kp}
            onChange={e => {
              const next = [...value]; next[i] = e.target.value; onChange(next)
            }}
          />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className={BTN_ICON}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ''])} className="text-xs text-primary hover:underline flex items-center gap-1">
        <Plus className="w-3 h-3" /> Ajouter un point clé
      </button>
    </div>
  )
}

function OptionsEditor({ value, correct, onOptionsChange, onCorrectChange }) {
  const labels = ['A', 'B', 'C', 'D']
  return (
    <div className="space-y-2">
      {labels.map((label, i) => (
        <div key={i} className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => onCorrectChange(i)}
            className={`w-7 h-7 rounded-full shrink-0 text-xs font-bold border-2 transition-colors ${correct === i ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400'}`}
          >{label}</button>
          <input
            className={INPUT}
            value={value[i] || ''}
            onChange={e => { const next = [...value]; next[i] = e.target.value; onOptionsChange(next) }}
            placeholder={`Option ${label}`}
          />
        </div>
      ))}
      <p className="text-xs text-slate-400">Clique sur la lettre pour marquer la bonne réponse</p>
    </div>
  )
}

// ─── Formulaires ────────────────────────────────────────────────────────────

function CourseForm({ initial = {}, onSave, onCancel, saving }) {
  const [f, setF] = useState({ theme: '', title: '', description: '', thumbnail: '', ...initial })
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))
  return (
    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Thème</label><input className={INPUT} value={f.theme} onChange={set('theme')} placeholder="Thème 1" /></div>
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Titre</label><input className={INPUT} value={f.title} onChange={set('title')} placeholder="Le conducteur" /></div>
      </div>
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Description</label><textarea className={TEXTAREA} rows={2} value={f.description} onChange={set('description')} /></div>
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Miniature (URL)</label><input className={INPUT} value={f.thumbnail} onChange={set('thumbnail')} placeholder="https://..." /></div>
      <div className="flex gap-2">
        <button className={BTN_SAVE} onClick={() => onSave(f)} disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
        <button className={BTN_CANCEL} onClick={onCancel}>Annuler</button>
      </div>
    </div>
  )
}

function LessonForm({ initial = {}, onSave, onCancel, saving }) {
  const [f, setF] = useState({ title: '', type: 'video', video_url: '', duration: '', description: '', key_points: [], ...initial })
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))
  return (
    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Titre</label><input className={INPUT} value={f.title} onChange={set('title')} /></div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Type</label>
          <select className={INPUT} value={f.type} onChange={set('type')}>
            <option value="video">Vidéo</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>
      </div>
      {f.type === 'video' && <>
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">URL vidéo</label><input className={INPUT} value={f.video_url} onChange={set('video_url')} placeholder="https://youtube.com/..." /></div>
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Description</label><textarea className={TEXTAREA} rows={2} value={f.description} onChange={set('description')} /></div>
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Points clés</label><KeyPointsEditor value={f.key_points} onChange={v => setF(p => ({ ...p, key_points: v }))} /></div>
      </>}
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Durée</label><input className={INPUT} value={f.duration} onChange={set('duration')} placeholder={f.type === 'video' ? '14:32' : '5 questions'} /></div>
      <div className="flex gap-2">
        <button className={BTN_SAVE} onClick={() => onSave(f)} disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
        <button className={BTN_CANCEL} onClick={onCancel}>Annuler</button>
      </div>
    </div>
  )
}

function QuestionForm({ initial = {}, onSave, onCancel, saving }) {
  const [f, setF] = useState({ text: '', options: ['', '', '', ''], correct: 0, explanation: '', ...initial })
  return (
    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Question</label><textarea className={TEXTAREA} rows={2} value={f.text} onChange={e => setF(p => ({ ...p, text: e.target.value }))} /></div>
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Réponses (clique sur la lettre = bonne réponse)</label>
        <OptionsEditor value={f.options} correct={f.correct} onOptionsChange={v => setF(p => ({ ...p, options: v }))} onCorrectChange={v => setF(p => ({ ...p, correct: v }))} />
      </div>
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Explication</label><textarea className={TEXTAREA} rows={2} value={f.explanation} onChange={e => setF(p => ({ ...p, explanation: e.target.value }))} /></div>
      <div className="flex gap-2">
        <button className={BTN_SAVE} onClick={() => onSave(f)} disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
        <button className={BTN_CANCEL} onClick={onCancel}>Annuler</button>
      </div>
    </div>
  )
}

// ─── Composant principal ────────────────────────────────────────────────────

export default function CourseManager() {
  const { allCourses: courses, fromDB, reload } = useCourses()
  const [expanded, setExpanded] = useState(new Set())
  const [expandedLessons, setExpandedLessons] = useState(new Set())
  const [editingCourse, setEditingCourse] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [addingLessonTo, setAddingLessonTo] = useState(null)
  const [addingQuestionTo, setAddingQuestionTo] = useState(null)
  const [addingCourse, setAddingCourse] = useState(false)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)

  function toggleCourse(id) {
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleLesson(id) {
    setExpandedLessons(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // ── Seed ────────────────────────────────────────────────────────────────

  async function seedFromStatic() {
    if (!confirm('Restaurer les 7 cours depuis le fichier statique ? Les cours existants seront mis à jour, rien ne sera supprimé.')) return
    setSeeding(true)
    try {
      for (let ci = 0; ci < STATIC_COURSES.length; ci++) {
        const course = STATIC_COURSES[ci]
        await supabase.from('courses').upsert({ id: course.id, theme: course.theme, title: course.title, description: course.description || '', thumbnail: course.thumbnail || '', position: ci })
        for (let li = 0; li < course.lessons.length; li++) {
          const lesson = course.lessons[li]
          await supabase.from('lessons').upsert({ id: lesson.id, course_id: course.id, title: lesson.title, type: lesson.type, position: li, video_url: lesson.videoUrl || '', duration: lesson.duration || '', description: lesson.description || '', key_points: lesson.keyPoints || [] })
          if (lesson.type === 'quiz' && lesson.questions?.length) {
            // Supprimer les anciennes questions puis réinsérer (évite les conflits de contrainte)
            await supabase.from('quiz_questions').delete().eq('lesson_id', lesson.id)
            await supabase.from('quiz_questions').insert(
              lesson.questions.map((q, qi) => ({
                lesson_id: lesson.id,
                position: qi,
                text: q.text,
                options: q.options,
                correct: q.correct,
                explanation: q.explanation || '',
              }))
            )
          }
        }
      }
      await reload()
    } finally { setSeeding(false) }
  }

  // ── Course CRUD ──────────────────────────────────────────────────────────

  async function saveCourse(id, form) {
    setSaving(true)
    await supabase.from('courses').update({ theme: form.theme, title: form.title, description: form.description, thumbnail: form.thumbnail }).eq('id', id)
    await reload(); setEditingCourse(null); setSaving(false)
  }

  async function addCourse(form) {
    setSaving(true)
    const newId = Math.max(0, ...courses.map(c => c.id)) + 1
    await supabase.from('courses').insert({ id: newId, theme: form.theme, title: form.title, description: form.description, thumbnail: form.thumbnail, position: courses.length })
    await reload(); setAddingCourse(false); setSaving(false)
  }

  async function toggleStatus(id, currentStatus) {
    const next = currentStatus === 'published' ? 'draft' : 'published'
    await supabase.from('courses').update({ status: next }).eq('id', id)
    await reload()
  }

  async function deleteCourse(id) {
    if (!confirm('Supprimer ce cours et toutes ses leçons ?')) return
    await supabase.from('courses').delete().eq('id', id)
    await reload()
  }

  // ── Lesson CRUD ──────────────────────────────────────────────────────────

  async function saveLesson(id, form) {
    setSaving(true)
    await supabase.from('lessons').update({ title: form.title, type: form.type, video_url: form.video_url, duration: form.duration, description: form.description, key_points: form.key_points }).eq('id', id)
    await reload(); setEditingLesson(null); setSaving(false)
  }

  async function addLesson(courseId, form) {
    setSaving(true)
    const course = courses.find(c => c.id === courseId)
    const existingIds = new Set(course.lessons.map(l => l.id))
    let num = 1
    while (existingIds.has(`${courseId}-${num}`)) num++
    const newId = `${courseId}-${num}`
    await supabase.from('lessons').insert({ id: newId, course_id: courseId, title: form.title, type: form.type, video_url: form.video_url || '', duration: form.duration || '', description: form.description || '', key_points: form.key_points || [], position: course.lessons.length })
    await reload(); setAddingLessonTo(null); setSaving(false)
  }

  async function deleteLesson(id) {
    if (!confirm('Supprimer cette leçon ?')) return
    await supabase.from('lessons').delete().eq('id', id)
    await reload()
  }

  // ── Question CRUD ────────────────────────────────────────────────────────

  async function saveQuestion(id, form) {
    setSaving(true)
    await supabase.from('quiz_questions').update({ text: form.text, options: form.options, correct: form.correct, explanation: form.explanation }).eq('id', id)
    await reload(); setEditingQuestion(null); setSaving(false)
  }

  async function addQuestion(lessonId, form) {
    setSaving(true)
    const course = courses.find(c => c.lessons.some(l => l.id === lessonId))
    const lesson = course?.lessons.find(l => l.id === lessonId)
    await supabase.from('quiz_questions').insert({ lesson_id: lessonId, position: (lesson?.questions?.length || 0), text: form.text, options: form.options, correct: form.correct, explanation: form.explanation })
    await reload(); setAddingQuestionTo(null); setSaving(false)
  }

  async function deleteQuestion(id) {
    if (!confirm('Supprimer cette question ?')) return
    await supabase.from('quiz_questions').delete().eq('id', id)
    await reload()
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 max-w-4xl">

      {/* Seed / restore */}
      <div className={`border rounded-2xl p-4 flex items-center justify-between gap-4 ${!fromDB ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
        <div>
          <p className={`font-bold text-sm ${!fromDB ? 'text-yellow-800 dark:text-yellow-300' : 'text-slate-700 dark:text-slate-300'}`}>
            {!fromDB ? 'Base de données vide' : 'Restaurer les cours'}
          </p>
          <p className={`text-xs mt-0.5 ${!fromDB ? 'text-yellow-700 dark:text-yellow-400' : 'text-slate-400'}`}>
            {!fromDB ? 'Importe les 7 cours existants pour commencer.' : 'Réimporte les 7 cours depuis le fichier statique (sans supprimer les modifications).'}
          </p>
        </div>
        <button onClick={seedFromStatic} disabled={seeding} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-black font-bold text-sm rounded-xl transition-colors disabled:opacity-50">
          <Upload className="w-4 h-4" /> {seeding ? 'Restauration...' : !fromDB ? 'Importer' : 'Restaurer'}
        </button>
      </div>

      {/* Add course */}
      {addingCourse ? (
        <CourseForm onSave={addCourse} onCancel={() => setAddingCourse(false)} saving={saving} />
      ) : (
        <button onClick={() => setAddingCourse(true)} className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-500 hover:border-primary hover:text-primary transition-colors w-full justify-center">
          <Plus className="w-4 h-4" /> Nouveau cours
        </button>
      )}

      {/* Course list */}
      {courses.map((course, ci) => (
        <div key={course.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">

          {/* Course header */}
          <div className="flex items-center gap-3 p-4">
            <button onClick={() => toggleCourse(course.id)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
              {expanded.has(course.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div className="flex-1 min-w-0" onClick={() => toggleCourse(course.id)} style={{ cursor: 'pointer' }}>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">{course.theme}</p>
              <p className="font-black text-slate-900 dark:text-white truncate">{course.title}</p>
              <p className="text-xs text-slate-400 truncate">{course.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleStatus(course.id, course.status)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${course.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                title={course.status === 'published' ? 'Passer en brouillon' : 'Publier'}
              >
                {course.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {course.status === 'published' ? 'Publié' : 'Brouillon'}
              </button>
              <button onClick={() => setEditingCourse(editingCourse === course.id ? null : course.id)} className={BTN_ICON} title="Modifier">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => deleteCourse(course.id)} className={`${BTN_ICON} hover:text-red-500`} title="Supprimer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Edit course form */}
          {editingCourse === course.id && (
            <div className="px-4 pb-4">
              <CourseForm
                initial={{ theme: course.theme, title: course.title, description: course.description, thumbnail: course.thumbnail }}
                onSave={form => saveCourse(course.id, form)}
                onCancel={() => setEditingCourse(null)}
                saving={saving}
              />
            </div>
          )}

          {/* Lessons */}
          {expanded.has(course.id) && (
            <div className="border-t border-slate-100 dark:border-slate-700">
              {course.lessons.map((lesson, li) => (
                <div key={lesson.id} className="border-b border-slate-50 dark:border-slate-700/50 last:border-b-0">

                  {/* Lesson header */}
                  <div className="flex items-center gap-3 px-4 py-3 pl-10">
                    {lesson.type === 'quiz' && (
                      <button onClick={() => toggleLesson(lesson.id)} className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                        {expandedLessons.has(lesson.id) ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    {lesson.type === 'video' && <span className="text-slate-400 text-xs w-5 text-center">▶</span>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{lesson.title}</p>
                      {lesson.type === 'video' && lesson.videoUrl && (
                        <p className="text-xs text-slate-400 truncate">{lesson.videoUrl}</p>
                      )}
                      {lesson.type === 'quiz' && (
                        <p className="text-xs text-slate-400">{lesson.questions?.length || 0} question(s)</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setEditingLesson(editingLesson === lesson.id ? null : lesson.id)} className={BTN_ICON}>
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => deleteLesson(lesson.id)} className={`${BTN_ICON} hover:text-red-500`}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Edit lesson form */}
                  {editingLesson === lesson.id && (
                    <div className="px-4 pb-3 pl-10">
                      <LessonForm
                        initial={{ title: lesson.title, type: lesson.type, video_url: lesson.videoUrl || '', duration: lesson.duration || '', description: lesson.description || '', key_points: lesson.keyPoints || [] }}
                        onSave={form => saveLesson(lesson.id, form)}
                        onCancel={() => setEditingLesson(null)}
                        saving={saving}
                      />
                    </div>
                  )}

                  {/* Questions */}
                  {lesson.type === 'quiz' && expandedLessons.has(lesson.id) && (
                    <div className="pl-16 pr-4 pb-3 space-y-2">
                      {lesson.questions?.map((q, qi) => (
                        <div key={q.id}>
                          {editingQuestion === q.id ? (
                            <QuestionForm
                              initial={{ text: q.text, options: q.options, correct: q.correct, explanation: q.explanation }}
                              onSave={form => saveQuestion(q.id, form)}
                              onCancel={() => setEditingQuestion(null)}
                              saving={saving}
                            />
                          ) : (
                            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
                              <span className="text-xs text-slate-400 font-bold shrink-0 mt-0.5">Q{qi + 1}</span>
                              <p className="flex-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{q.text}</p>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button onClick={() => setEditingQuestion(q.id)} className={BTN_ICON}><Pencil className="w-3 h-3" /></button>
                                <button onClick={() => deleteQuestion(q.id)} className={`${BTN_ICON} hover:text-red-500`}><Trash2 className="w-3 h-3" /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {addingQuestionTo === lesson.id ? (
                        <QuestionForm
                          onSave={form => addQuestion(lesson.id, form)}
                          onCancel={() => setAddingQuestionTo(null)}
                          saving={saving}
                        />
                      ) : (
                        <button onClick={() => setAddingQuestionTo(lesson.id)} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                          <Plus className="w-3 h-3" /> Ajouter une question
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add lesson */}
              <div className="px-4 py-3 pl-10">
                {addingLessonTo === course.id ? (
                  <LessonForm
                    onSave={form => addLesson(course.id, form)}
                    onCancel={() => setAddingLessonTo(null)}
                    saving={saving}
                  />
                ) : (
                  <button onClick={() => setAddingLessonTo(course.id)} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Ajouter une leçon
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
