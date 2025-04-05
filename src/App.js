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
  Box
} from "@material-ui/core";
import code from "./code";
import "./styles.css";
import { useLanguage } from "./i18n/LanguageContext";
import LanguageSwitcher from "./i18n/LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

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
  const [slugs, setSlugs] = useState([]);
  const [myDomain, setMyDomain] = useState("");
  const [notionUrl, setNotionUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [googleFont, setGoogleFont] = useState("");
  const [customScript, setCustomScript] = useState("");
  const [optional, setOptional] = useState(false);
  const [copied, setCopied] = useState(false);

  const { t } = useLanguage();

  // --- Simplified Theme State and Logic --- 
  // Detect system preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // State for the actual theme type being applied (light or dark)
  const [currentThemeType, setCurrentThemeType] = useState(() => {
    const savedTheme = localStorage.getItem('themeType'); // Read saved preference
    if (savedTheme) {
      return savedTheme; // Use saved preference if exists
    } 
    // Otherwise, follow system preference initially
    return prefersDarkMode ? 'dark' : 'light'; 
  });

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
    localStorage.setItem('themeType', nextThemeType); // Save user's choice
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
        customScript
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
