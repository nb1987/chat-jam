import { createContext, useCallback, useEffect, useState } from "react";
import {
  loadMode,
  saveMode,
  DEFAULT_QUIET_MODE,
} from "@frontend/localforage/quietModeStore";

const QuietModeContext = createContext();

export const QuietModeProvider = ({ children }) => {
  const [mode, setMode] = useState(DEFAULT_QUIET_MODE);

  const toggleMode = useCallback(() => {
    setMode((mode) => (mode === "alert" ? "quiet" : "alert"));
  }, []);

  useEffect(() => {
    let mounted = true;

    async function getCurrentMode() {
      const currentMode = await loadMode();
      if (mounted) setMode(currentMode);
    }

    getCurrentMode();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    saveMode(mode);
  }, [mode]);

  return (
    <QuietModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </QuietModeContext.Provider>
  );
};

export default QuietModeContext;
