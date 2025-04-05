import React from 'react';
import {
  IconButton,
  Tooltip
} from '@material-ui/core';
import Brightness4Icon from '@material-ui/icons/Brightness4'; // Dark mode icon
import Brightness7Icon from '@material-ui/icons/Brightness7'; // Light mode icon
import { useLanguage } from './i18n/LanguageContext'; // Import useLanguage

// Theme switcher component (Simplified: only toggles between Light/Dark)
const ThemeSwitcher = ({ currentThemeType, toggleTheme }) => {
  const { t } = useLanguage(); // Get translation function

  // Determine which icon and tooltip to display based on the current theme
  const isDark = currentThemeType === 'dark';
  const icon = isDark ? <Brightness7Icon /> : <Brightness4Icon />;
  // Use translation keys for the tooltip
  const tooltip = isDark ? t.switchToLight : t.switchToDark; 

  return (
    <Tooltip title={tooltip}> 
      <IconButton 
        onClick={toggleTheme} 
        color="inherit"
        aria-label="toggle theme"
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher; 