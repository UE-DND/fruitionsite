[Read this in Chinese (阅读中文版本)](README_zh.md)

# Fruition: Free, Open Source Toolkit for Customizing Notion Pages

## Project Overview

Fruition is a free, open-source toolkit for customizing and deploying Notion pages as standalone websites. By proxying Notion pages through Cloudflare Workers, it enables features like custom domains, pretty URLs, and enhanced SEO while maintaining connection with the Notion backend.

*   **Use cases:** Ideal for personal portfolios, blogs, landing pages, and business websites.
*   **Features:** Pretty URLs, custom domains, Google Fonts, SEO support, script injection.
*   **Benefits:** Completely free, no vendor lock-in, open source.

For detailed setup steps, visit https://fruitionsite.com

This project contains two main parts:
1.  A React application providing a user-friendly interface to configure and generate the Worker script.
2.  A static `worker.js` file that you can directly paste into Cloudflare's editor.

## Core Features (Modified based on the [original author's repository](https://github.com/stephenou/fruitionsite))

### 1. Custom Domain Support

Allows users to host Notion pages under their own domain instead of the default `notion.so` domain. Simply set up DNS records pointing to Cloudflare and deploy the Worker script.
**Theoretically**, using Fruition with a custom domain might help bypass GFW restrictions on the `notion.site` domain. (Humorously, Cloudflare itself is also blocked. So the best method is still to [build your own site](https://github.com/tangly1024/NotionNext) and deploy it on a server 🤣)

### 2. Pretty URLs

Converts Notion's default long IDs (e.g., `https://www.notion.so/username/771ef38657244c27b9389734a9cbff44`) into clean, memorable URLs (e.g., `https://yourdomain.com/about`).

Implementation:
- Server-side configuration mapping slugs to Notion page IDs.
- Client-side JavaScript dynamically replaces URLs using the History API.

### 3. SEO Enhancement

Improves the visibility of Notion pages in search engines:
- Custom page titles and descriptions.
- Automatic generation of `sitemap.xml`.
- Provides `robots.txt`.
- Removes unnecessary browser CSP headers.

### 4. Custom Styles and Scripts

- Supports Google Fonts integration.
- Option to hide the Notion watermark.
- Allows injection of custom JavaScript.

### 5. Enhanced Browsing Experience

- Fixes browser history navigation (back/forward buttons).
- Optimizes communication with Notion servers.
- Blocks unnecessary WebSocket connections to reduce console errors.

### 6. Multi-language Support

- Provides English and Chinese interfaces.
- Supports automatic detection based on browser language.
- Allows manual language switching.

### 7. Theme Switching

- Supports light/dark modes.
- Can automatically adapt based on system settings.
- Supports user manual preference settings.

## Technical Implementation

### How Cloudflare Workers Work

Cloudflare Worker acts as a proxy layer between the user and Notion servers:

1.  **Request Interception:** The Worker captures all requests to the custom domain.
2.  **Request Forwarding:** Forwards requests to the appropriate Notion server based on type:
    -   Main page content → `www.notion.so`
    -   API requests → `www.notion.so`
    -   Real-time messages → `msgstore.www.notion.so`
3.  **Response Modification:**
    -   Replaces domain names in absolute links.
    -   Injects custom scripts and styles.
    -   Removes security restriction headers (e.g., CSP).
4.  **Special Path Handling:**
    -   `/robots.txt`: Automatically generated and returned.
    -   `/sitemap.xml`: Generated based on configured slugs.
    -   Slug paths: Redirected to the corresponding Notion page ID.

### Client-side Enhancements

The Worker injects JavaScript into the page to provide additional functionality:

1.  **URL Replacement:**
    -   Uses `MutationObserver` to monitor page changes.
    -   Performs URL updates when the navigation bar loads.
    -   Overrides History API (`pushState`/`replaceState`) to handle navigation.
2.  **Request Interception:**
    -   Overrides `XMLHttpRequest` and `fetch` APIs.
    -   Reroutes API requests to Notion servers.
    -   Blocks or simulates responses for certain useless requests.
3.  **WebSocket Management:**
    -   Rewrites the `WebSocket` constructor.
    -   Returns a simulated closed `WebSocket` object.
    -   Prevents unnecessary real-time connections and related errors.

## Configuration Options

The Worker script supports the following configurations:

1.  `MY_DOMAIN`: Custom domain name.
2.  `SLUG_TO_PAGE`: Mapping of URL paths to Notion page IDs.
3.  `PAGE_TITLE`/`PAGE_DESCRIPTION`: SEO metadata.
4.  `GOOGLE_FONT`: Custom Google Font.
5.  `CUSTOM_SCRIPT`: User-defined custom script.
6.  `HIDE_WATERMARK`: Whether to hide the Notion watermark.
7.  `ENABLE_PRETTY_URL`: Enable the Pretty URLs feature.
8.  `ENABLE_NAV_AND_API`: Enable history navigation and API proxy optimization.
9.  `DEBUG_MODE`: Enable detailed debug logging.

## Deployment Process

1.  Create a Cloudflare account and add your domain.
2.  Set up DNS records pointing to Cloudflare.
3.  Create a new Worker in Cloudflare Workers.
4.  Use the Fruition UI to generate the Worker script.
5.  Copy the generated script into the Cloudflare Worker editor.
6.  Deploy the Worker and bind it to your custom domain.

For detailed setup steps, visit https://fruitionsite.com

## Limitations

1.  Not possible to proxy subpages embedded in Notion pages (actually pointing to the original publishing link)
2.  Some advanced Notion features (like real-time collaboration) might be limited.
3.  Daily request limits on Cloudflare Workers' free plan.
4.  Dependency on Notion's API stability.
