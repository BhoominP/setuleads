import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequestBody {
  query?: string;
  source?: string; // 'all' | 'arbeitnow' | 'remoteok' | 'jobicy' | 'himalayas'
}

interface RawJobResult {
  external_id: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  url: string;
  salary_text: string | null;
  tags: string[];
  posted_at: string | null;
  source: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query = "developer", source = "all" } = (await req.json()) as SearchRequestBody;
    const allResults: RawJobResult[] = [];
    const queryLower = query.toLowerCase();

    // 1. Fetch Arbeitnow API
    if (source === "all" || source === "arbeitnow") {
      try {
        const res = await fetch("https://www.arbeitnow.com/api/v1/jobs");
        if (res.ok) {
          const data = await res.json();
          const jobs = data.data || [];
          jobs.slice(0, 15).forEach((j: any) => {
            if (!query || j.title.toLowerCase().includes(queryLower) || j.tags?.some((t: string) => t.toLowerCase().includes(queryLower))) {
              allResults.push({
                external_id: `an_${j.slug}`,
                title: j.title,
                company: j.company_name,
                location: j.location || "Remote",
                remote: Boolean(j.remote),
                url: j.url,
                salary_text: null,
                tags: j.tags || [],
                posted_at: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
                source: "arbeitnow",
              });
            }
          });
        }
      } catch (err) {
        console.warn("Arbeitnow API fetch failed", err);
      }
    }

    // 2. Fetch RemoteOK API
    if (source === "all" || source === "remoteok") {
      try {
        const res = await fetch("https://remoteok.com/api", {
          headers: { "User-Agent": "JobRadar-Tracker/1.0" },
        });
        if (res.ok) {
          const jobs = await res.json();
          // First item in RemoteOK is legal notice object
          const validJobs = Array.isArray(jobs) ? jobs.filter((j: any) => j.id && j.position) : [];
          validJobs.slice(0, 15).forEach((j: any) => {
            if (!query || j.position.toLowerCase().includes(queryLower) || j.tags?.some((t: string) => t.toLowerCase().includes(queryLower))) {
              allResults.push({
                external_id: `rok_${j.id}`,
                title: j.position,
                company: j.company || "Remote Company",
                location: j.location || "Worldwide Remote",
                remote: true,
                url: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
                salary_text: j.salary_min ? `$${j.salary_min} - $${j.salary_max || j.salary_min}/yr` : null,
                tags: j.tags || [],
                posted_at: j.epoch ? new Date(j.epoch * 1000).toISOString() : null,
                source: "remoteok",
              });
            }
          });
        }
      } catch (err) {
        console.warn("RemoteOK API fetch failed", err);
      }
    }

    // 3. Fetch Jobicy API
    if (source === "all" || source === "jobicy") {
      try {
        const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=20");
        if (res.ok) {
          const data = await res.json();
          const jobs = data.jobs || [];
          jobs.forEach((j: any) => {
            if (!query || j.jobTitle.toLowerCase().includes(queryLower)) {
              allResults.push({
                external_id: `jby_${j.id}`,
                title: j.jobTitle,
                company: j.companyName || "Tech Studio",
                location: j.jobGeo || "Remote",
                remote: true,
                url: j.url,
                salary_text: j.annualSalaryMin ? `$${j.annualSalaryMin} - $${j.annualSalaryMax}/yr` : null,
                tags: j.jobCategory ? [j.jobCategory] : ["remote"],
                posted_at: j.pubDate || null,
                source: "jobicy",
              });
            }
          });
        }
      } catch (err) {
        console.warn("Jobicy API fetch failed", err);
      }
    }

    // If API results were returned
    if (allResults.length > 0) {
      return new Response(
        JSON.stringify({ results: allResults.slice(0, 30), source, is_mock: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Fallback simulation mode if public APIs are blocked or network restricted
    const mockJobs: RawJobResult[] = [
      {
        external_id: `mock_job_1_${Date.now()}`,
        title: `Full-Stack Developer (React / Supabase)`,
        company: "Veloce Systems",
        location: "Remote (India)",
        remote: true,
        url: "https://example.com/careers/fullstack-dev",
        salary_text: "₹6,00,000 - ₹10,00,000 / yr",
        tags: ["React", "TypeScript", "Node.js", "Fresher Friendly"],
        posted_at: new Date().toISOString(),
        source: "arbeitnow",
      },
      {
        external_id: `mock_job_2_${Date.now()}`,
        title: `Junior Frontend Engineer (TypeScript)`,
        company: "Apex Digital Labs",
        location: "Bengaluru / Remote",
        remote: true,
        url: "https://example.com/jobs/junior-frontend",
        salary_text: "₹5,00,000 - ₹8,00,000 / yr",
        tags: ["React", "TailwindCSS", "JavaScript"],
        posted_at: new Date().toISOString(),
        source: "remoteok",
      },
      {
        external_id: `mock_job_3_${Date.now()}`,
        title: `Freelance Web Development Project`,
        company: "Sanskrit Media Enterprise",
        location: "Vadodara, Gujarat",
        remote: true,
        url: "https://example.com/gigs/web-revamp",
        salary_text: "₹35,000 - ₹50,000 fixed contract",
        tags: ["Freelance", "Web Audit", "UI Revamp"],
        posted_at: new Date().toISOString(),
        source: "jobicy",
      },
    ];

    return new Response(
      JSON.stringify({ results: mockJobs, source, is_mock: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to search job listings" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
