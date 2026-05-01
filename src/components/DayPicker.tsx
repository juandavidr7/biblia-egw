"use client";
import { useState } from "react";
import type { WeekMeta } from "@/types/reading-plan";

interface DayPickerProps {
  weeks: WeekMeta[];
  currentGlobalDay: number;
  completedDays: number[];
  totalDaysPerWeek: Record<number, number>;
  onSelect: (day: number) => void;
  onClose: () => void;
}

export default function DayPicker({ weeks, currentGlobalDay, completedDays, totalDaysPerWeek, onSelect, onClose }: DayPickerProps) {
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([
    weeks.find(w => currentGlobalDay >= w.dayRange[0] && currentGlobalDay <= w.dayRange[1])?.week ?? 1
  ]));

  const toggleWeek = (w: number) => setOpenWeeks(prev => {
    const next = new Set(prev);
    next.has(w) ? next.delete(w) : next.add(w);
    return next;
  });

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-panel" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <h2 className="picker-title">Plan de lectura</h2>
          <button className="picker-close" onClick={onClose}>✕</button>
        </div>
        <div className="picker-body">
          {weeks.map(week => {
            const isOpen = openWeeks.has(week.week);
            const daysInWeek = totalDaysPerWeek[week.week] ?? (week.dayRange[1] - week.dayRange[0] + 1);
            const completedInWeek = Array.from({length: daysInWeek}, (_,i) => week.dayRange[0] + i)
              .filter(d => completedDays.includes(d)).length;

            return (
              <div key={week.week} className="picker-week">
                <button className="picker-week-header" onClick={() => toggleWeek(week.week)}>
                  <div className="picker-week-info">
                    <span className="picker-week-label">Semana {week.week}</span>
                    <span className="picker-week-title">{week.title}</span>
                  </div>
                  <div className="picker-week-right">
                    <span className="picker-week-progress">{completedInWeek}/{daysInWeek}</span>
                    <span className="picker-chevron">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>
                {isOpen && (
                  <div className="picker-days">
                    {Array.from({length: daysInWeek}, (_, i) => {
                      const dayNum = week.dayRange[0] + i;
                      const isCurrent = dayNum === currentGlobalDay;
                      const isDone = completedDays.includes(dayNum);
                      return (
                        <button
                          key={dayNum}
                          className={`picker-day ${isCurrent ? "current" : ""} ${isDone ? "done" : ""}`}
                          onClick={() => { onSelect(dayNum); onClose(); }}
                        >
                          <span className="picker-day-num">{isDone ? "✓" : dayNum}</span>
                          <span className="picker-day-label">Día {dayNum}</span>
                          {isCurrent && <span className="picker-day-badge">Aquí</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
