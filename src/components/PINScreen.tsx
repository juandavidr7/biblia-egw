"use client";
import { useState } from "react";

interface PINScreenProps {
  onSuccess: () => void;
  login: (pin: string) => boolean;
}

export default function PINScreen({ onSuccess, login }: PINScreenProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (login(next)) { onSuccess(); }
        else {
          setShake(true);
          setError(true);
          setTimeout(() => { setPin(""); setShake(false); }, 600);
        }
      }, 100);
    }
  };

  const handleDelete = () => { setPin(p => p.slice(0, -1)); setError(false); };

  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div className="pin-screen">
      <div className="pin-card">
        <div className="pin-icon">✦</div>
        <h1 className="pin-title">Evangelios en Armonía</h1>
        <p className="pin-subtitle">Ingresá tu PIN para continuar</p>
        <div className={`pin-dots ${shake ? "shake" : ""}`}>
          {[0,1,2,3].map(i => (
            <div key={i} className={`pin-dot ${i < pin.length ? "filled" : ""} ${error ? "error" : ""}`} />
          ))}
        </div>
        {error && <p className="pin-error">PIN incorrecto</p>}
        <div className="pin-keypad">
          {digits.map((d, i) => (
            d === "" ? <div key={i} /> :
            d === "⌫" ? (
              <button key={i} className="pin-key pin-key-delete" onClick={handleDelete}>⌫</button>
            ) : (
              <button key={i} className="pin-key" onClick={() => handleDigit(d)}>{d}</button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
