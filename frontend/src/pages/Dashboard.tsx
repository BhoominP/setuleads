import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Header, type NavTab } from '@/components/layout/Header';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { HeroIntroAnimation } from '@/components/ui/HeroIntroAnimation';
import { motion, AnimatePresence } from 'framer-motion';

// Leads CRM Components
import { LeadSourceSearch } from '@/components/leads/LeadSourceSearch';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { KanbanBoard } from '@/components/leads/KanbanBoard';
import { ActivityTimeline } from '@/components/leads/ActivityTimeline';
import { AddLeadDialog } from '@/components/leads/AddLeadDialog';
import { ExportModal } from '@/components/leads/ExportModal';
import { AutomatedHarvesterModal } from '@/components/leads/AutomatedHarvesterModal';
import { LeadDetailsDrawer } from '@/components/leads/LeadDetailsDrawer';

import { CaseStudy } from '@/pages/CaseStudy';

export function Dashboard() {
  const { data: leads = [] } = useLeads();

  const [activeNav, setActiveNav] = useState<NavTab>('discover');

  // Leads State
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isExportLeadsOpen, setIsExportLeadsOpen] = useState(false);
  const [isHarvestOpen, setIsHarvestOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F4F0E8] pb-16 relative">
      {/* Hero Load Sequence & Ambient Background */}
      <HeroIntroAnimation />
      <AmbientBackground />

      {/* Editorial Navigation Rail Header */}
      <Header
        activeNav={activeNav}
        setActiveNav={(nav) => {
          if (nav === 'exports') {
            setIsExportLeadsOpen(true);
          } else {
            setActiveNav(nav);
          }
        }}
        onOpenAddModal={() => setIsAddLeadOpen(true)}
        onOpenExportModal={() => setIsExportLeadsOpen(true)}
        itemCount={leads.length}
      />

      {/* Main Inspection Workstation Container */}
      <main className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          {activeNav === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <LeadSourceSearch />
            </motion.div>
          )}

          {activeNav === 'leads' && (
            <motion.div
              key="leads"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <LeadsTable onSelectLead={(lead) => setSelectedLeadId(lead.id)} />
            </motion.div>
          )}

          {activeNav === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <KanbanBoard leads={leads} onSelectLead={(lead) => setSelectedLeadId(lead.id)} />
            </motion.div>
          )}

          {activeNav === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ActivityTimeline />
            </motion.div>
          )}

          {activeNav === 'case-study' && (
            <motion.div
              key="case-study"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <CaseStudy onBackToDashboard={() => setActiveNav('discover')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Leads Modals & Drawers */}
      <AddLeadDialog isOpen={isAddLeadOpen} onClose={() => setIsAddLeadOpen(false)} />
      <ExportModal isOpen={isExportLeadsOpen} onClose={() => setIsExportLeadsOpen(false)} leads={leads} />
      <AutomatedHarvesterModal isOpen={isHarvestOpen} onClose={() => setIsHarvestOpen(false)} />
      <LeadDetailsDrawer lead={selectedLead} onClose={() => setSelectedLeadId(null)} />
    </div>
  );
}


