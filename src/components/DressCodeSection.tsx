export default function DressCodeSection() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-6">
          {/* Logo stilizzato (abito e vestito) */}
          <div className="shrink-0">
            <img src="https://weddingfy.app/recursos/dc2ia.png" style={{width: '100px'}} alt="Dress Code Icona" loading="lazy" decoding="async" fetchpriority="low" />
          </div>

          {/* Divider verticale */}
          <div className="w-px h-16 bg-neutral-300"></div>

          {/* Testo */}
          <div className="flex-1">
            <h3 className="font-sans text-xl uppercase tracking-wider text-neutral-800">DRESS CODE</h3>
            <p className="text-neutral-700 mt-3">Formale</p>
            <p className="text-neutral-700">Sfoggia il tuo look migliore!</p>
          </div>
        </div>
      </div>
    </section>
  );
}