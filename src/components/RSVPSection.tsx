import { useState, FormEvent } from 'react';

export default function RSVPSection() {
  const [formData, setFormData] = useState({
    nomeCognome: '',
    partecipazione: '',
    adulti: 1,
    bambini: 0,
    nomiPartecipanti: '',
    intolleranze: '',
    messaggio: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const INTOLLERANZE_VISIBILITY: 'onYes' | 'always' = 'onYes';
  const INTOLLERANZE_BEHAVIOR: 'hide' | 'disable' = 'hide';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const payload = {
        nomeCognome: formData.nomeCognome.trim(),
        partecipazione: formData.partecipazione.trim(),
        adulti: Number(formData.adulti) || 0,
        bambini: Number(formData.bambini) || 0,
        nomiPartecipanti: formData.nomiPartecipanti.trim(),
        intolleranze: formData.intolleranze.trim(),
        messaggio: formData.messaggio.trim(),
      };

      // Validazione lato client con messaggi chiari
      const newErrors: Record<string, string> = {};
      if (!payload.nomeCognome) newErrors.nomeCognome = 'Campo obbligatorio';
      if (!payload.partecipazione) newErrors.partecipazione = 'Seleziona un’opzione';
      if (!payload.messaggio) newErrors.messaggio = 'Campo obbligatorio';

      // Se partecipa, validare numeri adulti/bambini
      if (payload.partecipazione === 'Si') {
        if (payload.adulti < 1) newErrors.adulti = 'Inserisci almeno 1 adulto';
        if (payload.bambini < 0) newErrors.bambini = 'Inserisci 0 o più';
      } else {
        // Se non partecipa, azzeriamo i numeri per coerenza
        payload.adulti = 0;
        payload.bambini = 0;
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      } else {
        setErrors({});
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSubmitStatus('success');
      } else {
        console.error('RSVP error response:', data);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showIntolleranze = INTOLLERANZE_VISIBILITY === 'onYes'
    ? formData.partecipazione === 'Si'
    : formData.partecipazione !== 'No';

  return (
    <section id="rsvp" className="py-20 px-4 bg-neutral-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-4xl md:text-5xl mb-4 text-center text-neutral-800 animate-fade-in tracking-wide">
          Conferma la Tua Presenza
        </h2>
        <p className="text-center text-neutral-600 mb-2 text-lg animate-fade-in">
          Vi chiediamo gentilmente di confermare la vostra partecipazione
        </p>
        <p className="text-center text-neutral-700 font-medium mb-12 animate-fade-in">
          Entro il 15 Maggio 2026
        </p>

        {submitStatus === 'success' ? (
          <div className="bg-neutral-100 border border-neutral-300 text-neutral-800 px-4 py-3 rounded-lg text-center">
            Grazie, {formData.nomeCognome}! La tua risposta è stata registrata.
          </div>
        ) : (
          <form id="rsvp-form" onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 animate-slide-up">
            <div className="space-y-6">
              <div>
                <label htmlFor="nomeCognome" className="block text-neutral-700 font-medium mb-2">
                  Nome e Cognome <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="nomeCognome"
                  name="nomeCognome"
                  required
                  value={formData.nomeCognome}
                  onChange={(e) => setFormData({ ...formData, nomeCognome: e.target.value })}
                  aria-invalid={Boolean(errors.nomeCognome)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.nomeCognome ? 'border-red-500' : 'border-neutral-200'} focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300 outline-none transition-colors placeholder:text-neutral-400`}
                  placeholder="Mario Rossi"
                />
                {errors.nomeCognome && (
                  <p className="mt-2 text-sm text-red-600">{errors.nomeCognome}</p>
                )}
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-3">
                  Conferma Partecipazione <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2 sm:gap-3" aria-invalid={Boolean(errors.partecipazione)}>
                  <div className="w-1/2">
                    <input
                      id="partecipazione-si"
                      type="radio"
                      name="partecipazione"
                      value="Si"
                      required
                      checked={formData.partecipazione === 'Si'}
                      onChange={(e) => setFormData({ ...formData, partecipazione: e.target.value })}
                      className="sr-only peer"
                    />
                    <label
                       htmlFor="partecipazione-si"
                      className="inline-flex items-center justify-center w-full px-3 py-2 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer transition peer-checked:bg-sage peer-checked:text-white peer-checked:border-sage text-sm sm:text-base text-center"
                    >
                      Sì, parteciperò
                    </label>
                  </div>
                  <div className="w-1/2">
                    <input
                      id="partecipazione-no"
                      type="radio"
                      name="partecipazione"
                      value="No"
                      required
                      checked={formData.partecipazione === 'No'}
                      onChange={(e) => setFormData({
                        ...formData,
                        partecipazione: e.target.value,
                        // Pulisce intolleranze quando selezionato "No"
                        intolleranze: ''
                      })}
                      className="sr-only peer"
                    />
                    <label
                       htmlFor="partecipazione-no"
                      className="inline-flex items-center justify-center w-full px-3 py-2 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer transition peer-checked:bg-sage peer-checked:text-white peer-checked:border-sage text-sm sm:text-base text-center"
                    >
                      No, non potrò partecipare
                    </label>
                  </div>
                </div>
                {(formData.partecipazione === 'Si' || formData.partecipazione === 'No') && (
                  <p className="mt-2 text-sm text-neutral-500">
                    {formData.partecipazione === 'Si' && 'Ottimo! Indica il numero di adulti e bambini e i nomi dei partecipanti (con età dei bambini).'}
                    {formData.partecipazione === 'No' && 'Grazie per averci avvisato. Puoi lasciare un messaggio per gli sposi.'}
                  </p>
                )}
                {errors.partecipazione && (
                  <p className="mt-2 text-sm text-red-600">{errors.partecipazione}</p>
                )}
              </div>

              {formData.partecipazione === 'Si' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="adulti" className="block text-neutral-700 font-medium mb-2">
                        Numero di Adulti <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        id="adulti"
                        name="adulti"
                        min={1}
                        required
                        value={formData.adulti}
                        onChange={(e) => setFormData({ ...formData, adulti: Number(e.target.value) })}
                        aria-invalid={Boolean(errors.adulti)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.adulti ? 'border-red-500' : 'border-neutral-200'} focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300 outline-none transition-colors placeholder:text-neutral-400`}
                        placeholder="Es. 2"
                      />
                      {errors.adulti && (
                        <p className="mt-2 text-sm text-red-600">{errors.adulti}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="bambini" className="block text-neutral-700 font-medium mb-2">
                        Numero di Bambini <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        id="bambini"
                        name="bambini"
                        min={0}
                        required
                        value={formData.bambini}
                        onChange={(e) => setFormData({ ...formData, bambini: Number(e.target.value) })}
                      aria-invalid={Boolean(errors.bambini)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.bambini ? 'border-red-500' : 'border-neutral-200'} focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300 outline-none transition-colors placeholder:text-neutral-400`}
                        placeholder="Es. 1"
                      />
                      <p className="mt-2 text-sm text-neutral-500">Inserisci il numero di bambini (usa 0 se nessuno).</p>
                      {errors.bambini && (
                        <p className="mt-2 text-sm text-red-600">{errors.bambini}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="nomiPartecipanti" className="block text-neutral-700 font-medium mb-2">
                      Nomi dei Partecipanti (e età dei bambini)
                    </label>
                     <textarea
                       id="nomiPartecipanti"
                       name="nomiPartecipanti"
                       rows={3}
                       value={formData.nomiPartecipanti}
                       onChange={(e) => setFormData({ ...formData, nomiPartecipanti: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300 outline-none transition-colors resize-none placeholder:text-neutral-400"
                       placeholder="Es. Giacomo Rossi, Giulia Bianchi, Leo (5 anni), Sofia (10 anni)"
                     />
                  </div>
                </div>
              )}

              <div
                className={
                  INTOLLERANZE_BEHAVIOR === 'hide'
                    ? `transition-all duration-300 ${showIntolleranze ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'} overflow-hidden`
                    : ''
                }
                aria-hidden={INTOLLERANZE_BEHAVIOR === 'hide' ? (!showIntolleranze) : false}
              >
                <label htmlFor="intolleranze" className="block text-neutral-700 font-medium mb-2">
                  Intolleranze o Allergie Alimentari
                </label>
                <input
                  type="text"
                  id="intolleranze"
                  name="intolleranze"
                  value={formData.intolleranze}
                  onChange={(e) => setFormData({ ...formData, intolleranze: e.target.value })}
                  disabled={INTOLLERANZE_BEHAVIOR === 'disable' && !showIntolleranze}
                  aria-disabled={INTOLLERANZE_BEHAVIOR === 'disable' && !showIntolleranze}
                  tabIndex={INTOLLERANZE_BEHAVIOR === 'hide' && !showIntolleranze ? -1 : 0}
                  className={`w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300 outline-none transition-colors placeholder:text-neutral-400 ${INTOLLERANZE_BEHAVIOR === 'disable' && !showIntolleranze ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : ''}`}
                  placeholder="Es. Intolleranza al lattosio, allergia alle noci..."
                />
                {INTOLLERANZE_BEHAVIOR === 'disable' && !showIntolleranze && (
                  <p className="mt-2 text-sm text-neutral-500">Il campo intolleranze è necessario solo se confermi la partecipazione.</p>
                )}
              </div>

              <div>
                <label htmlFor="messaggio" className="block text-neutral-700 font-medium mb-2">
                  Messaggio per gli Sposi <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="messaggio"
                  name="messaggio"
                  rows={4}
                  required
                  value={formData.messaggio}
                  onChange={(e) => setFormData({ ...formData, messaggio: e.target.value })}
                  aria-invalid={Boolean(errors.messaggio)}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.messaggio ? 'border-red-500' : 'border-neutral-300'} focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300 outline-none transition-colors resize-none`}
                  placeholder="Condividi i tuoi auguri e pensieri..."
                />
                {errors.messaggio && (
                  <p className="mt-2 text-sm text-red-600">{errors.messaggio}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium py-4 px-6 rounded-full transition-colors flex items-center justify-center gap-2 tracking-[0.06em]"
              >
                {isSubmitting ? 'Invio in corso…' : 'Invia Conferma'}
              </button>

              <div aria-live="polite">
                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-center">
                    Si è verificato un errore. Controlla i campi obbligatori e riprova.
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
