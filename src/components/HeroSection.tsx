import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const scrollToNext = () => {
    const nextSection = document.getElementById('welcome');
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-start lg:items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/photoHeader.jpg"
          alt="Foto di copertina del matrimonio di Giacomo e Giulia"
          className="w-full h-full object-cover bg-no-repeat bg-[center_50%] md:bg-[center_46%] lg:bg-[center_56%] xl:bg-[center_63%]"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start text-white pt-10 sm:pt-14 md:pt-20 lg:pt-0 xl:pt-0">
        <p className="font-sans text-2xl md:text-3xl tracking-[0.28em] uppercase drop-shadow animate-fade-in mb-3">
          CI SPOSIAMO
        </p>
        <h1 className="font-script text-white animate-fade-in drop-shadow-lg whitespace-nowrap mt-0 leading-none" style={{letterSpacing: '0.03em'}}>
          <span className="inline-block text-6xl md:text-[88px]">G</span>
          <span className="inline-block text-5xl md:text-[64px]">iacomo</span>
          <span className="inline-block mx-4 text-3xl md:text-[36px] align-baseline">&</span>
          <span className="inline-block text-6xl md:text-[88px]">G</span>
          <span className="inline-block text-5xl md:text-[64px]">iulia</span>
        </h1>
      </div>

      <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 z-10 text-white text-center">
        <button
          onClick={scrollToNext}
          className="animate-bounce cursor-pointer hover:scale-110 transition-transform p-2 rounded-full hover:bg-white/10"
          aria-label="Scorri verso il basso"
        >
          <ChevronDown size={28} className="sm:w-8 sm:h-8 md:w-9 md:h-9" />
        </button>
      </div>
    </section>
  );
}
