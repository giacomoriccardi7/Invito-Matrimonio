// Icone: ripristino le GIF precedenti per cerimonia e celebrazione

export default function EventDetailsSection() {
  const ceremony = {
    title: 'Cerimonia',
    time: '11:00',
    location: 'Sala Del Regno Dei Testimoni di Geova, Auditorium A',
    address: 'Via Pantanelli, 98, 61025 Montelabbate (PU)',
    mapsUrl: 'https://maps.app.goo.gl/1EZjtM4szqu9uNJD8'
  };

  const reception = {
    title: 'Celebrazione',
    time: '13:00',
    location: 'La Fragola De Bosch',
    address: 'Via Sottorigossa, 1321, 47035 Gambettola (FC)',
    mapsUrl: 'https://maps.app.goo.gl/74sddhGhsYCywRUE8'
  };

  const EventCard = ({ event, isChurch = false }: { event: typeof ceremony; isChurch?: boolean }) => (
    <div className="text-center mb-12 animate-slide-up">
      <div className="flex justify-center mb-4">
        {isChurch ? (
          <img
            src="https://weddingfy.app/recursos/iconos/anillosN.gif"
            style={{ width: '90px' }}
            alt="Icona Cerimonia"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
        ) : (
          <img
            src="https://weddingfy.app/recursos/iconos/cheersN.gif"
            style={{ width: '90px' }}
            alt="Icona Celebrazione"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
        )}
      </div>
      <h3 className="font-script text-4xl md:text-5xl text-neutral-800 mb-3">
        {event.title}
      </h3>
      <p className="font-elegant text-neutral-800 mb-2 text-xl md:text-2xl">
        {isChurch ? 'Ti aspettiamo per la cerimonia presso:' : 'Ti aspettiamo per il ricevimento presso:'}
        <br />
        <span className="italic">{event.location}</span>
      </p>
      <p className="font-elegant text-neutral-800 mb-6 text-2xl md:text-3xl">
        <span className="font-semibold">Ore {event.time}</span>
      </p>
      
      <p className="text-neutral-600 mb-6">{event.address}</p>
      
      <a
        href={event.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-sage text-white text-sm font-medium py-2 px-6 rounded-md transition-colors hover:bg-sage-dark"
      >
        Visualizza posizione su mappa
      </a>
    </div>
  );

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-lg mx-auto">
        <EventCard event={ceremony} isChurch={true} />
        <div className="w-32 h-0.5 bg-neutral-300 mx-auto my-8"></div>
        <EventCard event={reception} />
      </div>
    </section>
  );
}
