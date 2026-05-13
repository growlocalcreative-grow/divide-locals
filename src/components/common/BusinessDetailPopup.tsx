import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trees, MapPin, Phone, Globe, Award, Sprout, Home, Heart, Share2 } from 'lucide-react';
import { Business } from '../../types';
import { getRawPhone, formatPhoneNumber } from '../../utils';
import { ReviewSection } from './ReviewSection';
import { TrustBadgeTray } from './TrustBadgeTray';
import { useAuth, useNeighborProfile, toggleFavorite } from '../../lib/hooks';
import { ShareModal } from './ShareModal';
import { BrandLogo } from './BrandLogo';

export const BusinessDetailPopup = ({ business, onClose }: { business: Business | null, onClose: () => void }) => {
  const { user } = useAuth();
  const { profile } = useNeighborProfile(user?.uid);
  const isFavoritedFromProfile = profile?.favorites?.includes(business?.id || '') || false;
  const [isOptimisticFavorited, setIsOptimisticFavorited] = useState<boolean | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showGuestMessage, setShowGuestMessage] = useState(false);

  const isFavorited = isOptimisticFavorited !== null ? isOptimisticFavorited : isFavoritedFromProfile;

  if (!business) return null;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setShowGuestMessage(true);
      setTimeout(() => setShowGuestMessage(false), 3000);
      return;
    }
    if (business.id) {
      const newState = !isFavorited;
      setIsOptimisticFavorited(newState);
      try {
        await toggleFavorite(business.id, user.uid, !isFavorited, business);
      } catch (err) {
        setIsOptimisticFavorited(isFavoritedFromProfile);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy/40 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#FCF9F2] rounded-[48px] shadow-3xl overflow-hidden border-2 border-sage/20 max-h-[90vh] overflow-y-auto admin-scroll"
        >
          <div className="p-8 md:p-12">
            <div className="absolute top-8 right-8 flex items-center gap-2">
              <div className="relative">
                <AnimatePresence>
                  {showGuestMessage && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="absolute right-full mr-4 whitespace-nowrap bg-[#7A4A2E] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl z-20 top-1/2 -translate-y-1/2"
                    >
                      Sign in to save!
                    </motion.div>
                  )}
                </AnimatePresence>
                <button 
                  onClick={handleToggleFavorite}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm border ${
                    isFavorited ? 'bg-[#2F3E5B] text-[#C9A24A] border-transparent' : 'bg-earth/5 text-earth/40 hover:bg-earth/10 border-transparent'
                  }`}
                  title="Save to Favorites"
                >
                  <Heart size={22} strokeWidth={2.5} className={isFavorited ? 'fill-[#C9A24A]' : ''} />
                </button>
              </div>

              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="w-12 h-12 rounded-full bg-earth/5 flex items-center justify-center text-earth/40 hover:bg-earth/10 hover:text-earth transition-all shadow-sm"
                title="Share Listing"
              >
                <Share2 size={22} strokeWidth={2.5} />
              </button>

              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-earth/5 flex items-center justify-center text-earth/40 hover:bg-earth/10 hover:text-earth transition-all shadow-sm"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-12 gap-12 mt-12 md:mt-0">
              <div className="md:col-span-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-48 h-48 rounded-[32px] overflow-hidden bg-earth/5 shadow-xl shrink-0">
                    {business.logoUrl ? (
                      <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                    ) : (
                      <BrandLogo business={business} size="lg" className="w-full h-full rounded-none shadow-none border-none" />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                       <span className="px-4 py-1.5 bg-[#B2AC88]/10 text-[#B2AC88] text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-[#B2AC88]/20">
                        {business.category}
                      </span>
                      {business.isVerifiedPro && (
                        <div className="flex items-center gap-1.5 text-[#2D5A5E] bg-[#2D5A5E]/10 px-3 py-1.5 rounded-full border border-[#2D5A5E]/20 text-[10px] font-black uppercase tracking-widest">
                          <Trees size={12} className="fill-[#2D5A5E]" strokeWidth={2.5} />
                          Verified
                        </div>
                      )}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-serif font-black text-earth italic leading-none">{business.name}</h2>
                    <p className="text-lg text-navy/60 leading-relaxed font-serif italic max-w-2xl">
                      "{business.description}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-12">
                {business.tags && business.tags.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Neighborhood Offerings</h3>
                    <div className="flex flex-wrap gap-2">
                      {business.tags.map(tag => (
                        <span key={tag} className="px-4 py-2 bg-white rounded-xl border border-earth/10 text-[10px] font-black uppercase tracking-widest text-earth shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="p-8 bg-earth text-cream rounded-[32px] space-y-4">
                    <div className="flex items-center gap-2 opacity-60 text-[10px] font-black uppercase tracking-widest">
                      <MapPin size={14} />
                      Location
                    </div>
                    <p className="text-lg font-bold">{business.contact?.businessAddress || 'The Divide'}</p>
                  </div>
                  <div className="p-8 bg-[#2D5A5E] text-cream rounded-[32px] space-y-4">
                    <div className="flex items-center gap-2 opacity-60 text-[10px] font-black uppercase tracking-widest">
                      <Phone size={14} />
                      Connection
                    </div>
                    <p className="text-lg font-bold">{formatPhoneNumber(business.contact?.phone || '')}</p>
                  </div>
                </div>
                
                <ReviewSection businessId={business.id!} businessName={business.name} />
              </div>

              <div className="md:col-span-4 space-y-8">
                <div className="p-8 bg-white rounded-[40px] border border-earth/10 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#B2AC88]">Quick Connect</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {business.contact?.phone && (
                      <a href={`tel:${getRawPhone(business.contact.phone)}`} className="flex flex-col items-center gap-2 group">
                        <div className="w-16 h-16 bg-earth text-cream rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                          <Phone size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Call</span>
                      </a>
                    )}
                    {business.contact?.website && (
                      <a href={business.contact.website} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                        <div className="w-16 h-16 bg-earth text-cream rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                          <Globe size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Web</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-8 bg-sage/5 rounded-[40px] border border-sage/20 space-y-6">
                   <h3 className="text-xs font-black uppercase tracking-widest text-sage">Trust Badges</h3>
                   <div className="space-y-4">
                    {business.isResidentOwned && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2F3E5B] flex items-center justify-center text-[#C28A5B]">
                          <Home size={16} strokeWidth={2.5} className="fill-current" />
                        </div>
                        <span className="text-xs font-bold text-earth">Resident Owned</span>
                      </div>
                    )}
                    {business.isDivideGrown && (
                      <div className="flex items-center gap-3">
                        <Sprout size={20} className="text-sage fill-sage" />
                        <span className="text-xs font-bold text-earth">Divide Grown</span>
                      </div>
                    )}
                   </div>
                </div>
                
                <TrustBadgeTray business={business} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        businessName={business.name} 
        shareUrl={`${window.location.origin}/business/${business.slug}`} 
      />
    </AnimatePresence>
  );
};
