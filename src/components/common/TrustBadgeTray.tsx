import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trees, Sprout, Leaf, Handshake, Home, Shield } from 'lucide-react';
import { Business } from '../../types';

export const TrustBadgeTray = ({ business }: { business: Business }) => {
  const [showInfo, setShowInfo] = useState(false);

  const badges = [
    {
      id: 'firesafe',
      active: business.isFireSafeCertified,
      icon: Shield,
      color: 'text-[#C9A24A]',
      bgColor: 'bg-[#2F3E5B]',
      label: 'Fire Safe Certified',
      description: 'Verified commitment to defensible space and wildfire preparedness.'
    },
    {
      id: 'grown',
      active: business.isDivideGrown,
      icon: Sprout,
      color: 'text-[#C9A24A]',
      bgColor: 'bg-[#C9A24A]/10',
      label: 'Divide Grown',
      description: 'Grown and nurtured right here in our Sierra Nevada communities.'
    },
    {
      id: 'favorite',
      active: business.isCommunityFavorite,
      icon: Star,
      color: 'text-[#C9A24A]',
      bgColor: 'bg-[#C9A24A]/10',
      label: 'Neighbor Pick',
      description: 'Consistently highly rated and recommended by neighbors.'
    },
    {
      id: 'resident',
      active: business.isResidentOwned,
      icon: Home,
      color: 'text-[#C28A5B]',
      bgColor: 'bg-[#2F3E5B]',
      label: 'Resident Owned',
      description: 'Owned and operated by a full-time resident of the Divide.'
    },
    {
      id: 'eco',
      active: business.isEcoFriendly,
      icon: Leaf,
      color: 'text-[#8A9A5B]',
      bgColor: 'bg-[#8A9A5B]/10',
      label: 'Eco-Friendly',
      description: 'Committed to sustainable and environmentally conscious practices.'
    },
    {
      id: 'partner',
      active: business.isCommunityPartner,
      icon: Handshake,
      color: 'text-[#7A4A2E]',
      bgColor: 'bg-[#7A4A2E]/10',
      label: 'Community Partner',
      description: 'Actively supports local community events and initiatives.'
    },
    {
      id: 'supporter',
      active: business.isSupporter,
      icon: Trees,
      color: 'text-[#C28A5B]',
      bgColor: 'bg-[#C28A5B]/10',
      label: 'Community Supporter',
      description: 'Goes above and beyond to support local community initiatives.'
    }
  ].filter(b => b.active);

  if (badges.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center gap-6 mt-12 pb-12 border-b border-[#2F3E5B]/5">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2F3E5B]/40">Community Verified</h3>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-10">
        {badges.map(badge => {
          const Icon = badge.icon;
          return (
            <div key={badge.id} className={`flex flex-col items-center gap-3 group ${badge.id === 'resident' || badge.id === 'firesafe' ? 'scale-110' : ''}`}>
              <div 
                className={`w-14 h-14 ${badge.bgColor} ${badge.color} ${badge.id === 'resident' || badge.id === 'firesafe' ? 'rounded-full border-4 border-white shadow-xl ring-8 ring-[#2F3E5B]/5' : 'rounded-2xl border-2 border-[#2F3E5B]/10'} flex items-center justify-center transition-all hover:scale-110 relative shadow-md`}
              >
                <Icon size={badge.id === 'resident' || badge.id === 'firesafe' ? 32 : 28} className={badge.id === 'resident' || badge.id === 'firesafe' ? 'fill-current' : (badge.id === 'grown' || badge.id === 'eco' || badge.id === 'partner' || badge.id === 'favorite' ? 'fill-current opacity-20' : '')} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all ${
                badge.id === 'resident' || badge.id === 'firesafe'
                ? 'bg-[#2F3E5B] text-[#E7D6BF] shadow-lg' 
                : 'text-[#2F3E5B] opacity-60'
              }`}>
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
