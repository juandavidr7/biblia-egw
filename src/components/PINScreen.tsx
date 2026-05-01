"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface PINScreenProps {
  onSuccess: () => void;
}

export default function PINScreen({ onSuccess }: PINScreenProps) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleKeyClick = (num: number) => {
    if (pin.length < 8) {
      setPin(prev => prev + num);
      setError("");
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError("");
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError("Falta tu nombre de usuario");
      triggerShake();
      return;
    }
    if (pin.length < 4) {
      setError("El PIN debe tener al menos 4 dígitos");
      triggerShake();
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Buscar si el usuario existe
      const { data: user, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.trim().toLowerCase())
        .single();

      if (user) {
        // Usuario existe, validar PIN
        if (user.pin !== pin) {
          setError("PIN incorrecto para este usuario");
          triggerShake();
          setPin("");
        } else {
          // OK! Guardar estado de sesión
          localStorage.setItem('session_user', user.username);
          onSuccess();
        }
      } else {
        // 2. Usuario NO existe, lo creamos
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            username: username.trim().toLowerCase(),
            pin: pin,
            current_day: 1,
            completed_days: []
          });
        
        if (insertError) {
          setError("Error creando perfil: " + insertError.message);
          triggerShake();
        } else {
          localStorage.setItem('session_user', username.trim().toLowerCase());
          onSuccess();
        }
      }
    } catch (err) {
      setError("Error de red conectando con la Base de Datos.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pin-screen">
      <div className="pin-card" style={{ padding: "2rem", background: "var(--bg-card)", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid var(--ink-faint)", width: "100%", maxWidth: "340px" }}>
        <div className="pin-icon">✦</div>
        <h1 className="pin-title">Evangelios en Armonía</h1>
        <p className="pin-subtitle">Ingresa para sincronizar en la nube</p>
        
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Username Input */}
          <div>
            <label style={{ display: "block", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink-secondary)", marginBottom: "0.5rem" }}>
              NOMBRE DE USUARIO
            </label>
            <input 
              type="text" 
              placeholder="ej. juan99 (único)" 
              value={username}
              onChange={(e) => { setUsername(e.target.value.replace(/\s+/g, '').toLowerCase()); setError(""); }}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--ink-faint)", fontFamily: "inherit", fontSize: "1rem", textAlign: "center", background: "var(--bg-verse)", color: "var(--ink-primary)" }}
            />
          </div>

          {/* PIN Display (Dots) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink-secondary)", marginBottom: "0.5rem" }}>
              PIN DE ACCESO
            </label>
            <div className={`pin-dots ${shake ? 'shake' : ''}`} style={{ marginBottom: "0.5rem" }}>
              {[...Array(Math.max(4, pin.length))].map((_, i) => (
                <div key={i} className={`pin-dot ${i < pin.length ? (error ? 'error' : 'filled') : ''}`} />
              ))}
            </div>
            {error && <p className="pin-error" style={{ marginBottom: 0 }}>{error}</p>}
          </div>

          {/* Keypad */}
          <div className="pin-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num} 
                type="button" 
                className="pin-key" 
                onClick={() => handleKeyClick(num)}
              >
                {num}
              </button>
            ))}
            <button 
              type="button" 
              className="pin-key pin-key-delete" 
              onClick={handleDelete}
              aria-label="Borrar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
            </button>
            <button 
              type="button" 
              className="pin-key" 
              onClick={() => handleKeyClick(0)}
            >
              0
            </button>
            <button 
              type="button" 
              className="pin-key" 
              onClick={handleSubmit}
              disabled={loading}
              style={{ background: "var(--ink-primary)", color: "var(--bg-base)" }}
            >
              {loading ? "..." : "OK"}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
