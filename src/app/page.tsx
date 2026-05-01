"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import PINScreen from "@/components/PINScreen";
import ReadingPlan from "@/components/ReadingPlan";
import { PlanIndex, WeekData } from "@/types/reading-plan";

export default function Home() {
  const { isAuthenticated, loading: profileLoading, username, completedDays, currentDay, reflections, saveReflections, markComplete, unmarkComplete, loginSuccess, logout, updatePin } = useProfile();
  
  const [indexData, setIndexData] = useState<PlanIndex | null>(null);
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  // Custom modal states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPinValue, setNewPinValue] = useState("");
  const [pinError, setPinError] = useState("");

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Load weeks meta from Supabase
  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchData() {
      setLoadingData(true);
      
      // Fetch Meta
      const { data: weeksMeta, error: metaError } = await supabase
        .from('weeks_meta')
        .select('*')
        .order('week_id', { ascending: true });
        
      if (!metaError && weeksMeta) {
        // Transform to our PlanIndex interface
        const planIndex: PlanIndex = {
          totalWeeks: weeksMeta.length,
          totalDays: weeksMeta[weeksMeta.length - 1]?.day_end || 0,
          weeks: weeksMeta.map(w => ({
            week: w.week_id,
            title: w.title,
            description: w.description,
            dayRange: [w.day_start, w.day_end]
          }))
        };
        setIndexData(planIndex);

        // Find which week the currentDay belongs to
        const activeWeekMeta = planIndex.weeks.find(w => currentDay >= w.dayRange[0] && currentDay <= w.dayRange[1]) || planIndex.weeks[0];
        
        if (activeWeekMeta) {
          // Fetch Reading Days for this week
          const { data: readingDays, error: daysError } = await supabase
            .from('reading_days')
            .select('*')
            .eq('week_id', activeWeekMeta.week)
            .order('day_in_week', { ascending: true });
            
          if (!daysError && readingDays) {
            const currentWeekData: WeekData = {
              week: activeWeekMeta.week,
              title: activeWeekMeta.title,
              description: activeWeekMeta.description,
              days: readingDays.map(rd => ({
                day: rd.day_in_week,
                globalDay: rd.global_day,
                title: rd.title,
                subtitle: rd.subtitle,
                estimatedMinutes: rd.estimated_minutes,
                central: rd.content.central,
                parallels: rd.content.parallels || [],
                parallelNote: rd.content.parallelNote,
                egw: rd.content.egw
              }))
            };
            setWeekData(currentWeekData);
          }
        }
      }
      setLoadingData(false);
    }
    
    fetchData();
  }, [isAuthenticated, currentDay]);

  if (profileLoading) {
    return <div className="loading-screen"><div className="loading-spinner">↻</div><p>Cargando perfil...</p></div>;
  }

  if (!isAuthenticated) {
    return <PINScreen onSuccess={loginSuccess} />;
  }

  if (loadingData || !indexData || !weekData) {
    return <div className="loading-screen"><div className="loading-spinner">↻</div><p>Descargando plan de lectura desde la nube...</p></div>;
  }

  return (
    <>
      {/* Settings Modal - Muy simple en la esquina superior izquierda por ahora */}
      <div style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 1000, display: 'flex', gap: '0.5rem', alignItems: 'center', pointerEvents: 'none' }}>
        <div style={{ background: 'var(--bg-card)', color: 'var(--ink-primary)', padding: '0.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', border: '1px solid var(--ink-faint)', pointerEvents: 'auto' }}>
        <span>Hola, <b>{username}</b></span>
        <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }} title="Cambiar tema">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        |
        <button onClick={() => {
          setNewPinValue("");
          setPinError("");
          setIsPinModalOpen(true);
        }} style={{ color: 'var(--accent-gold)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}>Cambiar PIN</button>
        |
        <button onClick={logout} style={{ color: 'red', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}>Salir</button>
        </div>
      </div>

      <ReadingPlan 
        weekData={weekData} 
        weeksMeta={indexData.weeks} 
        initialGlobalDay={currentDay}
        completedDays={completedDays}
        reflections={reflections}
        onMarkComplete={markComplete}
        onUnmarkComplete={unmarkComplete}
        onSaveReflections={saveReflections}
        onGoToDay={() => {}}
        notionUrl="https://notion.so"
      />

      {/* Modal Cambio de PIN */}
      {isPinModalOpen && (
        <div className="reflection-modal-overlay" onClick={() => setIsPinModalOpen(false)}>
          <div className="reflection-modal-content" onClick={e => e.stopPropagation()}>
            <div className="reflection-modal-header">
              <span className="reflection-modal-icon">🔒</span>
              <h3 className="reflection-modal-title">Cambiar PIN</h3>
              <button className="reflection-modal-close" onClick={() => setIsPinModalOpen(false)}>✕</button>
            </div>
            <div className="reflection-modal-body">
              <p className="reflection-modal-question">Ingresa tu nuevo PIN (mínimo 4 dígitos):</p>
              <input 
                type="number" 
                className="reflection-modal-input" 
                style={{ minHeight: 'auto', marginBottom: '1rem', padding: '0.75rem', fontSize: '1.25rem', letterSpacing: '0.2em' }}
                value={newPinValue}
                onChange={(e) => {
                  setNewPinValue(e.target.value);
                  setPinError("");
                }}
                placeholder="Ej. 1234"
                autoFocus
              />
              {pinError && <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: 0 }}>{pinError}</p>}
            </div>
            <div className="reflection-modal-footer">
              <button 
                className="btn btn-uncomplete" 
                onClick={() => setIsPinModalOpen(false)}
                style={{ border: 'none', width: 'auto' }}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (newPinValue.length < 4) {
                    setPinError("El PIN debe tener al menos 4 dígitos.");
                    return;
                  }
                  updatePin(newPinValue);
                  setIsPinModalOpen(false);
                }}
                style={{ width: 'auto' }}
              >
                Guardar PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
