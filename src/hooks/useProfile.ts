import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useProfile() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [reflections, setReflections] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);

  // Cargar perfil al inicio si hay sesión local
  useEffect(() => {
    async function loadProfile() {
      const savedUser = localStorage.getItem("session_user");
      if (savedUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', savedUser)
          .single();

        if (data && !error) {
          setUsername(data.username);
          setCompletedDays(data.completed_days || []);
          setCurrentDay(data.current_day || 1);
          setYoutubeUrl(data.youtube_url || "");
          setReflections(data.reflections || {});
          setIsAuthenticated(true);
        } else {
          // Sesión inválida, limpiar
          localStorage.removeItem("session_user");
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const loginSuccess = () => {
    // Cuando PINScreen llama a esto, recargamos la página entera para que el hook atrape la sesión
    // o forzamos re-render cargando el profile
    const savedUser = localStorage.getItem("session_user");
    if (savedUser) {
      window.location.reload();
    }
  };

  const markComplete = async (globalDay: number) => {
    if (!completedDays.includes(globalDay) && username) {
      const newCompleted = [...completedDays, globalDay];
      const nextDay = globalDay + 1; // Asumimos que el proximo dia es este

      // Update UI Optimistically
      setCompletedDays(newCompleted);
      setCurrentDay(nextDay);

      // Sincronizar con DB
      await supabase
        .from('profiles')
        .update({
          completed_days: newCompleted,
          current_day: nextDay,
          last_seen: new Date().toISOString()
        })
        .eq('username', username);
    }
  };

  const unmarkComplete = async (globalDay: number) => {
    if (completedDays.includes(globalDay) && username) {
      const newCompleted = completedDays.filter(day => day !== globalDay);
      const prevDay = globalDay; // Retroceder el cursor al día desmarcado
      
      // Update UI Optimistically
      setCompletedDays(newCompleted);
      setCurrentDay(prevDay);

      // Sincronizar con DB
      await supabase
        .from('profiles')
        .update({
          completed_days: newCompleted,
          current_day: prevDay,
          last_seen: new Date().toISOString()
        })
        .eq('username', username);
    }
  };

  const updatePin = async (newPin: string) => {
    if (username) {
      const { error } = await supabase
        .from('profiles')
        .update({ pin: newPin })
        .eq('username', username);
        
      if (error) {
        alert("Hubo un error actualizando el PIN.");
      } else {
        alert("¡PIN actualizado exitosamente!");
      }
    }
  };

  const saveYoutubeUrl = async (url: string) => {
    if (username) {
      setYoutubeUrl(url); // Optimistic UI
      await supabase
        .from('profiles')
        .update({ youtube_url: url })
        .eq('username', username);
    }
  };

  const saveReflections = async (globalDay: number, answers: string[]) => {
    if (username) {
      const newReflections = { ...reflections, [globalDay]: answers };
      setReflections(newReflections); // Optimistic UI
      
      await supabase
        .from('profiles')
        .update({ reflections: newReflections })
        .eq('username', username);
    }
  };

  const logout = () => {
    localStorage.removeItem("session_user");
    setIsAuthenticated(false);
    setUsername(null);
  };

  return {
    isAuthenticated,
    loading,
    username,
    completedDays,
    currentDay,
    youtubeUrl,
    reflections,
    markComplete,
    unmarkComplete,
    saveYoutubeUrl,
    saveReflections,
    loginSuccess,
    updatePin,
    logout
  };
}
