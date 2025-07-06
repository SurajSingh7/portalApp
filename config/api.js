import { APP_API_BASE_URL, APP_API_ATTENDANCE_URL, APP_BG_COLOR } from "@env";
import { getThemeColor } from "../utils/storage";

// Base URLs from .env
export const API_BASE_URL = APP_API_BASE_URL;
export const API_ATTENDANCE_URL = APP_API_ATTENDANCE_URL;

// Default color from .env
export let APP_BACKGROUND_COLOR = APP_BG_COLOR;

// Load saved theme color
export const loadThemeColor = async () => {
  const savedColor = await getThemeColor();
  if (savedColor) {
    APP_BACKGROUND_COLOR = savedColor; // Override default
  }
};
