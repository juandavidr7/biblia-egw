"use client";
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import PINScreen from "@/components/PINScreen";
import ReadingPlan from "@/components/ReadingPlan";
import planIndex from "@/data/index.json";
import type { WeekData, PlanIndex } from "@/types/reading-plan";

const NOTION_URL = "https://notion.so";

export default function HomePage() {
  const { isAuthenticated, profile, login, markComplete, goToDay, isCompleted } = useProfile();
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const meta = planIndex as PlanIndex;

  useEffect(() => {
    if (!isAuthenticated) return;
    // Find which week contains currentDay
    const targetDay = profile.currentDay;
    const week = meta.weeks.find(w => targetDay >= w.dayRange[0] && targetDay <= w.dayRange[1]) ?? meta.weeks[0];
    import(`@/data/weeks/${week.dataFile}`).then(m => setWeekData(m.default as WeekData));
  }, [isAuthenticated, profile.currentDay, meta.weeks]);

  if (!isAuthenticated) {
    return <PINScreen login={login} onSuccess={() => {}} />;
  }

  if (!weekData) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">✦</div>
        <p>Cargando lectura...</p>
      </div>
    );
  }

  return (
    <ReadingPlan
      weekData={weekData}
      weeksMeta={meta.weeks}
      initialGlobalDay={profile.currentDay}
      completedDays={profile.completedDays}
      onMarkComplete={markComplete}
      onGoToDay={goToDay}
      notionUrl={NOTION_URL}
    />
  );
}
