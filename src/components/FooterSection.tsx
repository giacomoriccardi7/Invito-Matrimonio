import { useEffect, useRef } from 'react';

export default function FooterSection() {
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    // Osserva gradualmente l'entrata in viewport per un fade raffinato
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          el.style.setProperty('--reveal', ratio.toString());
        });
      },
      { threshold: thresholds }
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative py-16 sm:py-20 px-4 bg-neutral-50 text-neutral-800"
      style={{ ['--reveal' as any]: 0 }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6 fade">
          <img
            src="/images/cuore.svg"
            alt="Cuore"
            width={48}
            height={48}
            className="opacity-80 hover:opacity-90 transition-opacity mb-2 heartbeat-slow"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
        </div>

        <div className="fade">
          <h2 className="font-serif text-2xl md:text-3xl tracking-wide text-neutral-700">
            Ti aspettiamo!
          </h2>
        </div>

        <div className="mt-6 mb-10 fade">
          <div className="mx-auto w-16 h-px bg-neutral-200"></div>
        </div>

        <div className="fade">
          <p className="font-serif text-sm tracking-[0.25em] uppercase text-neutral-500">
            Con amore,
          </p>
          <p className="font-script text-3xl md:text-4xl mt-3 text-neutral-700">
            Giacomo & Giulia
          </p>
          <p className="mt-3 text-xs tracking-[0.3em] text-neutral-500">
            25 Settembre 2026
          </p>
        </div>

        <div className="mt-10 fade">
          <div className="mx-auto w-12 h-px bg-neutral-200"></div>
        </div>

        <div className="mt-6 text-[12px] text-neutral-500 fade">
          © 2025 Giacomo & Giulia — Il nostro per sempre inizia qui.
        </div>
      </div>
    </footer>
  );
}
