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
    enablePrettyUrlLabel: "Use Friendly Web Addresses",
    enablePrettyUrlTooltip: "Converts technical page IDs to human-readable addresses (like '/about' instead of long numbers). Disable if it causes any issues.",
    enableNavAndApiLabel: "Improve Page Navigation and Communication",
    enableNavAndApiTooltip: "Enhances browsing experience, makes browser back/forward buttons work properly, and optimizes communication with Notion servers. Disable if site features stop working.",
    
    // Debug mode setting
    enableDebugModeLabel: "Enable Debug Mode",
    enableDebugModeTooltip: "Shows detailed debug messages in the browser console. Useful for troubleshooting, but should be disabled in production.",

    // Code display
    generatedCode: "Generated Cloudflare Worker Script",
    codeWillAppear: "Generated code will appear here",

    // Tooltips
    switchToLight: "Switch to Light Mode",
    switchToDark: "Switch to Dark Mode",
    resetToSystemTheme: "Reset to System Theme",

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
    enablePrettyUrlLabel: "启用简洁网址",
    enablePrettyUrlTooltip: "将复杂的页面ID转换为易读的网址(如/aboutus而非一长串数字)。如有问题可禁用此功能。",
    enableNavAndApiLabel: "启用通信改善",
    enableNavAndApiTooltip: "增强浏览体验，使浏览器前进、后退按钮正常工作，优化与Notion服务器的通信。如功能异常请禁用。",
    
    // Debug mode setting
    enableDebugModeLabel: "启用调试模式",
    enableDebugModeTooltip: "在浏览器控制台显示详细的调试信息。对排错有帮助，但生产环境应当禁用。",

    // Code display
    generatedCode: "生成的 Cloudflare Worker 脚本",
    codeWillAppear: "生成的代码将显示在这里",

    // Tooltips
    switchToLight: "切换到浅色模式",
    switchToDark: "切换到深色模式",
    resetToSystemTheme: "跟随系统主题",

    // Error messages
    invalidDomain: "请输入有效的域名",
    invalidNotionUrl: "请输入有效的 Notion 页面 URL",
  }
};

export default translations; 