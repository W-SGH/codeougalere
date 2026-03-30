import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { COURSES as STATIC_COURSES } from '../data/courses'
import { useAuth } from './AuthContext'

const Ctx = createContext(null)

function assemble(coursesData, lessonsData, questionsData) {
  return [...coursesData]
    .sort((a, b) => a.position - b.position)
    .map(course => ({
      id: course.id,
      theme: course.theme,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      status: course.status || 'published',
      lessons: [...(lessonsData || [])]
        .filter(l => l.course_id === course.id)
        .sort((a, b) => a.position - b.position)
        .map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          videoUrl: lesson.video_url,
          duration: lesson.duration,
          description: lesson.description,
          keyPoints: lesson.key_points || [],
          questions: lesson.type === 'quiz'
            ? [...(questionsData || [])]
                .filter(q => q.lesson_id === lesson.id)
                .sort((a, b) => a.position - b.position)
            : undefined,
        })),
    }))
}

export function CoursesProvider({ children }) {
  const { isAdmin } = useAuth()
  const [allCourses, setAllCourses] = useState(STATIC_COURSES)
  const [fromDB, setFromDB] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const [{ data: c, error }, { data: l }, { data: q }] = await Promise.all([
        supabase.from('courses').select('*'),
        supabase.from('lessons').select('*'),
        supabase.from('quiz_questions').select('*'),
      ])
      if (error) throw error
      if (c?.length) {
        setAllCourses(assemble(c, l || [], q || []))
        setFromDB(true)
      }
    } catch (e) {
      console.error('[Courses] load error:', e)
    } finally {
      setCoursesLoading(false)
    }
  }

  // Les admins voient tous les cours, les élèves seulement les publiés
  // Pas de status = published par défaut (cours statiques sans champ status)
  const courses = isAdmin ? allCourses : allCourses.filter(c => !c.status || c.status === 'published')

  return (
    <Ctx.Provider value={{ courses, allCourses, fromDB, coursesLoading, reload: load }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCourses() {
  const ctx = useContext(Ctx)
  const { courses } = ctx

  function getAllLessons() {
    return courses.flatMap(c => c.lessons.map(l => ({ ...l, courseId: c.id, courseTitle: c.title })))
  }

  function getLesson(courseId, lessonId) {
    const course = courses.find(c => c.id === Number(courseId))
    if (!course) return null
    const lesson = course.lessons.find(l => l.id === lessonId)
    if (!lesson) return null
    return { lesson, course }
  }

  function getNextLesson(courseId, lessonId) {
    const all = getAllLessons()
    const idx = all.findIndex(l => l.courseId === Number(courseId) && l.id === lessonId)
    return all[idx + 1] || null
  }

  return { ...ctx, getAllLessons, getLesson, getNextLesson }
}
