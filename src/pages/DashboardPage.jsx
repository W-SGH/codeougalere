import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, CheckCircle, TrendingUp, BookOpen, Award, LogOut, Lock, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import ThemeToggle from '../components/ThemeToggle';
import { useCourses } from '../context/CoursesContext';

const DashboardPage = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { progress, completionPercent, studyHours, studyMinutes, avgScore, isCompleted } = useProgress();
  const { courses: COURSES } = useCourses();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');

  const firstName = profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Élève';
  const lastName = profile?.last_name || user?.user_metadata?.last_name || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  // Déterminer si un cours est déverrouillé (le premier est toujours accessible, les suivants nécessitent la complétion du précédent)
  function isCourseUnlocked(courseIndex) {
    if (isAdmin) return true;
    if (courseIndex === 0) return true;
    const prevCourse = COURSES[courseIndex - 1];
    return prevCourse?.lessons?.every(lesson => isCompleted(lesson.id));
  }

  function getCourseStatus(course, courseIndex) {
    if (!isCourseUnlocked(courseIndex)) return 'locked';
    const completed = course.lessons.filter(l => isCompleted(l.id)).length;
    if (completed === course.lessons.length) return 'done';
    if (completed > 0) return 'active';
    return 'todo';
  }

  function getFirstIncompleteLesson(course) {
    if (!course.lessons?.length) return null;
    return course.lessons.find(l => !isCompleted(l.id)) || course.lessons[0];
  }

  // Première leçon non complétée parmi tous les cours déverrouillés
  const nextLesson = (() => {
    for (let i = 0; i < COURSES.length; i++) {
      if (!isCourseUnlocked(i)) break;
      const lesson = COURSES[i].lessons.find(l => !isCompleted(l.id));
      if (lesson) return { courseId: COURSES[i].id, lessonId: lesson.id };
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-primary"><span className="material-symbols-outlined">directions_car</span></span>
            <span className="text-xl font-bold tracking-tight">Code ou galère</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'courses' ? 'bg-primary/10 text-primary dark:text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <BookOpen className="w-5 h-5" /> Mes Cours
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'stats' ? 'bg-primary/10 text-primary dark:text-primary font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <TrendingUp className="w-5 h-5" /> Statistiques
          </button>
          <Link
            to="/exam"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Award className="w-5 h-5" /> Examen blanc
          </Link>
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Home className="w-5 h-5" /> Retour à l'accueil
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center font-bold text-lg">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{firstName} {lastName}</p>
              <p className="text-xs text-slate-500">Premium</p>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-primary"><span className="material-symbols-outlined">directions_car</span></span>
            <span className="text-lg font-bold">Code ou galère</span>
          </Link>
          <ThemeToggle />
        </div>

        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">Bonjour, {firstName} 👋</h1>
            <p className="text-slate-500">Reprenez là où vous vous étiez arrêté.</p>
          </div>
          {nextLesson && (
            <Link
              to={`/player?c=${nextLesson.courseId}&l=${nextLesson.lessonId}`}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors text-sm shrink-0"
            >
              <PlayCircle className="w-4 h-4" />
              Reprendre
            </Link>
          )}
        </header>

        {/* Bouton Reprendre mobile */}
        {nextLesson && (
          <Link
            to={`/player?c=${nextLesson.courseId}&l=${nextLesson.lessonId}`}
            className="sm:hidden flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors text-sm mb-6"
          >
            <PlayCircle className="w-4 h-4" />
            Reprendre ma formation
          </Link>
        )}

        {/* Progress Overview */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2 md:mb-4">
              <div className="w-7 h-7 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <span className="text-[10px] md:text-sm font-bold text-slate-400 leading-tight">Progression</span>
            </div>
            <h3 className="text-xl md:text-3xl font-black">{completionPercent}%</h3>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-2 md:mt-4">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }}></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2 md:mb-4">
              <div className="w-7 h-7 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <span className="text-[10px] md:text-sm font-bold text-slate-400 leading-tight">Temps d'étude</span>
            </div>
            <h3 className="text-xl md:text-3xl font-black">{studyHours}h{studyMinutes > 0 ? <span className="text-base md:text-xl">{studyMinutes}m</span> : ''}</h3>
            <p className="hidden md:block text-sm text-slate-500 mt-2 font-medium">Temps total de visionnage</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2 md:mb-4">
              <div className="w-7 h-7 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/20 text-primary-dark dark:text-primary flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <span className="text-[10px] md:text-sm font-bold text-slate-400 leading-tight">Score moyen</span>
            </div>
            <h3 className="text-xl md:text-3xl font-black">{avgScore !== null ? `${avgScore}/5` : '—'}</h3>
            <p className="hidden md:block text-sm text-slate-500 mt-2 font-medium">
              {avgScore === null ? 'Aucun quiz complété' : avgScore >= 4 ? 'Excellent !' : avgScore >= 3 ? 'Bien, continuez !' : 'À améliorer'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        {activeTab === 'courses' && completionPercent === 100 && (
          <div className="mb-6 bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/40 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                <Award className="w-7 h-7 text-black" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Formation terminée</div>
                <h2 className="text-xl font-black mb-1">Félicitations, {firstName} !</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tu as complété l'intégralité de la formation <strong>Code ou Galère</strong>. Tu es prêt(e) pour l'examen.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-xl text-sm hover:bg-primary-dark transition-colors"
              >
                <Award className="w-4 h-4" />
                Imprimer le certificat
              </button>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Mes modules de formation</h2>
            <div className="space-y-4">
              {COURSES.map((course, index) => {
                const status = getCourseStatus(course, index);
                const completedLessons = course.lessons.filter(l => isCompleted(l.id)).length;
                const firstLesson = getFirstIncompleteLesson(course);

                if (status === 'locked') {
                  return (
                    <div key={course.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 opacity-60">
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-20 bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden relative shrink-0 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-slate-400 mb-1">{course.theme}</p>
                              <h3 className="font-bold text-lg text-slate-400">{course.title}</h3>
                            </div>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded shrink-0">Verrouillé</span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">Terminez le module précédent pour déverrouiller.</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (status === 'done') {
                  return (
                    <Link
                      key={course.id}
                      to={`/player?c=${course.id}&l=${course.lessons[0]?.id}`}
                      className="block bg-white dark:bg-slate-800 p-4 rounded-2xl border border-green-200 dark:border-green-800/40 bg-green-50/30 dark:bg-slate-800 hover:border-green-400 transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-20 bg-green-100 dark:bg-green-900/30 rounded-xl overflow-hidden relative shrink-0 flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-green-600 mb-1">{course.theme}</p>
                              <h3 className="font-bold text-lg">{course.title}</h3>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded shrink-0">Terminé</span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{completedLessons}/{course.lessons.length} leçons complétées</p>
                        </div>
                      </div>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={course.id}
                    to={`/player?c=${course.id}&l=${firstLesson.id}`}
                    className="block bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-20 bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden relative shrink-0">
                        {course.thumbnail && (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <PlayCircle className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-primary mb-1">{course.theme}</p>
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{course.title}</h3>
                          </div>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded shrink-0">
                            {status === 'active' ? 'En cours' : 'À commencer'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{course.description}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all"
                              style={{ width: `${(completedLessons / course.lessons.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-400 font-medium">{completedLessons}/{course.lessons.length}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Votre progression détaillée</h2>
            <div className="space-y-3">
              {COURSES.map((course, index) => {
                const completedLessons = course.lessons.filter(l => isCompleted(l.id)).length;
                const percent = Math.round((completedLessons / course.lessons.length) * 100);
                return (
                  <div key={course.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-400">{course.theme}</span>
                        <h4 className="font-bold text-sm">{course.title}</h4>
                      </div>
                      <span className="text-sm font-bold">{completedLessons}/{course.lessons.length}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 space-y-1">
                      {course.lessons.map(lesson => (
                        <div key={lesson.id} className="flex items-center gap-2 text-xs text-slate-500">
                          {isCompleted(lesson.id) ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600"></div>
                          )}
                          {lesson.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Bottom navigation mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 flex items-stretch">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold transition-colors ${activeTab === 'courses' ? 'text-primary' : 'text-slate-400'}`}
        >
          <BookOpen className="w-5 h-5" />
          Cours
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold transition-colors ${activeTab === 'stats' ? 'text-primary' : 'text-slate-400'}`}
        >
          <TrendingUp className="w-5 h-5" />
          Statistiques
        </button>
        <Link
          to="/exam"
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold text-slate-400"
        >
          <Award className="w-5 h-5" />
          Examen
        </Link>
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold text-slate-400"
        >
          <LogOut className="w-5 h-5" />
          Quitter
        </button>
      </nav>
    </div>
  );
};

export default DashboardPage;
