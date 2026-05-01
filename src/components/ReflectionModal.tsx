"use client";

import React, { useState, useEffect } from "react";

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  initialAnswer: string;
  onSave: (answer: string) => void;
}

export default function ReflectionModal({ isOpen, onClose, question, initialAnswer, onSave }: ReflectionModalProps) {
  const [answer, setAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnswer(initialAnswer || "");
      setIsSaving(false);
    }
  }, [isOpen, initialAnswer]);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    // Simular un pequeño delay de guardado para la UX
    setTimeout(() => {
      onSave(answer);
      setIsSaving(false);
      onClose();
    }, 500);
  };

  return (
    <div className="reflection-modal-overlay" onClick={onClose}>
      <div className="reflection-modal-content" onClick={e => e.stopPropagation()}>
        <div className="reflection-modal-header">
          <div className="reflection-modal-icon">🤔</div>
          <h3 className="reflection-modal-title">Pregunta de Reflexión</h3>
          <button className="reflection-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="reflection-modal-body">
          <p className="reflection-modal-question">{question}</p>
          <textarea
            className="reflection-modal-input"
            placeholder="Escribe aquí tu pensamiento..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            autoFocus
          />
        </div>
        
        <div className="reflection-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Reflexión"}
          </button>
        </div>
      </div>
    </div>
  );
}
