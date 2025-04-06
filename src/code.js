function getId(url) {
    try {
        const id = new URL(url).pathname.slice(-32);
        if (id.match(/[0-9a-f]{32}/)) return id;
        return '';
    } catch (e) {
        return '';
    }
}

export default function code(data) {
    const {
        myDomain,
        notionUrl,
        slugs,
        pageTitle,
        pageDescription,
        googleFont,
        customScript,
        hideWatermark,
        enablePrettyUrl = false,
        enableNavAndApi = false,
        enableDebugMode = false
    } = data || {};
    // Ensure myDomain is treated as a string and handle potential errors gracefully
    let safeDomain = String(myDomain || '');
    let url = safeDomain.replace('https://', '').replace('http://', '');
    if (url.endsWith('/')) url = url.slice(0, -1); // Use endsWith for clarity

    return `  /* CONFIGURATION STARTS HERE */
  
  /* Step 1: enter your domain name like fruitionsite.com */
  const MY_DOMAIN = '${url}';
  
  /*
   * Step 2: enter your URL slug to page ID mapping
   * The key on the left is the slug (without the slash)
   * The value on the right is the Notion page ID
   */
  const SLUG_TO_PAGE = {
    '': '${getId(notionUrl)}',
${slugs
    .map(([pageUrl, notionUrl]) => {
        const id = getId(notionUrl);
        if (!id || !pageUrl) return '';
        return `    '${pageUrl}': '${id}',\n`;
    })
    .join('')}  };
  
  /* Step 3: enter your page title and description for SEO purposes */
  const PAGE_TITLE = '${pageTitle || ''}';
  const PAGE_DESCRIPTION = '${pageDescription || ''}';
  
  /* Step 4: enter a Google Font name, you can choose from https://fonts.google.com */
  const GOOGLE_FONT = '${googleFont || ''}';
  
  /* Step 5: enter any custom scripts you'd like */
  const CUSTOM_SCRIPT = \`${customScript || ''}
// 禁用所有WebSocket连接尝试以避免WebSocket错误
(function() {
  // 保存原始WebSocket构造函数的引用
  const OriginalWebSocket = window.WebSocket;
  // 重写WebSocket构造函数
  window.WebSocket = function(url, protocols) {
    if (url.includes('msgstore') || url.includes('primus') || url.includes('notion.so')) {
      // 返回一个模拟的WebSocket对象，但不实际建立连接
      return {
        url: url,
        readyState: 3, // CLOSED
        send: function() {},
        close: function() {},
        onopen: null,
        onclose: null,
        onerror: null,
        onmessage: null
      };
    }
    // 对于其他WebSocket连接，使用原始WebSocket
    return new OriginalWebSocket(url, protocols);
  };
})();\`;
  
  /* Step 6: decide whether to hide Notion watermark (true/false) */
  const HIDE_WATERMARK = ${hideWatermark};
  
  /* Step 7: enable pretty URLs (client-side slug) */
  const ENABLE_PRETTY_URL = ${enablePrettyUrl};
  
  /* Step 8: enable history navigation and API proxying */
  const ENABLE_NAV_AND_API = ${enableNavAndApi};
  
  /* Step 9: enable debug mode (to see console logging) */
  const DEBUG_MODE = ${enableDebugMode};
  
  /* CONFIGURATION ENDS HERE */
  
  const watermarkCss = HIDE_WATERMARK
    ? '#notion-app > div > div:nth-child(1) > div > div:nth-child(1) > header > div > div.notion-topbar > div > div:nth-child(3) > div:nth-child(2) > div:nth-child(4) { display: none !important; }'
    : '';
  
  const PAGE_TO_SLUG = {};
  const slugs = [];
  const pages = [];
  Object.keys(SLUG_TO_PAGE).forEach(slug => {
    const page = SLUG_TO_PAGE[slug];
    slugs.push(slug);
    pages.push(page);
    PAGE_TO_SLUG[page] = slug;
  });
  
  addEventListener('fetch', event => {
    event.respondWith(fetchAndApply(event.request));
  });

  function generateSitemap() {
    let sitemap = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    slugs.forEach(
      (slug) =>
        (sitemap +=
          '<url><loc>https://' + MY_DOMAIN + '/' + slug + '</loc></url>')
    );
    sitemap += '</urlset>';
    return sitemap;
  }
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  function handleOptions(request) {
    if (request.headers.get('Origin') !== null &&
      request.headers.get('Access-Control-Request-Method') !== null &&
      request.headers.get('Access-Control-Request-Headers') !== null) {
      // Handle CORS pre-flight request.
      return new Response(null, {
        headers: corsHeaders
      });
    } else {
      // Handle standard OPTIONS request.
      return new Response(null, {
        headers: {
          'Allow': 'GET, HEAD, POST, PUT, OPTIONS',
        }
      });
    }
  }
  
  // Helper function to determine target host
  function getTargetHost(url) {
    if (url.pathname.startsWith('/primus-v8')) {
      return 'msgstore.www.notion.so';
    }
    // Default to www.notion.so for API, JS, and main page fetches
    return 'www.notion.so';
  }

  // Debug logging function (only logs when DEBUG_MODE is true)
  function debugLog(...args) {
    if (DEBUG_MODE) {
      console.log('[Fruition Debug]', ...args);
    }
  }

  async function fetchAndApply(request) {
    if (request.method === 'OPTIONS') {
      debugLog('Handling OPTIONS request');
      return handleOptions(request);
    }
    const url = new URL(request.url);
    debugLog('Processing request for:', url.pathname);

    // 拦截所有msgstore和primus相关请求
    if (url.pathname.startsWith('/primus-v8') || url.hostname.includes('msgstore')) {
      debugLog('Intercepting msgstore/primus request:', url.toString());
      return new Response('', { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Handle static/special paths first
    if (url.pathname === '/robots.txt') {
      debugLog('Serving robots.txt');
      return new Response('Sitemap: https://' + MY_DOMAIN + '/sitemap.xml');
    }
    if (url.pathname === '/sitemap.xml') {
      debugLog('Serving sitemap.xml');
      let response = new Response(generateSitemap());
      response.headers.set('content-type', 'application/xml');
      return response;
    }

    // Handle known slugs - Redirect on MY_DOMAIN
    const requestedSlug = url.pathname.slice(1);
    // Check only if the path doesn't look like a Notion internal ID
    if (!url.pathname.match(/^[0-9a-f]{32}$/) && SLUG_TO_PAGE[requestedSlug] !== undefined) {
        const pageId = SLUG_TO_PAGE[requestedSlug];
        debugLog('Redirecting slug to page ID:', requestedSlug, '->', pageId);
        return Response.redirect('https://' + MY_DOMAIN + '/' + pageId, 301);
    }

    // Determine the target host
    const targetHost = getTargetHost(url);
    debugLog('Target host determined:', targetHost);

    // Create the target URL
    let fetchUrl = new URL(request.url);
    fetchUrl.hostname = targetHost;
    debugLog('Fetching from:', fetchUrl.toString());

    // Specific handling for Notion JS files (fetch from www, don't modify)
    if (url.pathname.startsWith('/app') && url.pathname.endsWith('js')) {
        fetchUrl.hostname = 'www.notion.so'; // Ensure it's from www
        debugLog('Fetching JS file directly from notion:', fetchUrl.toString());
        let jsResponse = await fetch(fetchUrl.toString());
        // Return as-is, DO NOT pass to appendJavascript
        return new Response(jsResponse.body, jsResponse);
    }

    // Specific handling for API requests (fetch from www, POST)
    if (url.pathname.startsWith('/api')) {
        fetchUrl.hostname = 'www.notion.so'; // Ensure it's from www
        debugLog('Handling API request:', url.pathname);
        let apiResponse = await fetch(fetchUrl.toString(), {
             body: url.pathname.startsWith('/api/v3/getPublicPageData') ? null : request.body,
             headers: {
               'content-type': 'application/json;charset=UTF-8',
               'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36'
             },
             method: 'POST',
        });
        apiResponse = new Response(apiResponse.body, apiResponse);
        apiResponse.headers.set('Access-Control-Allow-Origin', '*');
        // Return as-is, DO NOT pass to appendJavascript
        return apiResponse;
    }

    // General proxying for all other requests (HTML page, images, fonts, msgstore/primus)
    debugLog('Proxying general request');
    let response = await fetch(fetchUrl.toString(), {
        body: request.body,
        headers: request.headers,
        method: request.method,
    });

    // Make response mutable for header changes
    response = new Response(response.body, response);

    // Check if the fetch was successful before proceeding
    if (!response.ok) {
        // Return the error response directly
        debugLog('Error response:', response.status, response.statusText);
        return response;
    }

    // Remove CSP headers (might be necessary for injected scripts/styles)
    response.headers.delete('Content-Security-Policy');
    response.headers.delete('X-Content-Security-Policy');

    // Only rewrite successful HTML responses
    const contentType = response.headers.get('content-type');
    // Use startsWith after trimming and lowercasing for robustness
    if (contentType && contentType.trim().toLowerCase().startsWith('text/html')) {
        debugLog('Processing HTML response');
        return appendJavascript(response, SLUG_TO_PAGE);
    } else {
        // Return other proxied responses (e.g., msgstore, images) directly
        debugLog('Serving non-HTML response');
        return response;
    }
  }
  
  class MetaRewriter {
    element(element) {
      if (PAGE_TITLE) {
        if (element.getAttribute('property') === 'og:title'
          || element.getAttribute('name') === 'twitter:title') {
          element.setAttribute('content', PAGE_TITLE);
        }
        if (element.tagName === 'title') {
          element.setInnerContent(PAGE_TITLE);
        }
      }
      if (PAGE_DESCRIPTION) {
        if (element.getAttribute('name') === 'description'
          || element.getAttribute('property') === 'og:description'
          || element.getAttribute('name') === 'twitter:description') {
          element.setAttribute('content', PAGE_DESCRIPTION);
        }
      }
      if (element.getAttribute('property') === 'og:url'
        || element.getAttribute('name') === 'twitter:url') {
        element.setAttribute('content', MY_DOMAIN);
      }
      if (element.getAttribute('name') === 'apple-itunes-app') {
        element.remove();
      }
    }
  }
  
  class HeadRewriter {
    element(element) {
      if (GOOGLE_FONT !== '') {
        // 确保 GOOGLE_FONT 被视为字符串类型
        const fontFamily = String(GOOGLE_FONT).replace(' ', '+');
        element.append(\`<link href="https://fonts.googleapis.com/css?family=\${fontFamily}:Regular,Bold,Italic&display=swap" rel="stylesheet">
        <style>* { font-family: "\${GOOGLE_FONT}" !important; }</style>\`, {
          html: true
        });
      }
      if (watermarkCss) {
        element.append(\`<style>\n          \${watermarkCss}\n        </style>\`, {
          html: true
        });
      }
    }
  }
  
  class BodyRewriter {
    constructor(SLUG_TO_PAGE) {
      this.SLUG_TO_PAGE = SLUG_TO_PAGE;
    }
    element(element) {
      element.append(\`<div style="display:none">Powered by <a href="http://fruitionsite.com">Fruition</a></div>\`, { html: true });
      element.append(\`<script>
      const SLUG_TO_PAGE = \${JSON.stringify(this.SLUG_TO_PAGE)};
      const PAGE_TO_SLUG = {};
      const slugs = [];
      const pages = [];
      let redirected = false;
      const DEBUG_MODE = \${DEBUG_MODE};
      
      // 静默日志函数，只在调试模式才输出
      function silentLog(...args) {
        if (DEBUG_MODE) {
          console.log('[Fruition Client]', ...args);
        }
      }

      // 用于记录性能的辅助函数
      function debugPerformance(label, fn) {
        if (!DEBUG_MODE) return fn();
        
        silentLog('Start:', label);
        const startTime = performance.now();
        const result = fn();
        const endTime = performance.now();
        silentLog('End:', label, 'took', (endTime - startTime).toFixed(2), 'ms');
        return result;
      }
      
      // 阻止所有WebSocket连接
      (function() {
        silentLog('Installing WebSocket interceptor');
        const OriginalWebSocket = window.WebSocket;
        window.WebSocket = function(url, protocols) {
          if (url.includes('msgstore') || url.includes('primus') || url.includes('notion.so')) {
            silentLog('Blocked WebSocket connection to:', url);
            return {
              url: url,
              readyState: 3, // CLOSED
              send: function() {
                silentLog('Blocked WebSocket.send() call');
              },
              close: function() {},
              onopen: null,
              onclose: null,
              onerror: null,
              onmessage: null
            };
          }
          silentLog('Allowing WebSocket connection to:', url);
          return new OriginalWebSocket(url, protocols);
        };
      })();
      
      if (${enablePrettyUrl}) {
        // Initialize vars needed for pretty URLs
        silentLog('Initializing Pretty URLs module');
        const PAGE_TO_SLUG = {};
        const slugs = [];
        const pages = [];
        Object.keys(SLUG_TO_PAGE).forEach(slug => {
          const page = SLUG_TO_PAGE[slug];
          slugs.push(slug);
          pages.push(page);
          PAGE_TO_SLUG[page] = slug;
        });
        silentLog('Slug mappings initialized:', Object.keys(SLUG_TO_PAGE).length, 'entries');

        // Restore function definitions
        function getPage() {
          return location.pathname.slice(-32);
        }
        function getSlug() {
          return location.pathname.slice(1);
        }
        function updateSlug() {
          silentLog('updateSlug called');
          silentLog('Current location.pathname:', location.pathname);
          const pageId = getPage();
          silentLog('Extracted pageId:', pageId);
          // Log the entire map for debugging
          if (DEBUG_MODE) {
            silentLog('PAGE_TO_SLUG map:', PAGE_TO_SLUG);
          }
          const slug = PAGE_TO_SLUG[pageId];
          silentLog('Found slug:', slug);
          if (slug != null) {
            silentLog('Attempting history.replaceState with:', '/' + slug);
            try {
              history.replaceState(history.state, '', '/' + slug);
              silentLog('history.replaceState succeeded');
            } catch (e) {
              silentLog('history.replaceState failed:', e);
            }
          } else {
            silentLog('No slug found for this pageId. URL not changed.');
          }
        }
        // Restore observer creation and start observation
        silentLog('Setting up MutationObserver');
        const observer = new MutationObserver(function() {
          if (redirected) return;
          const nav = document.querySelector('.notion-topbar');
          const mobileNav = document.querySelector('.notion-topbar-mobile');
          if (nav || mobileNav) {
            silentLog('Notion navigation detected, updating slug');
            redirected = true;
            updateSlug();
          }
        });
    
        // Start observing DOM changes
        silentLog('Starting observation of DOM changes');
        debugPerformance('observer.observe', () => {
          observer.observe(document.querySelector('#notion-app'), {
            childList: true,
            subtree: true,
          });
        });
   
        // Override history methods
        silentLog('Installing history API overrides');
        const replaceState = window.history.replaceState;
        window.history.replaceState = function(state) {
          // 更全面地检查跨域URL
          try {
            let intendedUrl = arguments[2];
            silentLog('replaceState called with URL:', intendedUrl);
            if (typeof intendedUrl === 'string') {
              // 如果是完整URL（以http开头）
              if (intendedUrl.startsWith('http')) {
                const urlObject = new URL(intendedUrl);
                if (urlObject.origin !== location.origin) {
                  silentLog('Blocked replaceState to cross-origin URL:', intendedUrl);
                  return;
                }
              }
              // 检查URL是否包含notion.site或notion.so（防止跨域重定向）
              else if (intendedUrl.includes('notion.site') || intendedUrl.includes('notion.so')) {
                silentLog('Blocked replaceState to Notion URL:', intendedUrl);
                return;
              }
            }
          } catch (e) { 
            silentLog('Error checking replaceState URL:', e);
            return; // 出错时不执行原始replaceState
          }

          // 原始Fruition逻辑
          if (arguments[1] !== 'bypass' && slugs.includes(getSlug())) {
            silentLog('Skipping replaceState due to bypass check');
            return;
          }
          silentLog('Proceeding with original replaceState');
          return replaceState.apply(window.history, arguments);
        };

        const pushState = window.history.pushState;
        window.history.pushState = function(state) {
          // 更全面地检查跨域URL
          try {
            let intendedUrl = arguments[2];
            silentLog('pushState called with URL:', intendedUrl);
            if (typeof intendedUrl === 'string') {
              // 如果是完整URL（以http开头）
              if (intendedUrl.startsWith('http')) {
                const urlObject = new URL(intendedUrl);
                if (urlObject.origin !== location.origin) {
                  silentLog('Blocked pushState to cross-origin URL:', intendedUrl);
                  return;
                }
              }
              // 检查URL是否包含notion.site或notion.so（防止跨域重定向）
              else if (intendedUrl.includes('notion.site') || intendedUrl.includes('notion.so')) {
                silentLog('Blocked pushState to Notion URL:', intendedUrl);
                return;
              }
              // 尝试将Notion页面ID映射到slug
              else {
                const urlObject = new URL(location.protocol + '//' + location.host + intendedUrl);
                const id = urlObject.pathname.slice(-32);
                silentLog('Checking if pathname contains Notion ID:', id);
                if (pages.includes(id)) {
                  arguments[2] = '/' + PAGE_TO_SLUG[id];
                  silentLog('Mapped pushState URL to slug:', arguments[2]);
                }
              }
            }
          } catch (e) { 
            silentLog('Error checking pushState URL:', e); 
            return; // 出错时不执行原始pushState
          }

          silentLog('Proceeding with original pushState');
          return pushState.apply(window.history, arguments);
        };
      }
      // 使用来自外部'code'函数作用域的变量
      if (${enableNavAndApi}) {
        // 处理浏览器历史导航（前进/后退按钮）
        silentLog('Setting up browser history navigation handlers');
        const onpopstate = window.onpopstate;
        window.onpopstate = function(event) {
          silentLog('popstate event triggered');
          // 首先调用原始处理程序
          if (onpopstate) {
            silentLog('Calling original onpopstate handler');
            onpopstate.apply(this, arguments);
          }
          // 导航后，根据可能改变的URL更新slug
          // 检查updateSlug是否存在（如果禁用了PrettyURL）
          if (typeof updateSlug === 'function') {
            silentLog('Calling updateSlug after navigation');
            updateSlug();
          } else {
            silentLog('updateSlug function not available in onpopstate');
          }
        };

        // 处理API代理（XHR覆盖）
        silentLog('Installing XHR interceptors');
        const open = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function() {
          // 阻止所有msgstore请求
          if (typeof arguments[1] === 'string') {
            if (arguments[1].includes('msgstore') || arguments[1].includes('primus-v8')) {
              silentLog('Blocked XHR request to:', arguments[1]);
              this._blocked = true;
              return;
            } else {
              // 其他请求正常处理
              silentLog('Proxying XHR request from', '${url}', 'to www.notion.so');
              arguments[1] = arguments[1].replace('${url}', 'www.notion.so');
            }
          }
          return open.apply(this, [].slice.call(arguments));
        };
        
        // 覆盖其他XHR方法以确保被阻止的请求不执行
        const send = window.XMLHttpRequest.prototype.send;
        window.XMLHttpRequest.prototype.send = function() {
          if (this._blocked) {
            silentLog('Simulating success for blocked XHR request');
            // 对于被阻止的请求，模拟成功完成但不实际发送
            setTimeout(() => {
              // 模拟一个加载完成的状态
              Object.defineProperty(this, 'readyState', {value: 4});
              Object.defineProperty(this, 'status', {value: 200});
              Object.defineProperty(this, 'response', {value: ''});
              Object.defineProperty(this, 'responseText', {value: ''});
              
              // 触发事件
              if (typeof this.onreadystatechange === 'function') {
                silentLog('Triggering onreadystatechange');
                this.onreadystatechange();
              }
              if (typeof this.onload === 'function') {
                silentLog('Triggering onload');
                this.onload();
              }
            }, 0);
            return;
          }
          silentLog('Proceeding with original XHR send');
          return send.apply(this, arguments);
        };
        
        // 覆盖fetch API以阻止msgstore请求
        silentLog('Installing fetch API interceptor');
        const originalFetch = window.fetch;
        window.fetch = function(resource, options) {
          if (typeof resource === 'string' && 
             (resource.includes('msgstore') || resource.includes('primus-v8'))) {
            silentLog('Blocked fetch request to:', resource);
            // 返回空响应的promise，但使用blob URL以确保同源
            return Promise.resolve(new Response(new Blob([], {type: 'application/json'}), {
              status: 200,
              headers: {'Content-Type': 'application/json'}
            }));
          }
          silentLog('Proceeding with original fetch for:', resource);
          return originalFetch.apply(this, arguments);
        };
      }
      
      // 初始化完成消息
      silentLog('Fruition client-side script initialized successfully');
      if (DEBUG_MODE) {
        console.log('[Fruition] Debug mode is ENABLED. Performance may be affected.');
        console.log('[Fruition] Site configuration:', {
          domain: '${url}',
          prettyUrls: ${enablePrettyUrl},
          navAndApi: ${enableNavAndApi},
          slugMappings: Object.keys(SLUG_TO_PAGE).length
        });
      }
      </script>\`, { html: true });
    }
  }
  
  async function appendJavascript(res, SLUG_TO_PAGE) {
    debugLog('Appending javascript to HTML response');
    return new HTMLRewriter()
      .on('title', new MetaRewriter())
      .on('meta', new MetaRewriter())
      .on('head', new HeadRewriter())
      .on('body', new BodyRewriter(SLUG_TO_PAGE))
      .transform(res);
  }
  `;
}