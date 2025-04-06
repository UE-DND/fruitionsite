import React from 'react';
import {
  IconButton,
  Tooltip
} from '@material-ui/core';
import Brightness4Icon from '@material-ui/icons/Brightness4'; // Dark mode icon
import Brightness7Icon from '@material-ui/icons/Brightness7'; // Light mode icon
import ComputerIcon from '@material-ui/icons/Computer';
import { useLanguage } from './i18n/LanguageContext'; // Import useLanguage

// Theme switcher component (Simplified: only toggles between Light/Dark)
const ThemeSwitcher = ({ currentThemeType, toggleTheme, resetToSystemTheme, userThemePreference }) => {
  const { t } = useLanguage(); // Get translation function

  return (
    <div style={{ marginRight: '15px', display: 'flex' }}>
      {userThemePreference && (
        <Tooltip title={t.resetToSystemTheme || "Use system theme"} arrow>
          <IconButton onClick={resetToSystemTheme} color="inherit" size="small">
            <ComputerIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip 
        title={currentThemeType === 'light' ? 
          (t.switchToDark || "Switch to Dark Mode") : 
          (t.switchToLight || "Switch to Light Mode")} 
        arrow
      >
        <IconButton onClick={toggleTheme} color="inherit" size="small">
          {currentThemeType === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default ThemeSwitcher; 