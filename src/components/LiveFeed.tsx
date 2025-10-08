import React, { useEffect, useMemo, useRef, useState } from 'react';

type Memory = {
  id: string;
  file_path: string;
  file_type: string;
  uploader_name?: string;
  dedication?: string;
  thumbnail_path?: string;
  created_at?: string;
  is_approved?: boolean;
};

export default function LiveFeed() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Preload images for smoother slideshow
  const preloadedImages = useMemo(() => {
    return memories
      .filter(m => m.file_type?.startsWith('image'))
      .map(m => {
        const img = new Image();
        img.src = m.thumbnail_path || m.file_path;
        return img;
      });
  }, [memories]);

  useEffect(() => {
    let intervalId: number | undefined;

    async function fetchApprovedMemories() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/memories/live`);
        const data: Memory[] = await res.json();
        setMemories(data || []);
      } catch (err) {
        console.error('Errore nel recupero dei ricordi approvati:', err);
      }
    }

    function startSSE() {
      try {
        const es = new EventSource(`${import.meta.env.VITE_BACKEND_URL}/api/memories/events`);
        eventSourceRef.current = es;
        es.onmessage = (e) => {
          try {
            const payload: Memory = JSON.parse(e.data);
            // Inserisci solo se approvato
            if (payload?.is_approved) {
              setMemories(prev => {
                // Evita duplicati per id
                if (prev.some(m => m.id === payload.id)) return prev;
                return [payload, ...prev];
              });
            }
          } catch (err) {
            console.warn('SSE message parse error:', err);
          }
        };
        es.onerror = (err) => {
          console.warn('SSE error:', err);
        };
      } catch (err) {
        console.warn('Impossibile iniziare SSE:', err);
      }
    }

    function startSlideshow() {
      intervalId = window.setInterval(() => {
        setCurrentIndex(prev => (memories.length ? (prev + 1) % memories.length : 0));
      }, 4000);
    }

    fetchApprovedMemories();
    startSSE();
    startSlideshow();

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      eventSourceRef.current?.close();
    };
  }, []);

  const current = memories[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full h-screen flex items-center justify-center">
        {current ? (
          current.file_type?.startsWith('image') ? (
            <img
              src={current.thumbnail_path || current.file_path}
              alt={current.dedication || 'Ricordo'}
              className="object-contain max-h-screen w-full"
            />
          ) : (
            <video
              src={current.file_path}
              autoPlay
              muted
              loop
              playsInline
              className="object-contain max-h-screen w-full"
            />
          )
        ) : (
          <div className="text-center">
            <p className="text-lg">Nessun ricordo approvato al momento.</p>
            <p className="text-sm text-neutral-400">Approva contenuti dal pannello o carica nuovi ricordi.</p>
          </div>
        )}
      </div>
    </div>
  );
}