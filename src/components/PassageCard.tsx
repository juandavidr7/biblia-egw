"use client";
import { useState } from "react";
import type { BiblePassage } from "@/types/reading-plan";

interface PassageCardProps {
  passage: BiblePassage;
  variant: "mateo" | "marcos" | "lucas" | "juan";
  isCentral?: boolean;
  defaultOpen?: boolean;
}

const LABELS: Record<string, string> = { mateo:"Mateo", marcos:"Marcos", lucas:"Lucas", juan:"Juan" };

export default function PassageCard({ passage, variant, isCentral = false, defaultOpen = false }: PassageCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  const verseMap = Object.fromEntries(passage.verses.map(v => [v.number, v.text]));

  return (
    <div className="passage-card">
      <div className="passage-header" onClick={() => setOpen(!open)}>
        <div className="passage-book-info">
          <span className={`book-badge ${variant}${isCentral?" central":""}`}>
            {isCentral && "★ "}{LABELS[variant] ?? passage.book}
          </span>
          <span className="passage-reference">{passage.reference}</span>
        </div>
        <div className="passage-header-actions">
          <a href={passage.bibleGatewayUrl} target="_blank" rel="noopener noreferrer"
            className="link-icon-btn" title="Abrir en Bible Gateway (NTV)"
            onClick={e => e.stopPropagation()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
          <span className={`chevron${open?" open":""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </div>
      </div>

      {open && (
        <div className="passage-body open">
          {passage.sections && passage.sections.length > 0 ? (
            passage.sections.map((section, si) => (
              <div key={si} className="passage-section">
                <div className="section-title-row">
                  <h4 className="section-title">{section.title}</h4>
                </div>
                {section.insight && (
                  <div className="section-insight"><span className="insight-icon">💡</span>{section.insight}</div>
                )}
                <div className="verses-container">
                  {section.verseNumbers.map(n => verseMap[n] ? (
                    <div key={n} className="verse">
                      <span className="verse-number">{n}</span>
                      <p className="verse-text">{verseMap[n]}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            ))
          ) : (
            <div className="verses-container">
              {passage.verses.map(v => (
                <div key={v.number} className="verse">
                  <span className="verse-number">{v.number}</span>
                  <p className="verse-text">{v.text}</p>
                </div>
              ))}
            </div>
          )}
          {passage.note && (
            <div className="passage-note"><span>ℹ</span><span>{passage.note}</span></div>
          )}
        </div>
      )}
    </div>
  );
}
