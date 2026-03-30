import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, CreditCard, PlayCircle, TrendingUp, LogOut, ArrowUpRight, Search, CheckCircle, XCircle, RefreshCw, Percent, Trash2, Download, Megaphone, BookOpen, BarChart2 } from 'lucide-react';
import CourseManager from '../components/admin/CourseManager';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useCourses } from '../context/CoursesContext';


export default function AdminDashboard() {
  const { signOut } = useAuth();
  const { courses } = useCourses();
  const TOTAL_LESSONS = courses.flatMap(c => c.lessons).length;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, students: 0, completionRate: 0, lessonsCompleted: 0 });
  const [sales, setSales] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirm, setConfirm] = useState(null); // { userId, name, action: 'grant'|'revoke' }
  const [promoCodes, setPromoCodes] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [announce, setAnnounce] = useState({ subject: '', message: '' });
  const [announceStatus, setAnnounceStatus] = useState(null); // null | 'sending' | { sent, errors, total }
  const [promoFormOpen, setPromoFormOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: '', discount_percent: 20, expires_preset: '48h', max_uses: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Ventes
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('*, profiles(first_name, last_name)')
        .order('created_at', { ascending: false });


      if (purchases) {
        setSales(purchases);
        const paid = purchases.filter(p => p.status === 'paid');
        const revenue = paid.reduce((sum, p) => sum + (p.amount || 4900), 0) / 100;
        setStats(prev => ({ ...prev, revenue, students: paid.length }));
      }

      // Élèves avec progression
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profiles) {
        // Charger la progression pour chaque élève
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('user_id, completed');

        const progressByUser = {};
        (progressData || []).forEach(p => {
          if (!progressByUser[p.user_id]) progressByUser[p.user_id] = 0;
          if (p.completed) progressByUser[p.user_id]++;
        });

        const enriched = profiles.map(p => ({
          ...p,
          completedLessons: progressByUser[p.id] || 0,
          completionPercent: Math.round(((progressByUser[p.id] || 0) / TOTAL_LESSONS) * 100)
        }));
        setStudents(enriched);

        // Taux de complétion global
        const finishers = enriched.filter(s => s.completedLessons >= TOTAL_LESSONS).length;
        const withAccess = enriched.filter(s => s.has_access).length;
        const completionRate = withAccess > 0 ? Math.round((finishers / withAccess) * 100) : 0;
        const lessonsCompleted = (progressData || []).filter(p => p.completed).length;
        setStats(prev => ({ ...prev, completionRate, lessonsCompleted }));
      }
      // Visites (30 derniers jours)
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data: views } = await supabase
        .from('page_views')
        .select('path, visited_at, session_id')
        .gte('visited_at', since.toISOString())
        .order('visited_at', { ascending: true });
      if (views) setPageViews(views);

      const { data: promos } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (promos) setPromoCodes(promos);
    } catch (err) {
      console.error('Erreur admin:', err);
    } finally {
      setLoading(false);
    }
  }

  async function confirmToggleAccess() {
    if (!confirm) return;
    const newAccess = confirm.action === 'grant';
    const { error } = await supabase
      .from('profiles')
      .update({ has_access: newAccess })
      .eq('id', confirm.userId);
    if (!error) {
      setStudents(prev => prev.map(s => s.id === confirm.userId ? { ...s, has_access: newAccess } : s));
    }
    setConfirm(null);
  }

  async function toggleAdmin(userId, currentAdmin) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentAdmin })
      .eq('id', userId);
    if (!error) {
      setStudents(prev => prev.map(s => s.id === userId ? { ...s, is_admin: !currentAdmin } : s));
    }
  }

  async function createPromoCode() {
    const code = promoForm.code.trim().toUpperCase();
    if (!code || !promoForm.discount_percent) return;

    let expires_at = null;
    const now = Date.now();
    if (promoForm.expires_preset === '24h') expires_at = new Date(now + 24 * 3600000).toISOString();
    else if (promoForm.expires_preset === '48h') expires_at = new Date(now + 48 * 3600000).toISOString();
    else if (promoForm.expires_preset === '72h') expires_at = new Date(now + 72 * 3600000).toISOString();
    else if (promoForm.expires_preset === '7j') expires_at = new Date(now + 7 * 24 * 3600000).toISOString();

    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code,
        discount_percent: Number(promoForm.discount_percent),
        expires_at,
        max_uses: promoForm.max_uses ? Number(promoForm.max_uses) : null,
      })
      .select()
      .single();

    if (!error && data) {
      setPromoCodes(prev => [data, ...prev]);
      setPromoForm({ code: '', discount_percent: 20, expires_preset: '48h', max_uses: '' });
      setPromoFormOpen(false);
    }
  }

  async function togglePromoActive(id, current) {
    const { error } = await supabase.from('promo_codes').update({ active: !current }).eq('id', id);
    if (!error) setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, active: !current } : p));
  }

  async function deletePromoCode(id) {
    if (!window.confirm('Supprimer ce code ?')) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (!error) setPromoCodes(prev => prev.filter(p => p.id !== id));
  }

  function exportCSV() {
    const headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Accès', 'Leçons complétées', 'Progression (%)', 'Inscrit le'];
    const rows = students.map(s => [
      s.first_name || '',
      s.last_name || '',
      s.email || '',
      s.phone || '',
      s.has_access ? 'Oui' : 'Non',
      s.completedLessons,
      s.completionPercent,
      s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eleves_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatDate(d) {
    if (!d) return '—';
    const date = new Date(d);
    const diff = Date.now() - date;
    const min = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (min < 60) return `Il y a ${min} min`;
    if (h < 24) return `Il y a ${h}h`;
    if (days < 30) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  }

  function getInitials(p) {
    return `${p?.first_name?.[0] || ''}${p?.last_name?.[0] || ''}`.toUpperCase() || '?';
  }

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return `${s.first_name || ''} ${s.last_name || ''} ${s.email || ''}`.toLowerCase().includes(q);
  });

  const filteredSales = sales.filter(s => {
    const q = searchQuery.toLowerCase();
    const student = students.find(st => st.id === s.user_id);
    return `${s.profiles?.first_name || ''} ${s.profiles?.last_name || ''} ${student?.email || ''}`.toLowerCase().includes(q);
  });

  const navItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'analytics', label: 'Visites', icon: BarChart2 },
    { id: 'students', label: 'Élèves', icon: Users },
    { id: 'promos', label: 'Codes promo', icon: Percent },
    { id: 'sales', label: 'Ventes', icon: CreditCard },
    { id: 'announce', label: 'Annonces', icon: Megaphone },
    { id: 'courses', label: 'Cours', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white h-screen sticky top-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-primary"><span className="material-symbols-outlined">shield_person</span></span>
            <span className="text-xl font-bold tracking-tight">Admin<span className="text-primary">Panel</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === item.id ? 'bg-primary text-black font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors mb-2">
            <PlayCircle className="w-5 h-5" /> Voir le cours
          </Link>
          <button
            onClick={async () => { await signOut(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black mb-1">
              {activeTab === 'overview' && 'Vue d\'ensemble'}
              {activeTab === 'students' && 'Gestion des élèves'}
              {activeTab === 'promos' && 'Codes promo'}
              {activeTab === 'sales' && 'Historique des ventes'}
              {activeTab === 'announce' && 'Envoyer une annonce'}
              {activeTab === 'analytics' && 'Visites du site'}
            {activeTab === 'courses' && 'Gestion des cours'}
            </h1>
            <p className="text-slate-500">{students.length} utilisateurs · {sales.filter(s => s.status === 'paid').length} ventes confirmées</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm w-56 dark:text-white"
              />
            </div>
            <button onClick={loadData} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* KPI cards — toujours visibles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Revenus totaux', value: `${stats.revenue.toLocaleString('fr-FR')} €`, sub: 'Paiements confirmés', icon: ArrowUpRight, color: 'bg-green-100 text-green-600' },
            { label: 'Élèves payants', value: stats.students, sub: 'Accès actif', icon: Users, color: 'bg-blue-100 text-blue-600' },
            { label: 'Taux de fin', value: `${stats.completionRate}%`, sub: 'Formation terminée', icon: CheckCircle, color: 'bg-primary/20 text-primary-dark' },
            { label: 'Leçons validées', value: stats.lessonsCompleted.toLocaleString(), sub: `Sur ${TOTAL_LESSONS} leçons/élève`, icon: PlayCircle, color: 'bg-purple-100 text-purple-600' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{kpi.label}</span>
                <div className={`w-7 h-7 rounded-lg ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="text-2xl font-black">{loading ? '...' : kpi.value}</h3>
              <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <>
          {/* Graphique revenus */}
          {(() => {
            const paidSales = sales.filter(s => s.status === 'paid');
            const weeks = [];
            for (let i = 7; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i * 7);
              const weekStart = new Date(d);
              weekStart.setDate(d.getDate() - d.getDay());
              weekStart.setHours(0, 0, 0, 0);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 7);
              const revenue = paidSales
                .filter(s => { const t = new Date(s.created_at); return t >= weekStart && t < weekEnd; })
                .reduce((sum, s) => sum + (s.amount || 4900), 0) / 100;
              const label = weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
              weeks.push({ label, revenue });
            }
            const maxRevenue = Math.max(...weeks.map(w => w.revenue), 1);
            return (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold">Revenus hebdomadaires</h2>
                  <span className="text-xs text-slate-400 font-medium">8 dernières semaines</span>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {weeks.map((w, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-500">{w.revenue > 0 ? `${w.revenue}€` : ''}</span>
                      <div className="w-full rounded-t-lg bg-primary/20 relative" style={{ height: '80px' }}>
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all duration-500"
                          style={{ height: `${(w.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 text-center leading-tight">{w.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dernières ventes */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="font-bold">Dernières ventes</h2>
                <button onClick={() => setActiveTab('sales')} className="text-xs text-primary font-bold">Voir tout</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {sales.slice(0, 5).map(sale => (
                  <div key={sale.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                        {getInitials(sale.profiles)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{sale.profiles?.first_name} {sale.profiles?.last_name}</p>
                        <p className="text-xs text-slate-400">{formatDate(sale.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{((sale.amount || 4900) / 100).toFixed(0)} €</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${sale.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {sale.status === 'paid' ? 'Payé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
                {sales.length === 0 && !loading && <p className="p-6 text-center text-slate-400 text-sm">Aucune vente pour le moment.</p>}
              </div>
            </div>

            {/* Élèves récents */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="font-bold">Élèves récents</h2>
                <button onClick={() => setActiveTab('students')} className="text-xs text-primary font-bold">Voir tout</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {students.slice(0, 5).map(s => (
                  <div key={s.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center text-xs font-bold">
                        {getInitials(s)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{s.first_name || s.email?.split('@')[0]} {s.last_name || ''}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-16 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${s.completionPercent}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-400">{s.completionPercent}%</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.has_access ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {s.has_access ? 'Accès' : 'Pas d\'accès'}
                    </span>
                  </div>
                ))}
                {students.length === 0 && !loading && <p className="p-6 text-center text-slate-400 text-sm">Aucun élève pour le moment.</p>}
              </div>
            </div>
          </div>
          </>
        )}

        {/* Onglet Élèves */}
        {activeTab === 'students' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <p className="text-sm text-slate-500">{filteredStudents.length} élève{filteredStudents.length > 1 ? 's' : ''}</p>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Chargement...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Aucun élève trouvé.</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold">Élève</th>
                      <th className="p-4 font-bold">Téléphone</th>
                      <th className="p-4 font-bold">Progression</th>
                      <th className="p-4 font-bold">Accès</th>
                      <th className="p-4 font-bold">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                    {filteredStudents.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center text-xs font-bold shrink-0">
                              {getInitials(s)}
                            </div>
                            <div>
                              <p className="font-medium">{s.first_name} {s.last_name}</p>
                              <p className="text-xs text-slate-400">{s.email || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-400 text-xs">{s.phone || '—'}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${s.completionPercent}%` }}></div>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">{s.completedLessons}/{TOTAL_LESSONS}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {sales.some(sale => sale.user_id === s.id && sale.status === 'paid') ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-green-100 text-green-700">
                              <CheckCircle className="w-3.5 h-3.5" /> Payé
                            </span>
                          ) : (
                            <button
                              onClick={() => setConfirm({ userId: s.id, name: `${s.first_name} ${s.last_name}`, action: s.has_access ? 'revoke' : 'grant' })}
                              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${s.has_access ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-slate-100 text-slate-500 hover:bg-green-100 hover:text-green-700'}`}
                            >
                              {s.has_access ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              {s.has_access ? 'Actif' : 'Inactif'}
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-slate-400 text-xs">{formatDate(s.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Onglet Codes promo */}
        {activeTab === 'promos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500">{promoCodes.length} code{promoCodes.length > 1 ? 's' : ''} créé{promoCodes.length > 1 ? 's' : ''}</p>
              <button
                onClick={() => setPromoFormOpen(v => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-black text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors"
              >
                <Percent className="w-4 h-4" />
                Nouveau code
              </button>
            </div>

            {promoFormOpen && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold mb-4">Créer un code promo</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Code</label>
                    <input
                      type="text"
                      value={promoForm.code}
                      onChange={e => setPromoForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                      placeholder="EX: RENTRE25"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm font-mono font-bold focus:ring-primary focus:border-primary dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Réduction (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={promoForm.discount_percent}
                      onChange={e => setPromoForm(p => ({ ...p, discount_percent: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:ring-primary focus:border-primary dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Expire dans</label>
                    <select
                      value={promoForm.expires_preset}
                      onChange={e => setPromoForm(p => ({ ...p, expires_preset: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:ring-primary focus:border-primary dark:text-white"
                    >
                      <option value="24h">24 heures</option>
                      <option value="48h">48 heures</option>
                      <option value="72h">72 heures</option>
                      <option value="7j">7 jours</option>
                      <option value="never">Jamais</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nb. utilisations max <span className="font-normal">(vide = illimité)</span></label>
                    <input
                      type="number"
                      min="1"
                      value={promoForm.max_uses}
                      onChange={e => setPromoForm(p => ({ ...p, max_uses: e.target.value }))}
                      placeholder="Illimité"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:ring-primary focus:border-primary dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPromoFormOpen(false)}
                    className="flex-1 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={createPromoCode}
                    disabled={!promoForm.code.trim() || !promoForm.discount_percent}
                    className="flex-1 py-2 bg-primary text-black rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-50 transition-colors"
                  >
                    Créer le code
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              {promoCodes.length === 0 ? (
                <p className="p-8 text-center text-slate-400 text-sm">Aucun code promo créé.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">Code</th>
                        <th className="p-4 font-bold">Réduction</th>
                        <th className="p-4 font-bold">Expire le</th>
                        <th className="p-4 font-bold">Utilisations</th>
                        <th className="p-4 font-bold">Statut</th>
                        <th className="p-4 font-bold"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                      {promoCodes.map(p => {
                        const expired = p.expires_at && new Date(p.expires_at) < new Date();
                        const exhausted = p.max_uses && p.used_count >= p.max_uses;
                        const isValid = p.active && !expired && !exhausted;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-4 font-mono font-bold">{p.code}</td>
                            <td className="p-4 font-bold text-primary">{p.discount_percent}%</td>
                            <td className="p-4 text-slate-500 text-xs">
                              {p.expires_at
                                ? <span className={expired ? 'text-red-500' : ''}>{new Date(p.expires_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                : <span className="text-slate-400">Jamais</span>
                              }
                            </td>
                            <td className="p-4 text-slate-500 text-xs">
                              {p.used_count}{p.max_uses ? `/${p.max_uses}` : ''}
                              {exhausted && <span className="ml-1 text-red-500">(épuisé)</span>}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => togglePromoActive(p.id, p.active)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isValid ? 'bg-green-100 text-green-700 hover:bg-slate-100 hover:text-slate-500' : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-700'}`}
                              >
                                {isValid ? 'Actif' : 'Inactif'}
                              </button>
                            </td>
                            <td className="p-4">
                              <button onClick={() => deletePromoCode(p.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Ventes */}
        {activeTab === 'sales' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Chargement...</div>
              ) : filteredSales.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Aucune vente trouvée.</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold">Client</th>
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">Montant</th>
                      <th className="p-4 font-bold">Stripe</th>
                      <th className="p-4 font-bold">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                    {filteredSales.map(sale => (
                      <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                              {getInitials(sale.profiles)}
                            </div>
                            <div>
                              <p className="font-medium">{sale.profiles?.first_name} {sale.profiles?.last_name}</p>
                              <p className="text-xs text-slate-400">{students.find(s => s.id === sale.user_id)?.email || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 text-xs">{formatDate(sale.created_at)}</td>
                        <td className="p-4 font-bold">{((sale.amount || 4900) / 100).toFixed(2)} €</td>
                        <td className="p-4">
                          {sale.stripe_session_id ? (
                            <span className="text-xs text-slate-400 font-mono">{sale.stripe_session_id.slice(0, 16)}...</span>
                          ) : '—'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${sale.status === 'paid' ? 'bg-green-100 text-green-700' : sale.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {sale.status === 'paid' ? 'Payé' : sale.status === 'failed' ? 'Échoué' : 'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        {/* Onglet Visites */}
        {activeTab === 'analytics' && (() => {
          const totalViews = pageViews.length;
          const uniqueSessions = new Set(pageViews.map(v => v.session_id).filter(Boolean)).size;

          // Visites par jour (30 derniers jours)
          const dayMap = {};
          for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            dayMap[key] = 0;
          }
          pageViews.forEach(v => {
            const key = v.visited_at.slice(0, 10);
            if (key in dayMap) dayMap[key]++;
          });
          const days = Object.entries(dayMap);
          const maxDay = Math.max(...days.map(([, c]) => c), 1);

          // Top pages
          const pathMap = {};
          pageViews.forEach(v => { pathMap[v.path] = (pathMap[v.path] || 0) + 1; });
          const topPages = Object.entries(pathMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

          const pageLabels = {
            '/': 'Accueil',
            '/tarifs': 'Tarifs',
            '/preinscription': 'Préinscription',
            '/login': 'Connexion',
            '/dashboard': 'Dashboard',
            '/player': 'Cours',
            '/exam': 'Examen',
          };

          return (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Pages vues (30j)</p>
                  <p className="text-3xl font-black">{loading ? '...' : totalViews.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Sessions uniques (30j)</p>
                  <p className="text-3xl font-black">{loading ? '...' : uniqueSessions.toLocaleString()}</p>
                </div>
              </div>

              {/* Graphique journalier */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold">Visites par jour</h2>
                  <span className="text-xs text-slate-400 font-medium">30 derniers jours</span>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {days.map(([date, count], i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className="w-full bg-primary/80 rounded-t transition-all group-hover:bg-primary"
                        style={{ height: `${Math.max((count / maxDay) * 100, count > 0 ? 4 : 0)}%` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                        {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} : {count}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>{new Date(days[0][0]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  <span>Aujourd'hui</span>
                </div>
              </div>

              {/* Top pages */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="font-bold">Pages les plus visitées</h2>
                </div>
                {topPages.length === 0 ? (
                  <p className="p-6 text-slate-500 text-sm">Aucune donnée — les visites apparaîtront ici après déploiement.</p>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">Page</th>
                        <th className="p-4 font-bold text-right">Vues</th>
                        <th className="p-4 font-bold w-40">Proportion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                      {topPages.map(([path, count]) => (
                        <tr key={path} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="p-4 font-medium">
                            <span className="text-slate-400 mr-1">{path}</span>
                            {pageLabels[path] && <span className="text-xs text-slate-500">({pageLabels[path]})</span>}
                          </td>
                          <td className="p-4 text-right font-bold">{count}</td>
                          <td className="p-4">
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(count / totalViews) * 100}%` }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
        })()}

        {/* Onglet Cours */}
        {activeTab === 'courses' && <CourseManager />}

        {/* Onglet Annonces */}
        {activeTab === 'announce' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
              <p className="text-sm text-slate-500">Envoie un email à tous les élèves ayant accès ({students.filter(s => s.has_access && s.email).length} destinataires).</p>
              <div>
                <label className="block text-sm font-bold mb-1">Sujet</label>
                <input
                  type="text"
                  value={announce.subject}
                  onChange={e => setAnnounce(a => ({ ...a, subject: e.target.value }))}
                  placeholder="Ex : Nouvelle vidéo disponible 🎉"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Message</label>
                <textarea
                  rows={8}
                  value={announce.message}
                  onChange={e => setAnnounce(a => ({ ...a, message: e.target.value }))}
                  placeholder="Écris ton message ici..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              {announceStatus && announceStatus !== 'sending' && (
                <div className={`p-4 rounded-xl text-sm font-medium ${announceStatus.errors === 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                  ✓ {announceStatus.sent} email{announceStatus.sent > 1 ? 's' : ''} envoyé{announceStatus.sent > 1 ? 's' : ''}
                  {announceStatus.errors > 0 && ` · ${announceStatus.errors} échec(s)`}
                </div>
              )}
              <button
                disabled={!announce.subject.trim() || !announce.message.trim() || announceStatus === 'sending'}
                onClick={async () => {
                  setAnnounceStatus('sending');
                  try {
                    const { data, error } = await supabase.functions.invoke('send-announcement', {
                      body: { subject: announce.subject, message: announce.message }
                    });
                    if (error) throw error;
                    setAnnounceStatus(data);
                    setAnnounce({ subject: '', message: '' });
                  } catch {
                    setAnnounceStatus({ sent: 0, errors: 1, total: 0 });
                  }
                }}
                className="w-full py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {announceStatus === 'sending' ? 'Envoi en cours...' : 'Envoyer à tous les élèves'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Popup de confirmation */}
      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {confirm.action === 'revoke' ? 'Révoquer l\'accès' : 'Donner l\'accès'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {confirm.action === 'revoke'
                ? <>Voulez-vous révoquer l'accès de <span className="font-bold text-slate-900 dark:text-white">{confirm.name}</span> ? Il ne pourra plus accéder aux cours.</>
                : <>Voulez-vous donner l'accès à <span className="font-bold text-slate-900 dark:text-white">{confirm.name}</span> ? Il pourra accéder à tous les cours.</>
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmToggleAccess}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-colors ${confirm.action === 'revoke' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                {confirm.action === 'revoke' ? 'Révoquer' : 'Donner l\'accès'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
