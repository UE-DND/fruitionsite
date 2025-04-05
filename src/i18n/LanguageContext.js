import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from './translations';

// Create Language Context
const LanguageContext = createContext();

// Provider component that wraps the app and provides language context
export const LanguageProvider = ({ children }) => {
  // Get preferred language from browser, default to English
  const getBrowserLanguage = () => {
    // Get browser language setting (navigator.language returns e.g., 'zh-CN', 'en-US')
    const browserLang = navigator.language || navigator.userLanguage;
    // Take only the first two chars of the language code (zh, en)
    const lang = browserLang.substring(0, 2).toLowerCase();
    // Check if the language is supported, otherwise default to English
    return translations[lang] ? lang : 'en';
  };

  // Get language setting from local storage, or fall back to browser language
  const getInitialLanguage = () => {
    const savedLang = localStorage.getItem('preferredLanguage');
    return savedLang || getBrowserLanguage();
  };

  // State: current language
  const [language, setLanguage] = useState(getInitialLanguage);
  
  // State: translated texts for the current language
  const [t, setT] = useState(translations[language]);

  // Function to change the language
  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      setT(translations[lang]);
      localStorage.setItem('preferredLanguage', lang);
    }
  };

  // Update document.documentElement lang attribute on initial load and language change
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Provide language context value
  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to easily use the language context in components
export const useLanguage = () => useContext(LanguageContext); 