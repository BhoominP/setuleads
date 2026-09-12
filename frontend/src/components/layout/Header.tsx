import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Table as TableIcon,
  Kanban as KanbanIcon,
  BookBookmark,
  SignOut,
  Plus,
  DownloadSimple,
  MagnifyingGlass,
  ClockCounterClockwise,
} from '@phosphor-icons/react';

import logoHorizontal from '@/assets/Setuleads_horizontal.svg';

export type NavTab = 'discover' | 'leads' | 'pipeline' | 'activity' | 'exports' | 'case-study';

interface HeaderProps {
  activeNav: NavTab;
  setActiveNav: (nav: NavTab) => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  itemCount?: number;
}

export function Header({
  activeNav,
  setActiveNav,
  onOpenAddModal,
  onOpenExportModal,
  itemCount = 0,
}: HeaderProps) {
  return (
    <header className="border-b border-[#222222] bg-[#080808] px-6 py-4 mb-8 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand Identity */}
        <div
          className="flex items-center gap-3.5 cursor-pointer group select-none"
          onClick={() => setActiveNav('discover')}
        >
          <img
            src={logoHorizontal}
            alt="SetuLeads"
            className="h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02] filter drop-shadow-[0_0_10px_rgba(255,74,0,0.2)]"
          />
          <div className="border-l border-[#222222] pl-3 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-[#FF4A00]/40 text-[#FF4A00] bg-[#FF4A00]/10 tracking-wider font-bold">
                v1.1 • INTELLIGENCE ENGINE
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#8E8982] tracking-tight mt-0.5 hidden sm:block">
              Structural Web Inspection & Prospect Discovery Bridge
            </p>
          </div>
        </div>

        {/* Minimal Editorial Navigation Rail */}
        <nav className="flex items-center gap-1 bg-[#101010] border border-[#222222] p-1 overflow-x-auto max-w-full select-none">
          <button
            onClick={() => setActiveNav('discover')}
            className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 transition-all duration-200 uppercase tracking-wider ${
              activeNav === 'discover'
                ? 'bg-[#151515] text-[#F4F0E8] border border-[#FF4A00] font-bold text-[#FF4A00]'
                : 'text-[#8E8982] hover:text-[#F4F0E8] hover:bg-[#151515]/50'
            }`}
          >
            <MagnifyingGlass size={14} className={activeNav === 'discover' ? 'text-[#FF4A00]' : ''} />
            Discover
          </button>

          <button
            onClick={() => setActiveNav('leads')}
            className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 transition-all duration-200 uppercase tracking-wider ${
              activeNav === 'leads'
                ? 'bg-[#151515] text-[#F4F0E8] border border-[#FF4A00] font-bold text-[#FF4A00]'
                : 'text-[#8E8982] hover:text-[#F4F0E8] hover:bg-[#151515]/50'
            }`}
          >
            <TableIcon size={14} className={activeNav === 'leads' ? 'text-[#FF4A00]' : ''} />
            Leads ({itemCount})
          </button>

          <button
            onClick={() => setActiveNav('pipeline')}
            className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 transition-all duration-200 uppercase tracking-wider ${
              activeNav === 'pipeline'
                ? 'bg-[#151515] text-[#F4F0E8] border border-[#FF4A00] font-bold text-[#FF4A00]'
                : 'text-[#8E8982] hover:text-[#F4F0E8] hover:bg-[#151515]/50'
            }`}
          >
            <KanbanIcon size={14} className={activeNav === 'pipeline' ? 'text-[#FF4A00]' : ''} />
            Pipeline
          </button>

          <button
            onClick={() => setActiveNav('activity')}
            className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 transition-all duration-200 uppercase tracking-wider ${
              activeNav === 'activity'
                ? 'bg-[#151515] text-[#F4F0E8] border border-[#FF4A00] font-bold text-[#FF4A00]'
                : 'text-[#8E8982] hover:text-[#F4F0E8] hover:bg-[#151515]/50'
            }`}
          >
            <ClockCounterClockwise size={14} className={activeNav === 'activity' ? 'text-[#FF4A00]' : ''} />
            Activity
          </button>

          <button
            onClick={() => setActiveNav('case-study')}
            className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 transition-all duration-200 uppercase tracking-wider ${
              activeNav === 'case-study'
                ? 'bg-[#FF4A00]/20 text-[#FF4A00] border border-[#FF4A00]/40 font-bold'
                : 'text-[#8E8982] hover:text-[#FF4A00] hover:bg-[#151515]/50'
            }`}
          >
            <BookBookmark size={14} />
            Case Study
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenExportModal}
            className="font-mono text-xs flex items-center gap-1.5 border-[#222222] bg-[#101010] text-[#CFC8BE] hover:text-[#F4F0E8] hover:border-[#333333]"
          >
            <DownloadSimple size={14} />
            Export .XLSX
          </Button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="btn-editorial h-9 px-4 font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none cursor-pointer group"
          >
            <Plus size={14} weight="bold" className="shrink-0" />
            <span>Add Lead</span>
            <span className="shrink-0 text-[11px] group-hover:translate-x-0.5 transition-transform">➔</span>
          </button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => signOut()}
            title="Sign Out"
            className="text-[#8E8982] hover:text-[#FF4A00] hover:bg-transparent px-2"
          >
            <SignOut size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}


