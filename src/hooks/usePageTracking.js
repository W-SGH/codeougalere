import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function getSessionId() {
  let id = sessionStorage.getItem('_sv_sid');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('_sv_sid', id);
  }
  return id;
}

export function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    // Exclure les pages admin du tracking
    if (location.pathname.startsWith('/admin')) return;
    supabase.from('page_views').insert({
      path: location.pathname,
      session_id: getSessionId(),
    }).then(() => {});
  }, [location.pathname]);
}
