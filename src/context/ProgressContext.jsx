import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useCourses } from './CoursesContext'

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState({}) // { lessonId: { completed, score, watchedSeconds } }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProgress()
    } else {
      setProgress({})
      setLoading(false)
    }
  }, [user])

  async function loadProgress() {
    setLoading(true)
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)

    if (!error && data) {
      const map = {}
      data.forEach(row => {
        map[row.lesson_id] = {
          completed: row.completed,
          score: row.score,
          watchedSeconds: row.watched_seconds,
          updatedAt: row.updated_at
        }
      })
      setProgress(map)
    }
    setLoading(false)
  }

  async function markLessonCompleted(lessonId, extra = {}) {
    if (!user) return
    const { score, watchedSeconds } = extra

    const update = {
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      score: score ?? null,
      watched_seconds: watchedSeconds ?? null,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_progress')
      .upsert(update, { onConflict: 'user_id,lesson_id' })

    if (error) {
      console.error('[Progress] markLessonCompleted error:', error.message, error.code)
    } else {
      setProgress(prev => ({
        ...prev,
        [lessonId]: { completed: true, score, watchedSeconds }
      }))
    }
  }

  async function updateWatchProgress(lessonId, watchedSeconds) {
    if (!user) return
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: progress[lessonId]?.completed || false,
        watched_seconds: watchedSeconds,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' })

    if (error) {
      console.error('[Progress] updateWatchProgress error:', error.message, error.code)
    } else {
      setProgress(prev => ({
        ...prev,
        [lessonId]: { ...prev[lessonId], watchedSeconds }
      }))
    }
  }

  // Calcul des statistiques
  const { getAllLessons } = useCourses()
  const allLessons = getAllLessons()
  const completedCount = Object.values(progress).filter(p => p.completed).length
  const totalLessons = allLessons.length
  const completionPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const totalWatchedSeconds = Object.values(progress).reduce((sum, p) => sum + (p.watchedSeconds || 0), 0)
  const studyHours = Math.floor(totalWatchedSeconds / 3600)
  const studyMinutes = Math.floor((totalWatchedSeconds % 3600) / 60)

  const quizScores = Object.values(progress).filter(p => p.score !== null && p.score !== undefined)
  const avgScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((sum, p) => sum + p.score, 0) / quizScores.length)
    : null

  return (
    <ProgressContext.Provider value={{
      progress,
      loading,
      completedCount,
      totalLessons,
      completionPercent,
      studyHours,
      studyMinutes,
      avgScore,
      markLessonCompleted,
      updateWatchProgress,
      isCompleted: (lessonId) => progress[lessonId]?.completed === true,
      refreshProgress: loadProgress
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress doit être utilisé dans ProgressProvider')
  return ctx
}
