import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const scrollToNext = () => {
    const nextSection = document.getElementById('welcome');
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/photoHeader.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-white pt-20">
        <h1 className="font-script text-5xl md:text-[72px] text-white animate-fade-in drop-shadow-lg whitespace-nowrap" style={{letterSpacing: '0.04em'}}>
          Giacomo & Giulia
        </h1>
        <p className="font-sans text-xl mt-[1.5em] tracking-[0.2em] mb-8 uppercase drop-shadow animate-fade-in">
          CI SPOSIAMO
        </p>
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
