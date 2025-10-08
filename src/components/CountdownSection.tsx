import { useState, useEffect, useMemo } from 'react';

export default function CountdownSection() {
  const weddingDate = useMemo(() => new Date('2026-09-25T11:00:00'), []);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = weddingDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);


    return () => clearInterval(timer);
  }, [weddingDate]);

  return (
    <section id="welcome" className="py-16 sm:py-20 lg:py-24 px-4 bg-neutral-100">
      <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto text-center">
        {/* Testo introduttivo tradotto e stilisticamente coerente */}
        <div className="mb-8">
          <h2 className="font-script text-4xl md:text-5xl text-neutral-700 animate-fade-in">
            Sei invitato!
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 mt-4 leading-relaxed max-w-md mx-auto animate-slide-up">
            Ci piacerebbe che fossi parte di questo momento così speciale per noi. Manca poco!
          </p>
        </div>

        <div className="flex justify-center space-x-3 md:space-x-4 mb-8 px-2">
          {[
            { value: timeLeft.days, label: 'GIORNI' },
            { value: timeLeft.hours, label: 'ORE' },
            { value: timeLeft.minutes, label: 'MINUTI' },
            { value: timeLeft.seconds, label: 'SECONDI' }
          ].map((item, index) => (
            <div key={index} className="text-center w-[70px] md:w-[90px]">
              <div className="bg-sage-300 rounded-full w-[46px] h-[46px] md:w-[60px] md:h-[60px] flex items-center justify-center mx-auto mb-[0.3em] md:mb-[0.5em]">
                <div className="text-[1.1rem] md:text-[1.5rem] font-bold text-white">
                  {String(item.value).padStart(2, '0')}
                </div>
              </div>
              <div className="text-[0.75rem] md:text-[1rem] text-neutral-600 uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center animate-fade-in">
          <div className="font-serif text-neutral-700">
            <div className="text-sm sm:text-base md:text-lg tracking-widest uppercase text-neutral-600 mb-[-0.5em] md:mt-9">
              Settembre
            </div>
            <div className="font-elegant text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none mb-3">
              25
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl tracking-[0.3em] text-neutral-600 mt-3">
              2026
            </div>
          </div>
          <div className="w-12 sm:w-16 md:w-20 h-2 bg-neutral-300 mx-auto mt-6 rounded-full"></div>
          {/* Pulsante Aggiungi promemoria */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <a
              href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Matrimonio+Giacomo+e+Giulia&dates=20260925T110000/20260925T150000&details=Cerimonia+e+celebrazione+matrimonio&location=Sala+Del+Regno+Dei+Testimoni+di+Geova,+Auditorium+A,+Via+Pantanelli,+98,+61025+Montelabbate+PU"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-calendar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                <path d="M7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM5 4h1V2h2v2h8V2h2v2h1c1.1 0 2 .9 2 2v14 c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 16h14V9H5v11z" fill="currentColor"/>
              </svg>
              Aggiungi promemoria
            </a>
            <div className="mt-2 text-xs text-neutral-500">
              Il promemoria sarà sincronizzato su tutti i tuoi dispositivi tramite Google Calendar.<br />
              Per Apple/Outlook, importa l’evento nel tuo calendario cloud per la sincronizzazione.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
