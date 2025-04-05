// Translation dictionary: contains text for English and Chinese
const translations = {
  en: {
    // InputFields
    yourDomain: "Your Domain",
    yourDomainPlaceholder: "example.org",
    notionURLFor: "Notion URL for",
    notionURLPlaceholder: "Enter your Notion share link here",
    prettyLink: "Pretty Link",
    prettyLinkPlaceholder: "about",
    notionURLForLink: "Notion URL for",

    // Buttons
    addPrettyLink: "Add a pretty link",
    deletePrettyLink: "Delete this pretty link",
    toggleSettings: "Toggle Style And Script Settings",
    copyCode: "Copy the code",
    copied: "Copied!",

    // Optional settings
    pageTitle: "SEO Page Title",
    pageDescription: "SEO Page Description",
    customGoogleFont: "Custom Google Font",
    customGoogleFontPlaceholder: "Open Sans",
    customScript: "Paste Your Custom Script",
    customScriptPlaceholder: "e.g. Google Analytics",
    hideNotionWatermarkLabel: "Hide Notion Watermark",

    // New setting for history manipulation
    enablePrettyUrlLabel: "Enable Pretty URLs (Client-side Slugs)",
    enablePrettyUrlTooltip: "Updates browser URL to show slugs like '/about' after page loads and during navigation. Disable if it causes issues.",
    enableNavAndApiLabel: "Enable Browser History Nav & API Proxy",
    enableNavAndApiTooltip: "Handles browser back/forward buttons and proxies API requests. Disable if history navigation or specific Notion features break.",

    // Code display
    generatedCode: "Generated Cloudflare Worker Script",
    codeWillAppear: "Generated code will appear here",

    // Tooltips
    switchToLight: "Switch to Light Mode",
    switchToDark: "Switch to Dark Mode",

    // Errors
    invalidDomain: "Please enter a valid domain",
    invalidNotionUrl: "Please enter a valid Notion Page URL",
  },
  zh: {
    // Input Fields
    yourDomain: "您的域名",
    yourDomainPlaceholder: "example.org",
    notionURLFor: "您的 Notion 页面 发布链接",
    notionURLPlaceholder: "在此粘贴您的 Notion 发布链接",
    prettyLink: "自定义路径",
    prettyLinkPlaceholder: "about",
    notionURLForLink: "目标 Notion 页面 (对应路径: /",

    // Buttons
    addPrettyLink: "添加自定义slug链接",
    deletePrettyLink: "删除此自定义slug链接",
    toggleSettings: "切换样式和脚本设置",
    copyCode: "复制代码",
    copied: "已复制！",

    // Optional settings
    pageTitle: "SEO页面标题",
    pageDescription: "SEO页面描述",
    customGoogleFont: "自定义 Google 字体",
    customGoogleFontPlaceholder: "Open Sans",
    customScript: "粘贴您的自定义脚本",
    customScriptPlaceholder: "例如: Google Analytics 代码",
    hideNotionWatermarkLabel: "隐藏 Notion 水印",

    // New setting for history manipulation
    enablePrettyUrlLabel: "启用简洁 URL (客户端 Slug)",
    enablePrettyUrlTooltip: "页面加载和导航时，将浏览器地址栏更新为简洁路径（如 /about）。如果导致问题请禁用。",
    enableNavAndApiLabel: "启用浏览器历史导航与 API 代理",
    enableNavAndApiTooltip: "处理浏览器前进/后退按钮并代理 API 请求。如果历史导航或某些 Notion 功能异常，请禁用此项。",

    // Code display
    generatedCode: "生成的 Cloudflare Worker 脚本",
    codeWillAppear: "生成的代码将显示在这里",

    // Tooltips
    switchToLight: "切换到浅色模式",
    switchToDark: "切换到深色模式",

    // Error messages
    invalidDomain: "请输入有效的域名",
    invalidNotionUrl: "请输入有效的 Notion 页面 URL",
  }
};

export default translations; 