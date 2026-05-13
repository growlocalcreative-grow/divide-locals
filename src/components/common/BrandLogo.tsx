import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Business } from '../../types';
import { CATEGORY_ICONS } from '../../constants';

interface BrandLogoProps {
  business: Business;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ business, size = 'md', className = "" }) => {
  const logoUrl = business.logoUrl;
  const iconName = business.logoIconName;
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 20,
    md: 40,
    lg: 64
  };

  if (logoUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 ${className}`}>
        <img src={logoUrl} alt={business.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
      </div>
    );
  }

  // Fallback to Icon
  let IconComponent: any = LucideIcons.Store;
  
  if (iconName && (LucideIcons as any)[iconName]) {
    IconComponent = (LucideIcons as any)[iconName];
  } else {
    // Try category mapping
    IconComponent = CATEGORY_ICONS[business.category] || LucideIcons.Store;
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-[#F5E6D3] flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0 ${className}`}>
      <IconComponent size={iconSizes[size]} className="text-[#2F3E5B]" strokeWidth={1.5} />
    </div>
  );
};
