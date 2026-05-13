import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Droplets, Heart, Zap, ShieldCheck, X, Phone, MapPin } from 'lucide-react';
import { useBusinesses } from '../../lib/hooks';
import { formatPhoneNumber, getRawPhone } from '../../utils';

export const VitalsRow = ({ onSelectCategory }: { onSelectCategory: (cat: string) => void }) => {
  const vitals = [
    { id: 'fire', icon: Flame, label: 'Fire', color: '#B2AC88' },
    { id: 'water', icon: Droplets, label: 'Water', color: '#B2AC88' },
    { id: 'medical', icon: Heart, label: 'Medical', color: '#B2AC88' },
    { id: 'utilities', icon: Zap, label: 'System', color: '#B2AC88' },
    { id: 'safety', icon: ShieldCheck, label: 'Safety', color: '#B2AC88' },
  ];

  return (
    <div className="flex gap-6 overflow-x-auto no-scrollbar py-4 mb-2 -mx-4 px-4 border-b border-navy/5">
      {vitals.map((v) => (
        <motion.button
          key={v.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectCategory(v.label)}
          className="flex flex-col items-center gap-2 shrink-0 group w-12"
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-navy/5 group-hover:border-navy/20 group-hover:shadow-md transition-all">
            <v.icon size={18} strokeWidth={2.5} className="text-red-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-navy/40 group-hover:text-navy transition-colors text-center leading-tight">
            {v.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export const VitalsPopup = ({ category, onClose }: { category: string | null; onClose: () => void }) => {
  const { businesses, loading } = useBusinesses();
  
  const filtered = businesses.filter(b => {
    if (!category) return false;
    const cat = category.toLowerCase();
    
    // Prioritize explicit vitalsCategory mapping
    if (b.vitalsCategory?.toLowerCase() === cat) return true;
    
    const name = b.name.toLowerCase();
    const bCat = b.category.toLowerCase();
    
    // System mapping fix
    const isSystem = cat === 'system' && (b.vitalsCategory === 'System' || name.includes('pud') || name.includes('electric') || name.includes('utility'));
    if (isSystem) return true;

    if (cat === 'fire') return name.includes('fire') || bCat.includes('fire');
    if (cat === 'water') return name.includes('water') || name.includes('pud') || bCat.includes('water');
    if (cat === 'medical') return name.includes('medical') || name.includes('health') || name.includes('hospital') || bCat.includes('health');
    if (cat === 'safety') return b.isVital || name.includes('safety') || name.includes('emergency') || b.vitalsCategory === 'Safety';
    return false;
  }).sort((a, b) => {
    const cat = category?.toLowerCase();
    
    // Custom priority for Medical category
    if (cat === 'medical') {
      const getPriority = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('divide wellness') || lower.includes('cool village pharmacy')) return 1;
        if (lower.includes('reach') || lower.includes('calstar')) return 2;
        if (lower.includes('hospital') || lower.includes('medical center')) return 3;
        return 4;
      };
      return getPriority(a.name) - getPriority(b.name);
    }

    // Default: Prioritize explicit vitalsCategory matches to pin them to top
    const aMatch = a.vitalsCategory?.toLowerCase() === cat;
    const bMatch = b.vitalsCategory?.toLowerCase() === cat;
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  return (
    <AnimatePresence>
      {category && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#FCF9F2] rounded-[40px] shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="flex flex-col h-full">
              {/* High-Contrast Utility Header */}
              <div className="p-8 bg-[#2F3E5B] text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#C9A24A]/20 rounded-2xl flex items-center justify-center text-[#C9A24A] border border-[#C9A24A]/30">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-black italic tracking-tight text-[#E7D6BF]">{category} Resources</h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A24A]">Georgetown Divide Vitals</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 transition-all border border-white/10"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar scroll-smooth">
                {loading ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#C9A24A]/10 border-t-[#C9A24A] rounded-full animate-spin" />
                  </div>
                ) : filtered.length > 0 ? (
                  filtered.map(b => (
                    <div key={b.id} className="p-6 bg-white rounded-[32px] border border-[#2F3E5B]/5 flex items-center justify-between group hover:shadow-xl hover:border-[#C9A24A]/30 transition-all">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[#2F3E5B] text-lg leading-tight">{b.name}</h3>
                          {b.vitalsCategory === 'Medical' && (b.name.toLowerCase().includes('hospital') || b.name.toLowerCase().includes('medical center')) && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-red-100">
                              Emergency Room
                            </span>
                          )}
                        </div>
                        
                        {(b.name.toLowerCase().includes('hospital') || b.name.toLowerCase().includes('medical center')) && (
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#2F3E5B]/40 mb-2">
                            Nearest Emergency Room - Placer/EDC
                          </p>
                        )}
                        
                        {(b.name.toLowerCase().includes('reach') || b.name.toLowerCase().includes('calstar')) && (
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#2F3E5B]/40 mb-2">
                            Critical Care Air Transport - El Dorado County Hub
                          </p>
                        )}

                        <div className="flex flex-col gap-1 mt-2">
                          <p className="text-xs font-black text-[#C9A24A] flex items-center gap-2">
                            <Phone size={10} strokeWidth={3} />
                            {formatPhoneNumber(b.contact?.phone || '')}
                          </p>
                          {b.contact?.businessAddress && (
                            <a 
                              href={`https://maps.apple.com/?q=${encodeURIComponent(b.contact.businessAddress)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-[#2F3E5B]/40 uppercase tracking-wide truncate max-w-[220px] hover:text-[#C9A24A] transition-colors flex items-center gap-1"
                            >
                              <MapPin size={8} />
                              {b.contact.businessAddress}
                            </a>
                          )}
                        </div>
                      </div>
                      <a 
                        href={`tel:${getRawPhone(b.contact?.phone || '')}`}
                        className="w-12 h-12 bg-[#2F3E5B] text-[#C9A24A] rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all border border-[#C9A24A]/20"
                      >
                        <Phone size={20} strokeWidth={2.5} />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="py-12 px-6 border-2 border-dashed border-[#2F3E5B]/10 rounded-[40px] text-center bg-[#2F3E5B]/5">
                    <p className="text-[#2F3E5B]/40 italic text-sm mb-4">No emergency contacts listed for {category} yet.</p>
                    <p className="text-xs text-[#2F3E5B]/30 font-bold uppercase tracking-widest">Master Records are being updated by Admin.</p>
                  </div>
                )}
              </div>

              <div className="p-8 pt-0">
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-[#2F3E5B] text-[#E7D6BF] rounded-[24px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border border-[#C9A24A]/20"
                >
                  Exit Emergency View
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
