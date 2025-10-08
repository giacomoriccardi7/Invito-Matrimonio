import React, { useState, useEffect } from 'react';

export default function GallerySection() {
  interface Memory {
    id: string;
    file_url: string;
    thumbnail_path: string;
    dedication: string;
    name: string;
    created_at: string;
  }

  const [memories, setMemories] = useState<Memory[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [dedication, setDedication] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Funzione per recuperare i ricordi
  const fetchMemories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/memories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMemories(data);
    } catch (error) {
      console.error("Errore nel recupero dei ricordi:", error);
      setError("Impossibile caricare i ricordi.");
    }
  };

  // Recupera i ricordi al caricamento del componente
  useEffect(() => {
    fetchMemories();
  }, []);

  // Funzione per gestire il caricamento del file
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !dedication || !name) {
      setError("Per favore, compila tutti i campi e seleziona un file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('memory', file);
    formData.append('dedication', dedication);
    formData.append('name', name);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/memories/upload`, {
        method: 'POST',
        body: formData,
        // Non impostare 'Content-Type' qui, il browser lo farà automaticamente con FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Aggiorna la galleria dopo il caricamento
      fetchMemories();

      // Resetta i campi del form
      setFile(null);
      setDedication('');
      setName('');
      setUploadProgress(0);
    } catch (error) {
      console.error("Errore nel caricamento del file:", error);
      setError("Errore durante il caricamento del file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-center text-neutral-800 mb-8">Album di Ricordi</h2>

        {/* Modulo di caricamento */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-12">
          <h3 className="text-xl font-semibold text-neutral-700 mb-4">Carica un Ricordo</h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleFileUpload}>
            <div className="mb-4">
              <label htmlFor="file" className="block text-neutral-700 text-sm font-bold mb-2">
                Seleziona Foto/Video:
              </label>
              <input
                type="file"
                id="file"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="dedication" className="block text-neutral-700 text-sm font-bold mb-2">
                La tua Dedica:
              </label>
              <textarea
                id="dedication"
                rows={3}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"
                value={dedication}
                onChange={(e) => setDedication(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-6">
              <label htmlFor="name" className="block text-neutral-700 text-sm font-bold mb-2">
                Il tuo Nome:
              </label>
              <input
                type="text"
                id="name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-sage hover:bg-sage-dark text-white font-medium py-2 px-6 rounded-md transition-colors"
              disabled={isUploading}
            >
              {isUploading ? `Caricamento... ${uploadProgress}%` : 'Invia Ricordo'}
            </button>
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div
                  className="bg-sage h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </form>
        </div>

        {/* Galleria di ricordi */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {memories.map((memory) => (
            <div key={memory.id} className="aspect-square overflow-hidden rounded-lg shadow-md">
              <img
                src={memory.thumbnail_path || memory.file_url} // Usa la miniatura se disponibile, altrimenti il file originale
                alt={memory.dedication}
                className="w-full h-full object-cover cursor-pointer"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
                onClick={() => alert(`Mostra immagine a schermo intero: ${memory.file_url}`)} // Placeholder per la modale
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
