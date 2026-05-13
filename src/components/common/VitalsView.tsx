import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Droplets, Heart, Zap, ShieldCheck, X, Phone } from 'lucide-react';
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
    const name = b.name.toLowerCase();
    const bCat = b.category.toLowerCase();
    
    if (cat === 'fire') return name.includes('fire') || bCat.includes('fire');
    if (cat === 'water') return name.includes('water') || name.includes('pud') || bCat.includes('water');
    if (cat === 'medical') return name.includes('medical') || name.includes('health') || name.includes('hospital') || bCat.includes('health');
    if (cat === 'system') return name.includes('pud') || name.includes('electric') || name.includes('utility');
    if (cat === 'safety') return b.isVital || name.includes('safety') || name.includes('emergency');
    return false;
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
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy/10 rounded-xl flex items-center justify-center text-navy">
                    <ShieldCheck size={20} />
                  </div>
                  <h2 className="text-2xl font-serif font-black text-navy">{category} Directory</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-earth/5 text-earth/40"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                {loading ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#B2AC88]/10 border-t-[#B2AC88] rounded-full animate-spin" />
                  </div>
                ) : filtered.length > 0 ? (
                  filtered.map(b => (
                    <div key={b.id} className="p-5 bg-white rounded-3xl border border-navy/5 flex items-center justify-between group hover:shadow-md transition-all">
                      <div>
                        <h3 className="font-bold text-navy text-base">{b.name}</h3>
                        <p className="text-xs text-navy/40 font-bold uppercase tracking-widest mt-1">{formatPhoneNumber(b.contact?.phone || '')}</p>
                      </div>
                      <a 
                        href={`tel:${getRawPhone(b.contact?.phone || '')}`}
                        className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 active:scale-90 transition-all"
                      >
                        <Phone size={18} strokeWidth={2.5} />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="py-12 px-6 border-2 border-dashed border-earth/10 rounded-[32px] text-center">
                    <p className="text-navy/40 italic text-sm mb-4">No emergency contacts listed for {category} yet.</p>
                    <p className="text-xs text-navy/30">Please contact the Admin Team to add your district or service.</p>
                  </div>
                )}
              </div>

              <button 
                onClick={onClose}
                className="w-full mt-8 py-4 bg-navy text-cream rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-navy/20 hover:bg-navy/90 active:scale-[0.98] transition-all"
              >
                Close View
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
