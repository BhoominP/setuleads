import { useEffect, useRef } from 'react';
import { PipelineBeamVisual } from '@/components/visuals/PipelineBeamVisual';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Code,
  Database,
  ArrowLeft,
  CheckCircle,
  Sparkle,
  Globe,
} from '@phosphor-icons/react';

import logoMonochrome from '@/assets/SetuLeads_Monochrome.svg';

interface CaseStudyProps {
  onBackToDashboard: () => void;
}

export function CaseStudy({ onBackToDashboard }: CaseStudyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 360;
    };
    window.addEventListener('resize', handleResize);

    // Particle system configuration for dark editorial hero
    const particleCount = 65;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.4 ? '#FF4A00' : Math.random() > 0.5 ? '#E5E0D8' : '#737373',
      alpha: Math.random() * 0.7 + 0.2,
    }));

    const render = () => {
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, width, height);

      // Additive blending for rich particle glow
      ctx.globalCompositeOperation = 'lighter';

      // Connect nearby particles with subtle blueprint lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 74, 0, ${0.25 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F4F0E8] p-4 sm:p-6 max-w-6xl mx-auto space-y-6 sm:space-y-8 font-sans overflow-x-hidden">
      {/* Top Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onBackToDashboard}
          className="font-mono text-xs border-[#262626] text-[#E5E0D8] bg-[#101010] hover:bg-[#FF4A00] hover:text-[#080808] hover:border-[#FF4A00] transition-colors flex items-center gap-2 rounded-none px-4 py-2 w-fit"
        >
          <ArrowLeft size={16} /> Return to Workstation
        </Button>

        <Badge className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider bg-[#FF4A00]/10 text-[#FF4A00] border border-[#FF4A00]/30 rounded-none px-3 py-1 h-auto leading-snug w-fit max-w-full">
          <span>ARCHITECTURE CASE STUDY</span>
          <span className="hidden sm:inline"> • FULL-STACK & GEMINI AI</span>
        </Badge>
      </div>

      {/* Hero Section with Additive Particle Canvas */}
      <div className="relative inspected-panel bg-[#101010] border border-[#262626] overflow-hidden rounded-none p-6 sm:p-8 min-h-[260px] flex flex-col justify-end">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60 block" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-[#080808]/40 pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <img src={logoMonochrome} alt="SetuLeads" className="h-6 sm:h-8 w-auto object-contain brightness-125" />
            <span className="font-mono text-[10px] sm:text-xs uppercase text-[#FF4A00] tracking-widest bg-[#FF4A00]/20 border border-[#FF4A00]/50 px-2 py-0.5 font-bold shadow-[0_0_8px_rgba(255,74,0,0.2)]">
              SETULEADS REASONING ENGINE
            </span>
            <span className="font-mono text-[10px] sm:text-xs text-[#E5E0D8] font-bold">React 19 + Spring Boot + Google Gemini 1.5 Pro</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl text-[#F4F0E8] font-normal tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" style={{ color: '#F4F0E8' }}>
            SetuLeads: Building the Semantic Client Bridge
          </h1>
          <p className="font-sans text-xs sm:text-sm md:text-base text-[#F4F0E8] max-w-3xl leading-relaxed font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" style={{ color: '#F4F0E8' }}>
            An enterprise-grade lead-generation CRM and website quality audit platform engineered for modern web agencies and solo developers to discover, qualify, and convert SMB web upgrade opportunities.
          </p>
        </div>
      </div>

      {/* Metaphor Narrative Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 space-y-4 rounded-none">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase text-[#FF4A00] tracking-widest font-semibold">
              01. CONCEPT & BRANDING
            </span>
          </div>
          <h2 className="font-serif text-2xl text-[#F4F0E8] font-normal" style={{ color: '#F4F0E8' }}>The "Setu" (Bridge) Architectural Metaphor</h2>
          <p className="font-sans text-xs text-[#E5E0D8] leading-relaxed" style={{ color: '#E5E0D8' }}>
            In Sanskrit, <strong className="text-[#F4F0E8]" style={{ color: '#F4F0E8' }}>Setu (सेतु)</strong> translates to <em>bridge</em> or <em>structural causeway</em>. Millions of high-revenue local businesses operate with either obsolete web infrastructure or zero online presence. SetuLeads serves as the deterministic and semantic bridge connecting these businesses to agency developers.
          </p>
          <p className="font-sans text-xs text-[#E5E0D8] leading-relaxed" style={{ color: '#E5E0D8' }}>
            Rejecting generic consumer SaaS aesthetics, SetuLeads embraces a high-density, brutalist <strong style={{ color: '#F4F0E8' }}>editorial inspection workstation interface</strong> with technical typography, custom film grain, high-contrast monochrome paneling, and crisp burnt orange (`#FF4A00`) telemetry accents.
          </p>
        </div>

        <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 space-y-4 rounded-none">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase text-[#00E599] tracking-widest font-semibold">
              02. ENGINEERING HIGHLIGHTS
            </span>
          </div>
          <h2 className="font-serif text-2xl text-[#F4F0E8] font-normal" style={{ color: '#F4F0E8' }}>Production Full-Stack Ownership</h2>
          <p className="font-sans text-xs text-[#E5E0D8] leading-relaxed" style={{ color: '#E5E0D8' }}>
            Architected to demonstrate strict separation of concerns, multi-provider discovery fallback pipelines, and controlled semantic AI qualification:
          </p>
          <ul className="space-y-2 font-sans text-xs text-[#F4F0E8]">
            <li className="flex items-start gap-2.5">
              <CheckCircle size={16} className="text-[#00E599] shrink-0 mt-0.5" />
              <span style={{ color: '#F4F0E8' }}><strong style={{ color: '#F4F0E8' }}>Controlled Semantic AI</strong>: Gemini AI performs search intent, entity classification, and website flaw interpretation without hallucinating facts.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle size={16} className="text-[#00E599] shrink-0 mt-0.5" />
              <span style={{ color: '#F4F0E8' }}><strong style={{ color: '#F4F0E8' }}>Multi-Provider Geo Pipeline</strong>: Seamless fallback across Geoapify, Overpass OSM, and Google Places APIs.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle size={16} className="text-[#00E599] shrink-0 mt-0.5" />
              <span style={{ color: '#F4F0E8' }}><strong style={{ color: '#F4F0E8' }}>Spring Boot REST Architecture</strong>: Java 17 service tier with robust validation, transactional persistence, and automated test suite.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle size={16} className="text-[#00E599] shrink-0 mt-0.5" />
              <span style={{ color: '#F4F0E8' }}><strong style={{ color: '#F4F0E8' }}>Client-Side Binary Export</strong>: High-performance SheetJS (`xlsx`) spreadsheet generation with export activity telemetry log.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Pipeline Visualizer */}
      <PipelineBeamVisual />

      {/* Tech Stack Grid */}
      <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 rounded-none">
        <span className="font-mono text-xs uppercase text-[#A3A3A3] tracking-widest block mb-1">
          03. SYSTEM TECHNOLOGY STACK
        </span>
        <h2 className="font-serif text-2xl text-[#F4F0E8] mb-6" style={{ color: '#F4F0E8' }}>Tiered Architecture Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#080808] border border-[#262626] p-5 space-y-3 rounded-none">
            <div className="w-9 h-9 border border-[#FF4A00] text-[#FF4A00] flex items-center justify-center font-mono bg-[#FF4A00]/10">
              <Code size={20} />
            </div>
            <h3 className="font-mono text-xs font-bold text-[#F4F0E8] uppercase tracking-wider" style={{ color: '#F4F0E8' }}>Frontend Layer</h3>
            <p className="font-sans text-xs text-[#E5E0D8] leading-relaxed" style={{ color: '#E5E0D8' }}>
              React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide & Phosphor Icons.
            </p>
          </div>

          <div className="bg-[#080808] border border-[#262626] p-5 space-y-3 rounded-none">
            <div className="w-9 h-9 border border-[#00E599] text-[#00E599] flex items-center justify-center font-mono bg-[#00E599]/10">
              <Database size={20} />
            </div>
            <h3 className="font-mono text-xs font-bold text-[#F4F0E8] uppercase tracking-wider" style={{ color: '#F4F0E8' }}>Service & Database</h3>
            <p className="font-sans text-xs text-[#E5E0D8] leading-relaxed" style={{ color: '#E5E0D8' }}>
              Spring Boot Java 17 backend, RESTful API endpoints, PostgreSQL database schema with automated JPA migrations.
            </p>
          </div>

          <div className="bg-[#080808] border border-[#262626] p-5 space-y-3 rounded-none">
            <div className="w-9 h-9 border border-[#FFD700] text-[#FFD700] flex items-center justify-center font-mono bg-[#FFD700]/10">
              <Sparkle size={20} />
            </div>
            <h3 className="font-mono text-xs font-bold text-[#F4F0E8] uppercase tracking-wider" style={{ color: '#F4F0E8' }}>Semantic Intelligence</h3>
            <p className="font-sans text-xs text-[#E5E0D8] leading-relaxed" style={{ color: '#E5E0D8' }}>
              Google Gemini 1.5 Pro integration for semantic search intent parsing, entity qualification, and opportunity pitch generation.
            </p>
          </div>

          <div className="bg-[#080808] border border-[#262626] p-5 space-y-3 rounded-none">
            <div className="w-9 h-9 border border-[#38BDF8] text-[#38BDF8] flex items-center justify-center font-mono bg-[#38BDF8]/10">
              <Globe size={20} />
            </div>
            <h3 className="font-mono text-xs font-bold text-[#F4F0E8] uppercase tracking-wider" style={{ color: '#F4F0E8' }}>Discovery & Telemetry</h3>
            <p className="font-sans text-xs text-[#E5E0D8] leading-relaxed" style={{ color: '#E5E0D8' }}>
              Geoapify + Overpass OSM multi-provider fallback engine, SheetJS binary exporter, and audit timeline telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Database Schema Section */}
      <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 rounded-none space-y-4">
        <span className="font-mono text-xs uppercase text-[#A3A3A3] tracking-widest block">
          04. DATA MODEL & PERSISTENCE
        </span>
        <h2 className="font-serif text-2xl text-[#F4F0E8]">Normalized 5-Table PostgreSQL Schema</h2>

        <div className="bg-[#080808] border border-[#262626] p-5 font-mono text-xs text-[#F4F0E8] space-y-3 rounded-none overflow-x-auto">
          <p className="text-[#FF4A00] font-semibold">// Relational Data Model</p>
          <div className="space-y-2">
            <p>• <span className="text-[#00E599] font-bold">leads</span>: id (UUID PK), business_name, contact_name, phone, email, website_url, source, stage, website_score, website_check_details (JSONB), created_at, updated_at</p>
            <p>• <span className="text-[#00E599] font-bold">activities</span>: id (UUID PK), lead_id (FK -&gt; leads.id), type (NOTE|STAGE_CHANGE|EMAIL_SENT|CALL), content, user_name, created_at</p>
            <p>• <span className="text-[#00E599] font-bold">tags</span>: id (UUID PK), name (UNIQUE), color, created_at</p>
            <p>• <span className="text-[#00E599] font-bold">lead_tags</span>: lead_id (FK -&gt; leads.id), tag_id (FK -&gt; tags.id), PRIMARY KEY (lead_id, tag_id)</p>
            <p>• <span className="text-[#00E599] font-bold">export_logs</span>: id (UUID PK), exported_by, filter_criteria (JSONB), record_count, exported_at</p>
          </div>
        </div>
      </div>
    </div>
  );
}

