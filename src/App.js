import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Button,
  Collapse,
  InputAdornment,
  TextField,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
  Grid,
  Box,
  Switch,
  FormControlLabel,
  Tooltip,
  Typography,
  makeStyles
} from "@material-ui/core";
import code from "./code";
import "./styles.css";
import { useLanguage } from "./i18n/LanguageContext";
import LanguageSwitcher from "./i18n/LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

// 创建全局样式，防止滚动条导致的布局跳动
const useStyles = makeStyles(theme => ({
  '@global': {
    html: {
      overflowY: 'scroll', // 始终显示垂直滚动条
    },
    '::-webkit-scrollbar': {
      width: '8px',
      backgroundColor: theme.palette.background.default,
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.divider,
      borderRadius: '4px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    // 平衡右侧滚动条宽度，使内容居中
    body: {
      paddingRight: 'calc(8px)', // 滚动条宽度
    },
    // 控制组件的过渡动画，使其更平滑
    '.MuiCollapse-container': {
      transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms !important',
    }
  },
}));

const DEFAULT_DOMAIN = "";
const DEFAULT_NOTION_URL =
  "https://stephenou.notion.site/771ef38657244c27b9389734a9cbff44";

function validDomain(domain) {
  return domain.match(
    /^((https:\/\/)|(http:\/\/))?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+(\/)?$/
  );
}

function validNotionUrl(url) {
  if (!url) return true;
  try {
    const link = new URL(url);
    return (
      (link.hostname.endsWith("notion.so") || link.hostname.endsWith("notion.site")) &&
      link.pathname.slice(-32).match(/[0-9a-f]{32}/)
    );
  } catch (e) {
    return false;
  }
}

export default function App() {
  // 应用全局样式
  const classes = useStyles();
  
  const [slugs, setSlugs] = useState([]);
  const [myDomain, setMyDomain] = useState("");
  const [notionUrl, setNotionUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [googleFont, setGoogleFont] = useState("");
  const [customScript, setCustomScript] = useState("");
  const [hideWatermark, setHideWatermark] = useState(false);
  const [enablePrettyUrl, setEnablePrettyUrl] = useState(false);
  const [enableNavAndApi, setEnableNavAndApi] = useState(false);
  const [enableDebugMode, setEnableDebugMode] = useState(false);
  const [optional, setOptional] = useState(false);
  const [copied, setCopied] = useState(false);

  const { t } = useLanguage();

  // --- Simplified Theme State and Logic --- 
  // Detect system preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // 添加一个状态来跟踪用户是否已手动设置了主题
  const [userThemePreference, setUserThemePreference] = useState(() => {
    return localStorage.getItem('themeType') !== null;
  });
  
  // State for the actual theme type being applied (light or dark)
  const [currentThemeType, setCurrentThemeType] = useState(() => {
    const savedTheme = localStorage.getItem('themeType'); // Read saved preference
    if (savedTheme) {
      return savedTheme; // Use saved preference if exists
    } 
    // Otherwise, follow system preference initially
    return prefersDarkMode ? 'dark' : 'light'; 
  });

  // 监听系统主题变化
  useEffect(() => {
    // 只有当用户没有手动设置主题时，才跟随系统主题
    if (!userThemePreference) {
      setCurrentThemeType(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode, userThemePreference]);

  // Memoize the theme creation based on the currentThemeType
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          type: currentThemeType,
        },
      }),
    [currentThemeType],
  );

  // Function to toggle theme directly between light and dark
  const toggleTheme = () => {
    const nextThemeType = currentThemeType === 'light' ? 'dark' : 'light';
    setCurrentThemeType(nextThemeType);
    setUserThemePreference(true); // 标记用户已手动设置主题
    localStorage.setItem('themeType', nextThemeType); // Save user's choice
  };

  // 添加重置为系统主题的功能
  const resetToSystemTheme = () => {
    localStorage.removeItem('themeType');
    setUserThemePreference(false);
    setCurrentThemeType(prefersDarkMode ? 'dark' : 'light');
  };
  // --- End Simplified Theme State and Logic ---

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMyDomain = e => {
    setMyDomain(e.target.value);
    setCopied(false);
  };
  const handleNotionUrl = e => {
    setNotionUrl(e.target.value);
    setCopied(false);
  };
  const handlePageTitle = e => {
    setPageTitle(e.target.value);
    setCopied(false);
  };
  const handlePageDescription = e => {
    setPageDescription(e.target.value);
    setCopied(false);
  };
  const handleGoogleFont = e => {
    setGoogleFont(e.target.value);
    setCopied(false);
  };
  const handleCustomScript = e => {
    setCustomScript(e.target.value);
    setCopied(false);
  };
  const handleHideWatermark = (event) => {
    setHideWatermark(event.target.checked);
    setCopied(false);
  };
  const handleEnablePrettyUrl = (event) => {
    setEnablePrettyUrl(event.target.checked);
    setCopied(false);
  };
  const handleEnableNavAndApi = (event) => {
    setEnableNavAndApi(event.target.checked);
    setCopied(false);
  };
  const handleEnableDebugMode = (event) => {
    setEnableDebugMode(event.target.checked);
    setCopied(false);
  };
  const addSlug = () => {
    setSlugs([...slugs, ["", ""]]);
    setCopied(false);
  };
  const deleteSlug = index => {
    setSlugs([...slugs.slice(0, index), ...slugs.slice(index + 1)]);
    setCopied(false);
  };
  const handleCustomURL = (value, index) => {
    setSlugs([
      ...slugs.slice(0, index),
      [value, slugs[index][1]],
      ...slugs.slice(index + 1)
    ]);
    setCopied(false);
  };
  const handleNotionPageURL = (value, index) => {
    setSlugs([
      ...slugs.slice(0, index),
      [slugs[index][0], value],
      ...slugs.slice(index + 1)
    ]);
    setCopied(false);
  };
  const handleOptional = () => {
    setOptional(!optional);
  };
  const domain = myDomain || DEFAULT_DOMAIN;
  const url = notionUrl || DEFAULT_NOTION_URL;
  const myDomainHelperText = !validDomain(domain)
    ? "Please enter a valid domain"
    : undefined;
  const notionUrlHelperText = !validNotionUrl(notionUrl)
    ? "Please enter a valid Notion Page URL"
    : undefined;
  const noError = !myDomainHelperText && !notionUrlHelperText;
  const script = noError
    ? code({
        myDomain: domain,
        notionUrl: url,
        slugs,
        pageTitle,
        pageDescription,
        googleFont,
        customScript,
        hideWatermark,
        enablePrettyUrl,
        enableNavAndApi,
        enableDebugMode
      })
    : undefined;
  const textarea = useRef("");
  const copy = () => {
    if (!noError) return;
    textarea.current.select();
    document.execCommand("copy");
    setCopied(true);
  };

  const CodeSection = (
    <Grid item xs={12} md={6}>
      {noError ? (
        <TextField
          fullWidth
          margin="normal"
          rows={20}
          multiline
          inputRef={textarea}
          value={script}
          variant="outlined"
          label={t.generatedCode}
          style={{ height: 'calc(100% - 16px)' }}
        />
      ) : (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${theme.palette.text.disabled}`, borderRadius: theme.shape.borderRadius, marginTop: '16px' }}>
          {t.codeWillAppear}
        </div>
      )}
    </Grid>
  );

  const ControlsSection = (
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        helperText={myDomainHelperText ? t.invalidDomain : undefined}
        label={t.yourDomain}
        onChange={handleMyDomain}
        margin="normal"
        placeholder={t.yourDomainPlaceholder}
        value={myDomain}
        variant="outlined"
      />
      <TextField
        fullWidth
        helperText={notionUrlHelperText ? t.invalidNotionUrl : undefined}
        label={t.notionURLFor}
        margin="normal"
        onChange={handleNotionUrl}
        placeholder={t.notionURLPlaceholder}
        value={notionUrl}
        variant="outlined"
      />
      {slugs.map(([customUrl, notionPageUrl], index) => {
        return (
          <div key={`slug-${index}`} style={{ marginBottom: theme.spacing(2) }}>
            <TextField
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">{`${domain}/`}</InputAdornment>
                )
              }}
              label={t.prettyLink}
              margin="dense"
              placeholder={t.prettyLinkPlaceholder}
              onChange={e => handleCustomURL(e.target.value, index)}
              value={customUrl}
              variant="outlined"
            />
            <TextField
              fullWidth
              label={`${t.notionURLForLink} ${domain}/${customUrl || t.prettyLinkPlaceholder}`}
              margin="dense"
              placeholder={t.notionURLPlaceholder}
              onChange={e => handleNotionPageURL(e.target.value, index)}
              value={notionPageUrl}
              variant="outlined"
            />
            <Button
              onClick={() => deleteSlug(index)}
              variant="outlined"
              color="secondary"
              size="small"
              style={{ marginTop: theme.spacing(1) }}
            >
              {t.deletePrettyLink}
            </Button>
          </div>
        );
      })}
      <div style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(1) }}>
        <Button
          onClick={addSlug}
          size="small"
          variant="outlined"
          color="primary"
          style={{ marginRight: theme.spacing(1) }}
        >
          {t.addPrettyLink}
        </Button>
        <Button
          onClick={handleOptional}
          size="small"
          variant="outlined"
          color="primary"
        >
          {t.toggleSettings}
        </Button>
      </div>
      <Collapse in={optional} timeout="auto" unmountOnExit>
        <FormControlLabel
          control={<Switch checked={hideWatermark} onChange={handleHideWatermark} name="hideWatermark" />}
          label={t.hideNotionWatermarkLabel}
          style={{ display: 'block', marginBottom: theme.spacing(1) }}
        />
        <Tooltip title={<Typography variant="body2">{t.enablePrettyUrlTooltip}</Typography>} arrow placement="right">
          <FormControlLabel
            control={<Switch checked={enablePrettyUrl} onChange={handleEnablePrettyUrl} name="enablePrettyUrl" />}
            label={t.enablePrettyUrlLabel}
            style={{ display: 'block', marginBottom: theme.spacing(1) }}
          />
        </Tooltip>
        <Tooltip title={<Typography variant="body2">{t.enableNavAndApiTooltip}</Typography>} arrow placement="right">
          <FormControlLabel
            control={<Switch checked={enableNavAndApi} onChange={handleEnableNavAndApi} name="enableNavAndApi" />}
            label={t.enableNavAndApiLabel}
            style={{ display: 'block', marginBottom: theme.spacing(1) }}
          />
        </Tooltip>
        <Tooltip title={<Typography variant="body2">{t.enableDebugModeTooltip}</Typography>} arrow placement="right">
          <FormControlLabel
            control={<Switch checked={enableDebugMode} onChange={handleEnableDebugMode} name="enableDebugMode" />}
            label={t.enableDebugModeLabel}
            style={{ display: 'block', marginBottom: theme.spacing(1) }}
          />
        </Tooltip>
        <TextField
          fullWidth
          label={t.pageTitle}
          margin="normal"
          onChange={handlePageTitle}
          value={pageTitle}
          variant="outlined"
        />
        <TextField
          fullWidth
          label={t.pageDescription}
          margin="normal"
          onChange={handlePageDescription}
          value={pageDescription}
          variant="outlined"
        />
        <TextField
          fullWidth
          label={t.customGoogleFont}
          margin="normal"
          placeholder={t.customGoogleFontPlaceholder}
          onChange={handleGoogleFont}
          value={googleFont}
          variant="outlined"
        />
        <TextField
          fullWidth
          label={t.customScript}
          margin="normal"
          multiline
          placeholder={t.customScriptPlaceholder}
          onChange={handleCustomScript}
          rows={2}
          value={customScript}
          variant="outlined"
        />
      </Collapse>
      <div style={{ marginTop: theme.spacing(3) }}>
        <Button
          disabled={!noError}
          variant="contained"
          color="primary"
          disableElevation
          onClick={copy}
        >
          {copied ? t.copied : t.copyCode}
        </Button>
      </div>
    </Grid>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        display="flex" 
        alignItems="center"
        justifyContent="flex-end" 
        p={1}
        borderBottom={`1px solid ${theme.palette.divider}`}
      >
        <ThemeSwitcher 
          currentThemeType={currentThemeType} 
          toggleTheme={toggleTheme}
          resetToSystemTheme={resetToSystemTheme}
          userThemePreference={userThemePreference}
        />
        <LanguageSwitcher />
      </Box>
      <Grid 
        container 
        spacing={3} 
        style={{ padding: '20px' }}
      >
        {isMobile ? (
          <>
            {ControlsSection}
            {CodeSection}
          </>
        ) : (
          <>
            {CodeSection}
            {ControlsSection}
          </>
        )}
      </Grid>
    </ThemeProvider>
  );
}
