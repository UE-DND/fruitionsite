import React from 'react';
import { useLanguage } from './LanguageContext';
import { Button, ButtonGroup } from '@material-ui/core';

// 语言切换器组件
const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <ButtonGroup size="small" aria-label="language switcher" style={{ marginLeft: 'auto', marginRight: 0 }}>
      <Button
        variant={language === 'en' ? 'contained' : 'outlined'}
        color="primary"
        onClick={() => changeLanguage('en')}
      >
        English
      </Button>
      <Button
        variant={language === 'zh' ? 'contained' : 'outlined'}
        color="primary"
        onClick={() => changeLanguage('zh')}
      >
        中文
      </Button>
    </ButtonGroup>
  );
};

export default LanguageSwitcher; 