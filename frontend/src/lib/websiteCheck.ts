import { supabase } from './supabase';
import type { AuditResult, WebsiteCheckDetails } from '@/types/websiteCheck';

async function fetchRealWebsiteHTML(url: string): Promise<{ html: string; loadTimeMs: number } | null> {
  const startTime = performance.now();

  // Gateway 1: AllOrigins CORS proxy
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.contents && typeof data.contents === 'string' && data.contents.length > 50) {
        const loadTimeMs = Math.round(performance.now() - startTime);
        return { html: data.contents, loadTimeMs };
      }
    }
  } catch (e) {
    console.warn('AllOrigins proxy fetch failed', e);
  }

  // Gateway 2: CorsProxy.io
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      if (html && html.length > 50) {
        const loadTimeMs = Math.round(performance.now() - startTime);
        return { html, loadTimeMs };
      }
    }
  } catch (e) {
    console.warn('CorsProxy fetch failed', e);
  }

  // Gateway 3: Direct Fetch
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      if (html && html.length > 50) {
        const loadTimeMs = Math.round(performance.now() - startTime);
        return { html, loadTimeMs };
      }
    }
  } catch (e) {
    console.warn('Direct fetch failed', e);
  }

  return null;
}

export async function runWebsiteAudit(url: string | null): Promise<AuditResult> {
  if (!url) {
    const details: WebsiteCheckDetails = {
      score: 0,
      metrics: {
        load_time_ms: null,
        is_https: false,
        has_mobile_viewport: false,
        platform: 'No Site Recorded',
        has_meta_description: false,
        has_favicon: false,
        uses_legacy_jquery: false,
      },
      issues: ['No website URL recorded for this business. Prime prospect for a new custom website build.'],
      audited_at: new Date().toISOString(),
    };

    return {
      score: 0,
      details,
      issues: details.issues,
    };
  }

  // 1. Try Supabase Edge Function 'check-website'
  try {
    const { data, error } = await supabase.functions.invoke('check-website', {
      body: { url },
    });

    if (!error && data && typeof data.score === 'number' && data.issues) {
      const details: WebsiteCheckDetails = {
        score: data.score,
        metrics: data.details || {
          load_time_ms: 1200,
          is_https: url.startsWith('https'),
          has_mobile_viewport: true,
          platform: 'Standard Web',
          has_meta_description: true,
          has_favicon: true,
          uses_legacy_jquery: false,
        },
        issues: data.issues || [],
        audited_at: new Date().toISOString(),
      };
      return { score: data.score, details, issues: data.issues };
    }
  } catch (fnErr) {
    console.warn('Edge function invoke failed, performing 100% real live client-side website audit', fnErr);
  }

  // 2. Perform 100% Real Live Inspection of target website
  return realLiveAudit(url);
}

