import { useState } from 'react';
import { X } from 'lucide-react';

export default function GiftSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="gifts" className="py-16 sm:py-20 lg:py-24 px-4 bg-neutral-100 reveal">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <img src="/images/busta.png" style={{ width: '100px' }} alt="Regali Icona" loading="lazy" decoding="async" fetchpriority="low" />
        </div>
        <h3 className="font-sans text-xl uppercase tracking-wider text-neutral-800 mb-4">
          REGALI
        </h3>
        <p className="text-neutral-700 mb-6">
          La cosa più importante è la tua presenza, ma se desideri farci un regalo qui trovi i nostri dati:
        </p>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sage-dark hover:bg-sage text-white font-semibold tracking-wide py-3 px-8 rounded-md shadow-sm transition-all duration-300 ease-in-out transform hover:scale-105"
          style={{ width: '260px', maxWidth: '90%' }}
        >
          VEDI DATI BANCARI
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full relative animate-slide-up">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              <X size={24} />
            </button>
            <h4 className="font-serif text-2xl text-neutral-800 mb-4 text-center">DATI BANCARI</h4>
            <div className="text-left text-neutral-700 space-y-2">
              <p className="whitespace-nowrap text-sm sm:text-base overflow-x-auto"><strong>IBAN:</strong> IT79W0347501605CC0012827993</p>
              <p><strong>Intestatario:</strong> Giacomo Riccardi</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}