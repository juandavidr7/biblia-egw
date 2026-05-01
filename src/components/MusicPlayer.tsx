"use client";
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";

export default function MusicPlayer() {
  const { isAuthenticated, youtubeUrl, saveYoutubeUrl } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState("");

  // Default LoFi si no hay URL guardada
  const defaultVideoId = "3T89-ZkM28w"; // Ejemplo: LoFi worship
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    // Cuando cargamos el perfil, extraemos el ID del URL guardado
    if (youtubeUrl) {
      const id = extractYouTubeID(youtubeUrl);
      if (id) {
        setVideoId(id);
        setInputUrl(youtubeUrl);
      }
    } else {
      setVideoId(defaultVideoId);
    }
  }, [youtubeUrl]);

  const extractYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSave = () => {
    if (!inputUrl.trim()) {
      saveYoutubeUrl("");
      setVideoId(defaultVideoId);
      return;
    }
    
    const id = extractYouTubeID(inputUrl);
    if (id) {
      setVideoId(id);
      saveYoutubeUrl(inputUrl);
    } else {
      alert("Enlace de YouTube inválido. Intenta con un link como https://youtu.be/...");
    }
  };

  // Solo mostrar el widget si el usuario está logueado
  if (!isAuthenticated) return null;

  return (
    <div className="music-widget">
      {/* Popover: Siempre en el DOM para no cortar el audio, oculto por CSS */}
      <div className={`music-popover ${isOpen ? 'open' : 'closed'}`}>
        <div className="music-popover-header">
            <h4>YouTube Ambient</h4>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="music-popover-body">
            <div className="music-help-header">
              <p className="music-help-text">Pega un enlace de música de YouTube (ej. LoFi, instrumental).</p>
              <a href="https://www.youtube.com/results?search_query=lofi+worship+instrumental+fondo" target="_blank" rel="noopener noreferrer" className="music-search-link">
                🔍 Buscar música
              </a>
            </div>
            
            <div className="music-input-group">
              <input 
                type="text" 
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://youtu.be/..."
                className="music-input"
              />
              <button className="music-save-btn" onClick={handleSave}>Cargar</button>
            </div>
            
            <div className="youtube-container">
              {videoId ? (
                <iframe 
                  width="100%" 
                  height="160" 
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&loop=1&playlist=${videoId}`} 
                  title="YouTube music player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="youtube-placeholder">No hay música seleccionada</div>
              )}
            </div>
          </div>
        </div>

      {/* Trigger Button */}
      <button 
        className={`music-btn ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)} 
        title="Abrir YouTube Music"
      >
        <div className="music-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
        </div>
      </button>
      
      {/* Notas musicales solo animan si estamos "escuchando" pero youtube iframes no nos dan state directo, 
          así que podemos dejarlas estáticas o quitarlas si ya mostramos el reproductor visual */}
    </div>
  );
}