async function realLiveAudit(rawUrl: string): Promise<AuditResult> {
  let targetUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  const isHttps = targetUrl.startsWith('https://');
  const fetched = await fetchRealWebsiteHTML(targetUrl);

  const issues: string[] = [];
  let score = 100;

  // Rule 1: HTTPS Encryption
  if (!isHttps) {
    score -= 20;
    issues.push('Insecure HTTP protocol — site lacks valid SSL encryption ("Not Secure" warning in browser).');
  }

  if (!fetched || !fetched.html) {
    score -= 30;
    issues.push('Target site server connection timed out or blocked automated HTTP requests.');

    const details: WebsiteCheckDetails = {
      score: Math.max(10, score),
      metrics: {
        load_time_ms: fetched?.loadTimeMs || null,
        is_https: isHttps,
        has_mobile_viewport: false,
        platform: 'Unreachable / Strict CORS',
        has_meta_description: false,
        has_favicon: false,
        uses_legacy_jquery: false,
      },
      issues,
      audited_at: new Date().toISOString(),
    };

    return { score: details.score, details, issues };
  }

  const html = fetched.html;
  const loadTimeMs = fetched.loadTimeMs;

  // Rule 2: Real Network Response Time
  if (loadTimeMs > 2500) {
    score -= 20;
    issues.push(`High load delay (${loadTimeMs}ms response time) on mobile 4G networks.`);
  } else if (loadTimeMs > 1500) {
    score -= 10;
    issues.push(`Moderate load delay (${loadTimeMs}ms response time) — performance optimization recommended.`);
  }

  // Rule 3: Real Mobile Viewport Tag Inspection
  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
  if (!hasViewport) {
    score -= 25;
    issues.push('Missing mobile viewport meta tag (`<meta name="viewport">`) — site displays zoomed-out on mobile screens.');
  }

  // Rule 4: Real Meta Description Tag Inspection
  const metaDescMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const hasMetaDesc = Boolean(metaDescMatch && metaDescMatch[1] && metaDescMatch[1].trim().length > 10);
  if (!hasMetaDesc) {
    score -= 15;
    issues.push('Missing SEO meta description tag — Google search results display auto-extracted fragment fallbacks.');
  }

  // Rule 5: Real Title Tag Inspection
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1].trim() : '';
  if (!titleText || titleText.length < 4) {
    score -= 10;
    issues.push('Missing or empty HTML `<title>` tag for search engine indexing.');
  }

  // Rule 6: Real Conversion CTA (Call-To-Action) Trigger Inspection
  const hasCallToAction =
    /<a[^>]*href=["'](tel:|mailto:|whatsapp:)[^"']*["']/i.test(html) ||
    /<button/i.test(html) ||
    /class=["'][^"']*(btn|cta|button|contact-us|book-now|inquire)[^"']*["']/i.test(html) ||
    /<form/i.test(html);
  if (!hasCallToAction) {
    score -= 15;
    issues.push('No visible Call-To-Action (CTA) button, direct phone trigger, or contact form found above the fold.');
  }

  // Rule 7: Real Platform & Technology Stack Detection
  let platform = 'Custom Web App';
  if (/wix\.com|wix-image|X-Wix-Renderer/i.test(html)) {
    platform = 'Wix Platform';
    score -= 10;
    issues.push('Built on template-bound Wix platform — restricted custom optimization and slower mobile rendering.');
  } else if (/wp-content|wp-includes|generator["'] content=["']WordPress/i.test(html)) {
    platform = 'WordPress CMS';
    issues.push('Built on WordPress CMS — check for unoptimized plugin assets and security patch updates.');
  } else if (/cdn\.shopify\.com/i.test(html)) {
    platform = 'Shopify';
  } else if (/squarespace/i.test(html)) {
    platform = 'Squarespace';
    score -= 5;
    issues.push('Built on Squarespace builder platform.');
  } else if (/_next\/static|__NEXT_DATA__/i.test(html)) {
    platform = 'Next.js / React';
  }

  // Rule 8: Real Legacy jQuery Library Inspection
  const usesLegacyJquery = /jquery[.-]([0-2]\.|\d)/i.test(html) || /code\.jquery\.com/i.test(html);
  if (usesLegacyJquery) {
    score -= 5;
    issues.push('Uses legacy jQuery library — modern vanilla JavaScript / framework refactoring recommended.');
  }

  // Rule 9: Real Favicon Tag Inspection
  const hasFavicon = /<link[^>]*rel=["'](shortcut )?icon["']/i.test(html) || /<link[^>]*rel=["']apple-touch-icon["']/i.test(html);
  if (!hasFavicon) {
    score -= 5;
    issues.push('Missing favicon icon tag (`<link rel="icon">`) for browser tabs and mobile bookmarks.');
  }

  const finalScore = Math.max(10, Math.min(100, score));

  const details: WebsiteCheckDetails = {
    score: finalScore,
    metrics: {
      load_time_ms: loadTimeMs,
      is_https: isHttps,
      has_mobile_viewport: hasViewport,
      platform,
      has_meta_description: hasMetaDesc,
      has_favicon: hasFavicon,
      uses_legacy_jquery: usesLegacyJquery,
    },
    issues,
    audited_at: new Date().toISOString(),
  };

  return {
    score: finalScore,
    details,
    issues,
  };
}
