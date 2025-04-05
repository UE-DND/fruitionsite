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
        enableNavAndApi = false
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
  const CUSTOM_SCRIPT = \`${customScript || ''}\`;
  
  /* Step 6: decide whether to hide Notion watermark (true/false) */
  const HIDE_WATERMARK = ${hideWatermark};
  
  /* Step 7: enable pretty URLs (client-side slug) */
  const ENABLE_PRETTY_URL = ${enablePrettyUrl};
  
  /* Step 8: enable history navigation and API proxying */
  const ENABLE_NAV_AND_API = ${enableNavAndApi};
  
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

  async function fetchAndApply(request) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    const url = new URL(request.url);

    // Handle static/special paths first
    if (url.pathname === '/robots.txt') {
      return new Response('Sitemap: https://' + MY_DOMAIN + '/sitemap.xml');
    }
    if (url.pathname === '/sitemap.xml') {
      let response = new Response(generateSitemap());
      response.headers.set('content-type', 'application/xml');
      return response;
    }

    // Handle known slugs - Redirect on MY_DOMAIN
    const requestedSlug = url.pathname.slice(1);
    // Check only if the path doesn't look like a Notion internal ID
    if (!url.pathname.match(/^[0-9a-f]{32}$/) && SLUG_TO_PAGE[requestedSlug] !== undefined) {
        const pageId = SLUG_TO_PAGE[requestedSlug];
        return Response.redirect('https://' + MY_DOMAIN + '/' + pageId, 301);
    }

    // Determine the target host
    const targetHost = getTargetHost(url);

    // Create the target URL
    let fetchUrl = new URL(request.url);
    fetchUrl.hostname = targetHost;

    // Specific handling for Notion JS files (fetch from www, don't modify)
    if (url.pathname.startsWith('/app') && url.pathname.endsWith('js')) {
        fetchUrl.hostname = 'www.notion.so'; // Ensure it's from www
        let jsResponse = await fetch(fetchUrl.toString());
        // Return as-is, DO NOT pass to appendJavascript
        return new Response(jsResponse.body, jsResponse);
    }

    // Specific handling for API requests (fetch from www, POST)
    if (url.pathname.startsWith('/api')) {
        fetchUrl.hostname = 'www.notion.so'; // Ensure it's from www
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
        return response;
    }

    // Remove CSP headers (might be necessary for injected scripts/styles)
    response.headers.delete('Content-Security-Policy');
    response.headers.delete('X-Content-Security-Policy');

    // Only rewrite successful HTML responses
    const contentType = response.headers.get('content-type');
    // Return the response directly, without rewriting.
    // If the page loads now (even if broken), HTMLRewriter is the issue.
    return response;

    // Original logic (commented out for diagnosis):
    // if (contentType && contentType.trim().toLowerCase().startsWith('text/html')) {
    //     return appendJavascript(response, SLUG_TO_PAGE);
    // } else {
    //     // Return other proxied responses (e.g., msgstore, images) directly
    //     return response;
    // }
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
        element.append(\`<link href="https://fonts.googleapis.com/css?family=\${GOOGLE_FONT.replace(' ', '+')}:Regular,Bold,Italic&display=swap" rel="stylesheet">
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
      element.append(\`<div style=\"display:none\">Powered by <a href=\"http://fruitionsite.com\">Fruition</a></div>\`, { html: true });
      element.append(\`<script>\n      const SLUG_TO_PAGE = \${JSON.stringify(this.SLUG_TO_PAGE)};\n      const PAGE_TO_SLUG = {};\n      const slugs = [];
      const pages = [];
      let redirected = false;\n      if (\${enablePrettyUrl}) {\n        function getPage() {\\n        return location.pathname.slice(-32);\\n      }\n      function getSlug() {\\n        return location.pathname.slice(1);\\n      }\n      function updateSlug() {\\n        const slug = PAGE_TO_SLUG[getPage()];\\n        if (slug != null) {\\n          history.replaceState(history.state, '', '/' + slug);\\n        }\\n      }\n      const observer = new MutationObserver(function() {\\n        if (redirected) return;\\n        const nav = document.querySelector('.notion-topbar');
        const mobileNav = document.querySelector('.notion-topbar-mobile');
        if (nav && nav.firstChild && nav.firstChild.firstChild
          || mobileNav && mobileNav.firstChild) {\\n          redirected = true;\\n          updateSlug();\\n          const onpopstate = window.onpopstate;
          window.onpopstate = function() {
            onpopstate.apply(this, [].slice.call(arguments));
            updateSlug();
          };
        }\\n      });
        observer.observe(document.querySelector('#notion-app'), {\\n        childList: true,\\n        subtree: true,\\n      });
        const replaceState = window.history.replaceState;
        window.history.replaceState = function(state) {\\n        if (arguments[1] !== 'bypass' && slugs.includes(getSlug())) return;\\n        return replaceState.apply(window.history, arguments);\\n      };
        const pushState = window.history.pushState;
        window.history.pushState = function(state) {\\n        const dest = new URL(location.protocol + location.host + arguments[2]);
        const id = dest.pathname.slice(-32);\\n        if (pages.includes(id)) {\\n          arguments[2] = '/' + PAGE_TO_SLUG[id];\\n        }\\n        return pushState.apply(window.history, arguments);\\n      };
      }
    </script>\`, { html: true });

      if (CUSTOM_SCRIPT) {
         element.append(\`<script>\${CUSTOM_SCRIPT}</script>\`, { html: true });
      }
    }
  }
  
  async function appendJavascript(res, SLUG_TO_PAGE) {
    return new HTMLRewriter()
      .on('title', new MetaRewriter())
      .on('meta', new MetaRewriter())
      .on('head', new HeadRewriter())
      .on('body', new BodyRewriter(SLUG_TO_PAGE))
      .transform(res);
  }`;
}
