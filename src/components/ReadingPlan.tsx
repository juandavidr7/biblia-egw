"use client";
import { useState, useCallback } from "react";
import type { WeekData, WeekMeta } from "@/types/reading-plan";
import PassageCard from "./PassageCard";
import EGWCard from "./EGWCard";
import DayPicker from "./DayPicker";

const BOOK_VARIANTS: Record<string, "mateo"|"marcos"|"lucas"|"juan"> = {
  Mateo:"mateo", Marcos:"marcos", Lucas:"lucas", Juan:"juan"
};

interface Props {
  weekData: WeekData;
  weeksMeta: WeekMeta[];
  initialGlobalDay: number;
  completedDays: number[];
  onMarkComplete: (globalDay: number) => void;
  onGoToDay: (day: number) => void;
  notionUrl: string;
}

export default function ReadingPlan({ weekData, weeksMeta, initialGlobalDay, completedDays, onMarkComplete, onGoToDay, notionUrl }: Props) {
  const days = weekData.days;
  const currentDay = days.find(d => d.globalDay === initialGlobalDay) ?? days[0];
  const [activeGlobalDay, setActiveGlobalDay] = useState(currentDay.globalDay);
  const [pickerOpen, setPickerOpen] = useState(false);

  const day = days.find(d => d.globalDay === activeGlobalDay) ?? days[0];
  const dayIndex = days.indexOf(day);
  const isDone = completedDays.includes(day.globalDay);

  const goToGlobal = useCallback((g: number) => {
    const found = days.find(d => d.globalDay === g);
    if (found) { setActiveGlobalDay(g); onGoToDay(g); }
  }, [days, onGoToDay]);

  const goPrev = () => dayIndex > 0 && setActiveGlobalDay(days[dayIndex - 1].globalDay);
  const goNext = () => dayIndex < days.length - 1 && setActiveGlobalDay(days[dayIndex + 1].globalDay);

  const totalDaysPerWeek: Record<number,number> = {};
  weeksMeta.forEach(w => { totalDaysPerWeek[w.week] = w.dayRange[1] - w.dayRange[0] + 1; });

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">
            <span className="brand-icon">✦</span>
            <div>
              <p className="brand-title">Evangelios en Armonía</p>
              <p className="brand-subtitle">{weekData.title}</p>
            </div>
          </div>
          <button className="day-picker-trigger" onClick={() => setPickerOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Día {day.globalDay}
            <span className="picker-trigger-week">· Sem. {weeksMeta.find(w => day.globalDay >= w.dayRange[0] && day.globalDay <= w.dayRange[1])?.week ?? 1}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </header>

      {/* DAY PICKER MODAL */}
      {pickerOpen && (
        <DayPicker
          weeks={weeksMeta}
          currentGlobalDay={activeGlobalDay}
          completedDays={completedDays}
          totalDaysPerWeek={totalDaysPerWeek}
          onSelect={goToGlobal}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {/* MAIN */}
      <main className="main-content">
        <div className="container">
          <div key={activeGlobalDay} className="day-content">
            {/* Hero */}
            <div className="day-hero">
              <div className="day-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Día {day.globalDay} · ~{day.estimatedMinutes} min
                {isDone && <span className="done-badge">✓ Completado</span>}
              </div>
              <h2 className="day-title">{day.title}</h2>
              <p className="day-subtitle">{day.subtitle}</p>
              <div className="day-actions">
                <a href={`${notionUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-notion">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08V19.9c0 .7.373.96 1.12.913l14.192-.84c.747-.046.84-.56.84-1.167V6.354c0-.606-.233-.933-.747-.887l-14.518.887c-.56.047-.887.327-.887.934zm13.924.793c.093.42 0 .84-.42.887l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.747 0-.934-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933l3.21-.14z"/></svg>
                  Apuntes en Notion
                </a>
                <a href={day.central.bibleGatewayUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Bible Gateway ↗
                </a>
                {!isDone && (
                  <button className="btn btn-complete" onClick={() => onMarkComplete(day.globalDay)}>
                    ✓ Marcar completado
                  </button>
                )}
              </div>
            </div>

            {/* Central */}
            <div className="section-divider"><div className="section-divider-line"/><span className="section-divider-label">Texto central</span><div className="section-divider-line"/></div>
            <PassageCard passage={day.central} variant={BOOK_VARIANTS[day.central.book] ?? "mateo"} isCentral defaultOpen />

            {/* Parallels */}
            <div className="section-divider"><div className="section-divider-line"/><span className="section-divider-label">Paralelos</span><div className="section-divider-line"/></div>
            {day.parallels.length === 0 ? (
              <div className="no-parallels-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p>Esta perícopa es exclusiva de Mateo.</p>
              </div>
            ) : (
              <>
                {day.parallelNote && <div className="parallel-note-box"><p>{day.parallelNote}</p></div>}
                {day.parallels.map((p, i) => (
                  <PassageCard key={i} passage={p} variant={BOOK_VARIANTS[p.book] ?? "marcos"} />
                ))}
              </>
            )}

            {/* EGW */}
            <div className="section-divider"><div className="section-divider-line"/><span className="section-divider-label">Elena G. de White</span><div className="section-divider-line"/></div>
            <EGWCard egw={day.egw} />
          </div>
        </div>
      </main>

      {/* FOOTER NAV */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <p className="footer-credit">
            Texto: <strong>NTV</strong> · <a href="https://www.biblegateway.com" target="_blank" rel="noopener">biblegateway.com</a>
            {" · "}EGW: <a href="https://m.egwwritings.org/es" target="_blank" rel="noopener">egwwritings.org</a>
          </p>
          <div className="footer-nav">
            <button className="footer-nav-btn" onClick={goPrev} disabled={dayIndex === 0}>
              ← Anterior
            </button>
            <button className="footer-nav-btn" onClick={goNext} disabled={dayIndex === days.length - 1}>
              Siguiente →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
