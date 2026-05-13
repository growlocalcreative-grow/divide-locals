import React from 'react';
import { Store, Flame, Droplets, Trees } from 'lucide-react';
import { CATEGORY_ICONS, ICON_STROKE } from '../../constants';

export const CategoryIcon = ({ category, services, size = 18, className = "" }: { category: string, services?: string[], size?: number, className?: string }) => {
  let Icon = CATEGORY_ICONS[category] || Store;
  if (services?.includes('Fire') || services?.includes('Flame')) Icon = Flame;
  if (services?.includes('Water')) Icon = Droplets;
  if (services?.includes('Recreation')) Icon = Trees;
  return <Icon size={size} strokeWidth={ICON_STROKE} className={className || "text-[#B2AC88]"} />;
};
