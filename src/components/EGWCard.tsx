"use client";
import { useState } from "react";
import type { EGWReference } from "@/types/reading-plan";

export default function EGWCard({ egw }: { egw: EGWReference }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="egw-card">
      <div className="egw-card-header">
        <div className="passage-book-info">
          <span className="book-badge egw">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            EGW
          </span>
          <span className="egw-book-name">{egw.book}</span>
        </div>
        <a href={egw.url} target="_blank" rel="noopener noreferrer" className="link-icon-btn" style={{color:"var(--egw)"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>

      <div className="egw-card-body">
        <h3 className="egw-chapter-name">{egw.chapter}</h3>

        <div className="egw-connection-box">
          <span className="egw-connection-icon">🔗</span>
          <p className="egw-connection-text">{egw.connection}</p>
        </div>

        {egw.note && <p className="egw-note">{egw.note}</p>}

        <div className={`egw-excerpts ${expanded ? "expanded" : "collapsed"}`}>
          {egw.excerpts.map((p, i) => (
            <p key={i} className="egw-excerpt-paragraph">{p}</p>
          ))}
        </div>

        <div className="egw-actions">
          <button className="egw-expand-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Ocultar texto ▲" : "Leer extracto ▼"}
          </button>
          <a href={egw.url} target="_blank" rel="noopener noreferrer" className="egw-link-btn">
            Capítulo completo →
          </a>
        </div>
      </div>
    </div>
  );
}
