import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditRequest {
  url: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = (await req.json()) as AuditRequest;

    if (!url) {
      return new Response(
        JSON.stringify({
          score: 0,
          details: null,
          issues: ["No website URL provided for business."],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    const issues: string[] = [];
    let score = 0;
    const startTime = Date.now();
    let response: Response | null = null;
    let htmlText = "";
    let isHttps = targetUrl.startsWith("https://");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SetuLeads-Inspector/1.0",
        },
      });
      clearTimeout(timeoutId);

      htmlText = await response.text();
    } catch (err: any) {
      // Failed to load
      return new Response(
        JSON.stringify({
          score: 15,
          details: {
            load_time_ms: null,
            is_https: isHttps,
            has_mobile_viewport: false,
            platform: "unreachable",
            has_meta_description: false,
            has_favicon: false,
            uses_legacy_jquery: false,
          },
          issues: [
            "Website server is unreachable or timing out (>6s).",
            !isHttps ? "Insecure HTTP connection without SSL certificate." : "SSL / DNS connection issue.",
            "High risk of total client bounce due to site failure.",
          ],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const loadTimeMs = Date.now() - startTime;

    // 1. Response Time Scoring
    if (loadTimeMs < 600) {
      score += 20;
    } else if (loadTimeMs < 1500) {
      score += 15;
    } else if (loadTimeMs < 3000) {
      score += 10;
      issues.push(`Slow initial response time (${loadTimeMs}ms). Needs speed optimization.`);
    } else {
      score += 5;
      issues.push(`Critical load delay (${loadTimeMs}ms). Severe performance bottleneck.`);
    }

    // 2. HTTPS Security
    if (isHttps) {
      score += 15;
    } else {
      issues.push("Insecure HTTP protocol — lacks SSL certificate (shows 'Not Secure' warning in browsers).");
    }

    // 3. Mobile Viewport Meta Tag
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(htmlText);
    if (hasViewport) {
      score += 20;
    } else {
      issues.push("Missing responsive mobile viewport meta tag — broken layout on smartphones.");
    }

    // 4. CMS & Platform Detection
    let platform = "custom";
    if (/wp-content|wp-includes/i.test(htmlText)) {
      platform = "WordPress";
      score += 10;
      issues.push("Built on heavy WordPress installation — potential security & maintenance overhead.");
    } else if (/wixstatic\.com|wix-code/i.test(htmlText)) {
      platform = "Wix";
      score += 10;
      issues.push("Template-based Wix site with restricted custom web features.");
    } else if (/squarespace\.com/i.test(htmlText)) {
      platform = "Squarespace";
      score += 12;
    } else if (/_next\/static|react|vue|svelte/i.test(htmlText)) {
      platform = "Modern Framework (Next/React/Vue)";
      score += 15;
    } else {
      platform = "Static HTML / Legacy";
      score += 5;
      issues.push("Outdated static architecture — lacks modern client engagement tools.");
    }

    // 5. Era Heuristic (Legacy jQuery 1.x / 2.x)
    const usesLegacyJQuery = /jquery[.-](1\.|2\.)/i.test(htmlText);
    if (usesLegacyJQuery) {
      score = Math.max(0, score - 15);
      issues.push("Uses obsolete jQuery (v1.x/2.x) library from over a decade ago.");
    }

    // 6. Meta Description
    const hasMetaDesc = /<meta[^>]+name=["']description["']/i.test(htmlText);
    if (hasMetaDesc) {
      score += 10;
    } else {
      issues.push("Missing SEO meta description — search engines show random text snippets.");
    }

    // 7. Favicon
    const hasFavicon = /<link[^>]+rel=["'](?:shortcut )?icon["']/i.test(htmlText);
    if (hasFavicon) {
      score += 10;
    } else {
      issues.push("Missing browser favicon — unbranded tab appearance.");
    }

    // Cap score 0-100
    score = Math.min(100, Math.max(0, score));

    return new Response(
      JSON.stringify({
        score,
        details: {
          load_time_ms: loadTimeMs,
          is_https: isHttps,
          has_mobile_viewport: hasViewport,
          platform,
          has_meta_description: hasMetaDesc,
          has_favicon: hasFavicon,
          uses_legacy_jquery: usesLegacyJQuery,
        },
        issues: issues.length > 0 ? issues : ["No major structural flaws detected."],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Website audit failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
