import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClockCounterClockwise } from '@phosphor-icons/react';

interface ActivityItem {
  id: string;
  type: 'note' | 'email_sent' | 'call' | 'follow_up' | 'meeting' | 'stage_change';
  title: string;
  content: string;
  timestamp: string;
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act_1',
      type: 'email_sent',
      title: 'INITIAL OUTREACH EMAIL SENT',
      content: 'Sent personalized website audit proposal detailing mobile layout and conversion fixes.',
      timestamp: '2 HOURS AGO'
    },
    {
      id: 'act_2',
      type: 'follow_up',
      title: 'FOLLOW-UP SCHEDULED',
      content: 'Automated follow-up set for 3 business days if no reply received.',
      timestamp: 'YESTERDAY'
    },
    {
      id: 'act_3',
      type: 'stage_change',
      title: 'STAGE MOVED TO CONTACTED',
      content: 'Prospect added to active outreach sequence.',
      timestamp: '2 DAYS AGO'
    }
  ]);

  const [newNote, setNewNote] = useState('');

  function handleAddNote() {
    if (!newNote.trim()) return;
    const item: ActivityItem = {
      id: `act_${Date.now()}`,
      type: 'note',
      title: 'INTERNAL ANALYST NOTE',
      content: newNote.trim(),
      timestamp: 'JUST NOW'
    };
    setActivities([item, ...activities]);
    setNewNote('');
  }

  return (
    <div className="inspected-panel bg-[#101010] border border-[#222222] p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[#222222] pb-3">
        <div className="flex items-center gap-2 font-display text-xs uppercase tracking-widest text-[#FF4A00] font-bold">
          <ClockCounterClockwise size={18} />
          PROSPECT ACTIVITY TIMELINE
        </div>
        <span className="font-mono text-[10px] text-[#8E8982]">CHRONOLOGICAL EVENT AUDIT</span>
      </div>

      {/* Add Quick Activity Note */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Record outreach note or call summary…"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          className="bg-[#080808] border border-[#222222] text-xs font-mono text-[#F4F0E8] px-3 py-2 flex-1 focus:border-[#FF4A00] outline-none"
        />
        <button
          onClick={handleAddNote}
          className="btn-editorial text-xs font-mono font-bold uppercase tracking-wider px-4 py-2"
        >
          POST NOTE →
        </button>
      </div>

      {/* Vertical Timeline Line */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#222222]">
        {activities.map((act, index) => {
          const isImportant = act.type === 'email_sent' || act.type === 'meeting' || act.type === 'follow_up';

          return (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="relative"
            >
              {/* Timeline Dot Node */}
              <div 
                className={`absolute -left-[23px] top-0.5 w-3 h-3 rounded-full border-2 ${
                  isImportant
                    ? 'bg-[#FF4A00] border-[#FF4A00] shadow-[0_0_8px_#FF4A00]'
                    : 'bg-[#101010] border-[#8E8982]'
                }`}
              />

              <div className="bg-[#151515] border border-[#222222] p-3.5 space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className={`font-bold tracking-wider ${isImportant ? 'text-[#FF4A00]' : 'text-[#F4F0E8]'}`}>
                    ● {act.title}
                  </span>
                  <span className="text-[#8E8982]">{act.timestamp}</span>
                </div>
                <p className="font-mono text-xs text-[#CFC8BE]">{act.content}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
