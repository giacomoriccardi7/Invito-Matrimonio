import { useEffect } from 'react';
import HeroSection from './components/HeroSection';
import CountdownSection from './components/CountdownSection';
import EventDetailsSection from './components/EventDetailsSection';
// import GuestInfoSection from './components/GuestInfoSection';
import GiftSection from './components/GiftSection';
import DressCodeSection from './components/DressCodeSection';
import RSVPSection from './components/RSVPSection';
import FooterSection from './components/FooterSection';
// Memories funzionalità in stand-by: rimosse dal rendering
// import GallerySection from './components/GallerySection';
// import LiveFeed from './components/LiveFeed';
import AdminPanel from './components/AdminPanel';
// import AdminAccessButton from './components/AdminAccessButton';

function App() {
  useEffect(() => {
    // Intersection Observer per animazioni armoniose in entrata e uscita
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        } else {
          entry.target.classList.remove('active');
        }
      });
    }, { threshold: 0.1 });

    // Osserva tutti gli elementi con classe 'reveal'
    document.querySelectorAll('.reveal').forEach(element => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {window.location.pathname === '/admin' ? (
        <AdminPanel />
      ) : (
        <>
          <HeroSection />
          <div className="reveal">
            <CountdownSection />
          </div>
          <div className="reveal">
            <EventDetailsSection />
          </div>
          <div className="reveal">
      {/* GuestInfoSection rimosso: messaggi sui ricordi non più mostrati */}
          </div>
          <div className="reveal">
            <GiftSection />
          </div>
          <div className="reveal">
            <DressCodeSection />
          </div>
          <div className="reveal">
            <RSVPSection />
          </div>
          <FooterSection />
        </>
      )}
      {/* AdminAccessButton rimosso: pannello di controllo non visibile */}
    </div>
  );
}

export default App;
