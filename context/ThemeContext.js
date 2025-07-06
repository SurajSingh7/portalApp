import React, { createContext, useState, useEffect } from "react";
import { getThemeColor, saveThemeColor } from "../utils/storage";
import { APP_BG_COLOR } from "@env";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeColor, setThemeColor] = useState(APP_BG_COLOR || "blue");

  useEffect(() => {
    const loadColor = async () => {
      const savedColor = await getThemeColor();
      if (savedColor) setThemeColor(savedColor);
    };
    loadColor();
  }, []);

  const changeTheme = async (color) => {
    setThemeColor(color);
    await saveThemeColor(color);
  };

  const resetTheme = async () => {
    setThemeColor(APP_BG_COLOR || "orange");
    await saveThemeColor(APP_BG_COLOR || "orange");
  };

  return (
    <ThemeContext.Provider
      value={{
        themeColor,
        changeTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
