import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Share2, Sprout, Home, Leaf, Handshake, Star, Trees, Shield } from 'lucide-react';
import { Business } from '../../types';
import { useAuth, useNeighborProfile, toggleFavorite } from '../../lib/hooks';
import { CATEGORY_ICON_NAMES } from '../../constants';
import { signInWithGoogle } from '../../lib/firebase';
import { ShareModal } from './ShareModal';
import { BrandLogo } from './BrandLogo';

import { CategoryIcon } from './CategoryIcon';

export const BusinessCard: React.FC<{ business: Business }> = ({ business }) => {
  const { user } = useAuth();
  const { profile } = useNeighborProfile(user?.uid);
  const isFavoritedFromProfile = profile?.favorites?.includes(business.id || '') || false;
  const [isOptimisticFavorited, setIsOptimisticFavorited] = useState<boolean | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showGuestMessage, setShowGuestMessage] = useState(false);

  const isFavorited = isOptimisticFavorited !== null ? isOptimisticFavorited : isFavoritedFromProfile;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  const CATEGORY_COLORS: Record<string, string> = {
    'Professional & Tech': '#2F3E5B',
    'Local Services': '#2F3E5B',
    'Land & Forest': '#7A4A2E',
    'Home & Property': '#7A4A2E',
    'Dining & Drinks': '#C28A5B',
    'Community': '#C28A5B',
    'Events & Gatherings': '#C28A5B',
    'Grocery & Provisions': '#C28A5B',
    'Makers & Artisans': '#C9A24A',
    'Health & Wellness': '#C9A24A',
    'Arts & Culture': '#C9A24A',
    'Retail & Shopping': '#C9A24A',
  };

  const getHeroBackground = (category: string) => {
    return CATEGORY_COLORS[category] || '#2F3E5B';
  };
  
  return (
    <motion.div 
      layout
      whileHover={{ y: -8 }}
      className="bg-[#E7D6BF] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative border border-[#2F3E5B]/5"
    >
      <Link to={`/business/${business.slug}`} className="flex flex-col flex-1">
        {/* Hero Image */}
        <div 
          className="relative min-h-[200px] aspect-video w-full overflow-hidden flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] border-b border-[#2F3E5B]/5 bg-center bg-cover"
          style={business.heroUrl ? { backgroundImage: `url(${business.heroUrl})` } : { backgroundColor: getHeroBackground(business.category) }}
        >
          {/* Noise/Gradient Overlay for placeholders */}
          {!business.heroUrl && (
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
          )}
          {!business.heroUrl && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#2F3E5B]/20 to-transparent" />
          
          {!business.heroUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-[#E7D6BF]">
              <CategoryIcon category={business.category} size={64} />
            </div>
          )}
        </div>

        {/* Profile Circle Overlay */}
        <div className="relative px-6">
          <div className="absolute -top-10 left-6">
            <BrandLogo business={business} size="md" />
          </div>
        </div>

        {/* Content Body */}
        <div className="pt-12 px-6 pb-6 flex-1 flex flex-col gap-4 text-center">
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-black text-[#2F3E5B] italic leading-tight group-hover:text-[#C9A24A] transition-colors">
              {business.name}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">
              {business.serviceAreas?.[0] || 'The Divide'} • {business.category}
            </p>
          </div>

          <p className="text-sm text-[#7A4A2E]/80 leading-relaxed font-serif italic line-clamp-3">
            "{business.description || 'A trusted neighbor serving the Divide.'}"
          </p>

          {/* Community Badges Row - Centered */}
          <div className="mt-auto flex flex-wrap gap-2 pt-2 justify-center">
            {business.isFireSafeCertified && (
              <div className="w-8 h-8 rounded-full bg-[#2F3E5B] flex items-center justify-center text-[#C9A24A]" title="Fire Safe Certified">
                <Shield size={16} strokeWidth={2.5} className="fill-current" />
              </div>
            )}
            {business.isDivideGrown && (
              <div className="w-8 h-8 rounded-full bg-[#C9A24A]/10 flex items-center justify-center text-[#C9A24A]" title="Divide Grown">
                <Sprout size={16} strokeWidth={2.5} />
              </div>
            )}
            {business.isCommunityFavorite && (
              <div className="w-8 h-8 rounded-full bg-[#C9A24A]/10 flex items-center justify-center text-[#C9A24A]" title="Neighbor Pick">
                <Star size={16} strokeWidth={2.5} />
              </div>
            )}
            {business.isResidentOwned && (
              <div className="w-10 h-10 rounded-full bg-[#2F3E5B] flex items-center justify-center text-[#C28A5B] shadow-lg border-2 border-white ring-4 ring-[#2F3E5B]/10" title="Resident Owned">
                <Home size={20} strokeWidth={2.5} className="fill-current" />
              </div>
            )}
            {business.isEcoFriendly && (
              <div className="w-8 h-8 rounded-full bg-[#8A9A5B]/10 flex items-center justify-center text-[#8A9A5B]" title="Eco-Friendly">
                <Leaf size={16} strokeWidth={2.5} />
              </div>
            )}
            {business.isCommunityPartner && (
              <div className="w-8 h-8 rounded-full bg-[#7A4A2E]/10 flex items-center justify-center text-[#7A4A2E]" title="Community Partner">
                <Handshake size={16} strokeWidth={2.5} />
              </div>
            )}
            {business.isSupporter && (
              <div className="w-8 h-8 rounded-full bg-[#C28A5B]/10 flex items-center justify-center text-[#C28A5B]" title="Community Supporter">
                <Trees size={16} strokeWidth={2.5} />
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Action Bar Footer - Outside Link for better hit detection */}
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-[#2F3E5B] relative z-10">
        <AnimatePresence>
          {showGuestMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-x-0 -top-12 mx-4 bg-[#7A4A2E] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl text-center shadow-xl z-20"
            >
              Sign in to save your favorite local businesses!
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={handleToggleFavorite}
          className={`w-11 h-11 flex items-center justify-center rounded-full transition-all active:scale-90 ${
            isFavorited ? 'bg-[#2F3E5B] text-[#C9A24A] shadow-[0_0_15px_rgba(201,162,74,0.1)]' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-[#C9A24A]'
          }`}
          title="Save to Favorites"
        >
          <Heart size={20} strokeWidth={2.5} className={isFavorited ? 'fill-[#C9A24A]' : ''} />
        </button>

        <button 
          onClick={handleShare}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-90"
          title="Share"
        >
          <Share2 size={20} strokeWidth={2.5} />
        </button>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        businessName={business.name} 
        shareUrl={`${window.location.origin}/business/${business.slug || business.id}`} 
      />
    </motion.div>
  );
};

