import React, { useState, useRef, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import _ReactPlayer from 'react-player';
const ReactPlayer = _ReactPlayer.default ?? _ReactPlayer;
import { ArrowLeft, PlayCircle, CheckCircle, ListVideo, MessageSquare, ChevronRight, Lock, PenLine } from 'lucide-react';
import { useCourses } from '../context/CoursesContext';
import { useProgress } from '../context/ProgressContext';

// --- Composant Quiz ---
function Quiz({ lesson, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleAnswer(questionId, optionIndex) {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }

  function handleSubmit() {
    if (Object.keys(answers).length < lesson.questions.length) {
      alert('Veuillez répondre à toutes les questions avant de valider.');
      return;
    }
    setSubmitted(true);
    const score = lesson.questions.filter(q => answers[q.id] === q.correct).length;
    onComplete(score);
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-black text-white mb-2">{lesson.title}</h1>
      <p className="text-slate-400 mb-8">{lesson.questions.length} questions — Bonne chance !</p>

      <div className="space-y-8">
        {lesson.questions.map((q, qi) => {
          const userAnswer = answers[q.id];
          const isAnswered = userAnswer !== undefined;
          const isCorrect = userAnswer === q.correct;

          return (
            <div key={q.id} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h3 className="font-bold text-white mb-4">
                <span className="text-primary mr-2">Q{qi + 1}.</span>
                {q.text}
              </h3>
              <div className="space-y-3">
                {q.options.map((option, oi) => {
                  let cls = 'w-full text-left p-3 rounded-xl border transition-all text-sm font-medium ';
                  if (!submitted) {
                    cls += userAnswer === oi
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800';
                  } else {
                    if (oi === q.correct) {
                      cls += 'border-green-500 bg-green-500/10 text-green-400';
                    } else if (userAnswer === oi && oi !== q.correct) {
                      cls += 'border-red-500 bg-red-500/10 text-red-400';
                    } else {
                      cls += 'border-slate-700 text-slate-500';
                    }
                  }
                  return (
                    <button key={oi} className={cls} onClick={() => handleAnswer(q.id, oi)}>
                      <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][oi]}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className={`mt-4 p-3 rounded-xl text-sm ${isCorrect ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                  <span className="font-bold">{isCorrect ? '✓ Bonne réponse !' : '✗ Mauvaise réponse.'}</span>
                  <p className="mt-1 text-slate-300">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-8 w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors"
        >
          Valider mes réponses
        </button>
      ) : (
        <div className="mt-8 bg-slate-900 rounded-2xl p-6 border border-slate-800 text-center">
          <div className="text-4xl font-black text-white mb-2">
            {lesson.questions.filter(q => answers[q.id] === q.correct).length}/{lesson.questions.length}
          </div>
          <p className="text-slate-400 mb-4">
            {lesson.questions.filter(q => answers[q.id] === q.correct).length === lesson.questions.length
              ? '🎉 Parfait ! Toutes les réponses sont correctes !'
              : lesson.questions.filter(q => answers[q.id] === q.correct).length >= lesson.questions.length / 2
              ? '👍 Bon résultat, continuez comme ça !'
              : '📚 Relisez le cours et réessayez !'}
          </p>
          <p className="text-xs text-green-400">✓ Leçon marquée comme complétée</p>
        </div>
      )}
    </div>
  );
}

// --- Page principale ---
const CoursePlayerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { markLessonCompleted, updateWatchProgress, isCompleted, progress: lessonProgress } = useProgress();

  const { courses, getLesson, getNextLesson } = useCourses();
  const cParam = searchParams.get('c');
  const courseId = cParam !== null ? Number(cParam) : 1;
  const lessonId = searchParams.get('l') || '1-1';

  const lessonData = getLesson(courseId, lessonId);
  const { lesson, course } = lessonData || {};

  const playerRef = useRef(null);
  const hasSeekdRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showSidebar, setShowSidebar] = useState(false);
  const [notes, setNotes] = useState(() => localStorage.getItem(`notes_${lessonId}`) || '');
  const [videoCompleted, setVideoCompleted] = useState(isCompleted(lessonId));
  const [progress, setProgress] = useState(0);
  const lastSavedSecRef = useRef(0);
  const videoCompletedRef = useRef(isCompleted(lessonId));

  const handleProgress = useCallback(({ played, playedSeconds }) => {
    setProgress(played);
    const secs = Math.round(playedSeconds);

    // Marquer comme complété à 90%
    if (played > 0.9 && !videoCompletedRef.current) {
      videoCompletedRef.current = true;
      setVideoCompleted(true);
      markLessonCompleted(lessonId, { watchedSeconds: secs });
    }

    // Sauvegarder toutes les 15 secondes
    if (secs > 0 && secs - lastSavedSecRef.current >= 15) {
      lastSavedSecRef.current = secs;
      updateWatchProgress(lessonId, secs);
    }
  }, [lessonId, markLessonCompleted, updateWatchProgress]);

  async function handleQuizComplete(score) {
    await markLessonCompleted(lessonId, { score });
  }

  function navigateToLesson(targetCourseId, targetLessonId) {
    navigate(`/player?c=${targetCourseId}&l=${targetLessonId}`);
    setPlaying(false);
    setProgress(0);
    setVideoCompleted(false);
    videoCompletedRef.current = false;
    lastSavedSecRef.current = 0;
    hasSeekdRef.current = false;
    setActiveTab('description');
    setShowSidebar(false);
    setNotes(localStorage.getItem(`notes_${targetLessonId}`) || '');
  }

  const nextLesson = getNextLesson(courseId, lessonId);

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">Leçon introuvable</p>
          <Link to="/dashboard" className="text-primary hover:text-primary-dark">Retour au dashboard</Link>
        </div>
      </div>
    );
  }

  // Trouver l'index de la leçon courante dans le cours
  const currentLessonIndex = course.lessons.findIndex(l => l.id === lessonId);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Zone vidéo / quiz */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="p-4 flex items-center justify-between bg-black z-10 sticky top-0 border-b border-slate-900">
          <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Retour au Dashboard</span>
          </Link>
          <div className="text-sm font-bold text-primary">{course.theme}</div>
          <button
            onClick={() => setShowSidebar(v => !v)}
            className="md:hidden flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ListVideo className="w-4 h-4" />
            Cours
          </button>
        </header>

        {lesson.type === 'video' ? (
          <>
            {/* Lecteur vidéo */}
            <div className="w-full bg-slate-900 aspect-video relative">
              <ReactPlayer
                ref={playerRef}
                url={lesson.videoUrl}
                width="100%"
                height="100%"
                playing={playing}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onProgress={handleProgress}
                onEnded={() => {
                  setPlaying(false);
                  if (!videoCompleted) {
                    setVideoCompleted(true);
                    markLessonCompleted(lessonId);
                  }
                }}
                onReady={() => {
                  const savedSecs = lessonProgress[lessonId]?.watchedSeconds
                  if (savedSecs && savedSecs > 5 && !hasSeekdRef.current && !videoCompletedRef.current) {
                    hasSeekdRef.current = true
                    playerRef.current?.seekTo(savedSecs, 'seconds')
                  }
                }}
                controls={true}
                config={{
                  youtube: { playerVars: { showinfo: 1 } }
                }}
              />
            </div>

            {/* Infos sous la vidéo */}
            <div className="p-6 lg:p-10 max-w-4xl">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-black">{lesson.title}</h1>
                {videoCompleted && (
                  <span className="flex items-center gap-1.5 text-green-400 text-sm font-bold shrink-0">
                    <CheckCircle className="w-4 h-4" /> Complété
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-slate-800 mb-6">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-2 font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'description' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-white'}`}
                >
                  <ListVideo className="w-4 h-4" /> Description
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`px-4 py-2 font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'questions' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-white'}`}
                >
                  <MessageSquare className="w-4 h-4" /> À retenir
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'notes' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-white'}`}
                >
                  <PenLine className="w-4 h-4" /> Mes notes
                </button>
              </div>

              {activeTab === 'description' && (
                <div>
                  <p className="text-slate-400 text-lg leading-relaxed mb-6">{lesson.description}</p>
                  {nextLesson && videoCompleted && (
                    <button
                      onClick={() => navigateToLesson(nextLesson.courseId, nextLesson.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      Leçon suivante <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <p className="text-slate-400 text-sm mb-3">Tes notes sont sauvegardées automatiquement pour cette leçon.</p>
                  <textarea
                    value={notes}
                    onChange={e => {
                      setNotes(e.target.value);
                      localStorage.setItem(`notes_${lessonId}`, e.target.value);
                    }}
                    placeholder="Écris tes notes ici..."
                    rows={10}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              )}

              {activeTab === 'questions' && lesson.keyPoints && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Points clés à retenir :</h3>
                  <ul className="space-y-3">
                    {lesson.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-300">
                        <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          // Affichage du quiz
          <Quiz lesson={lesson} onComplete={handleQuizComplete} />
        )}
      </main>

      {/* Sidebar playlist */}
      <aside className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-80 lg:w-96 bg-slate-900 border-l border-slate-800 md:h-screen overflow-y-auto flex flex-col shrink-0`}>
        <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-lg font-bold mb-1">{course.title}</h2>
          <p className="text-xs text-slate-400">{course.theme}</p>
        </div>

        <div className="p-4 space-y-1">
          {courses.map((c, ci) => {
            const isCurrentCourse = c.id === courseId;
            return (
              <div key={c.id}>
                <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${isCurrentCourse ? 'text-primary' : 'text-slate-500'}`}>
                  {c.theme} — {c.title}
                </div>
                {c.lessons.map((l, li) => {
                  const isActive = l.id === lessonId && c.id === courseId;
                  const done = isCompleted(l.id);

                  return (
                    <button
                      key={l.id}
                      onClick={() => navigateToLesson(c.id, l.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all mb-1 ${isActive ? 'bg-slate-800 border border-primary/30' : 'hover:bg-slate-800/60'}`}
                    >
                      <div className="flex gap-3 items-start">
                        {done ? (
                          <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        ) : isActive ? (
                          <PlayCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-600 shrink-0 mt-0.5"></div>
                        )}
                        <div>
                          <h4 className={`text-sm font-medium ${isActive ? 'text-white' : done ? 'text-slate-400' : 'text-slate-300'}`}>
                            {l.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">{l.duration}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
};

export default CoursePlayerPage;
