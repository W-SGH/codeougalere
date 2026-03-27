import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-primary mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Page introuvable</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-block bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
        >
          Retour à l'accueil →
        </Link>
      </div>
    </div>
  );
}
