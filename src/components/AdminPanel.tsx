import React, { useEffect } from 'react';

export default function AdminPanel() {
  // Modalità standby: pannello solo informativo, senza chiamate API o azioni.
  useEffect(() => {
    const hash = window.location.hash?.replace('#','');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-semibold">Pannello di Controllo</h1>

        <div className="flex gap-3">
          <a href="#status" className="px-3 py-2 rounded bg-neutral-800 text-white">Stato</a>
          <a href="#approve" className="px-3 py-2 rounded bg-green-700 text-white">Approvazione</a>
        </div>

        <section id="status" className="border rounded p-4">
          <h2 className="text-xl mb-3">Stato contenuti</h2>
          <p className="text-neutral-700">
            La funzionalità dei ricordi è attualmente in standby. Qui verranno mostrati
            i dati di stato quando la funzionalità sarà riattivata.
          </p>
        </section>

        <section id="approve" className="border rounded p-4">
          <h2 className="text-xl mb-3">Approvazione</h2>
          <p className="text-neutral-700">
            Le richieste di approvazione dei ricordi sono sospese. Non ci sono
            elementi da approvare al momento.
          </p>
        </section>

        {/* Sezioni storiche e caricamento rimosse in modalità standby */}
      </div>
    </div>
  );
}