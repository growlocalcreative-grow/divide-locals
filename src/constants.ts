import { 
  Store, 
  Home, 
  TreePine as Tree, 
  Wrench, 
  Briefcase, 
  ShoppingBasket, 
  Utensils, 
  Heart, 
  Palette, 
  CalendarDays, 
  Users 
} from 'lucide-react';
import React from 'react';

export const ADMIN_EMAIL = 'growlocalcreative@gmail.com';
export const ICON_STROKE = 1.5;

export const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  'All': Store,
  'Home & Property': Home,
  'Land & Forest': Tree,
  'Local Services': Wrench,
  'Professional & Tech': Briefcase,
  'Grocery & Provisions': ShoppingBasket,
  'Dining & Drinks': Utensils,
  'Health & Wellness': Heart,
  'Makers & Artisans': Palette,
  'Events & Gatherings': CalendarDays,
  'Community': Users
};

export const CATEGORY_ICON_NAMES: Record<string, string> = {
  'Home & Property': 'Home',
  'Land & Forest': 'TreePine',
  'Local Services': 'Wrench',
  'Professional & Tech': 'Briefcase',
  'Grocery & Provisions': 'ShoppingBasket',
  'Dining & Drinks': 'Utensils',
  'Health & Wellness': 'Heart',
  'Makers & Artisans': 'Palette',
  'Events & Gatherings': 'CalendarDays',
  'Community': 'Users'
};

export const CATEGORY_HEROES: Record<string, string> = {
  'Home & Property': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
  'Land & Forest': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200',
  'Local Services': 'https://images.unsplash.com/photo-1581578731522-9b7d7e84b76a?auto=format&fit=crop&q=80&w=1200',
  'Professional & Tech': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1200',
  'Grocery & Provisions': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
  'Dining & Drinks': 'https://images.unsplash.com/photo-1550966842-2849a2208f0a?auto=format&fit=crop&q=80&w=1200',
  'Health & Wellness': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
  'Makers & Artisans': 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=1200',
  'Events & Gatherings': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
  'Community': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=1200'
};

export const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
  'Home & Property': ['Construction', 'Plumbing', 'Electrical', 'HVAC', 'Landscaping', 'Roofing', 'Interior Design', 'Cleaning', 'Pest Control'],
  'Land & Forest': ['Tree Removal', 'Fire Mitigation', 'Logging', 'Excavation', 'Septic', 'Water Well', 'Fencing', 'Firewood'],
  'Local Services': ['Auto Repair', 'Pet Grooming', 'Pet/Ranch Sitting', 'Pet Care', 'Alterations', 'Delivery/Ride Services', 'Weed Eating', 'Steel/Metal Work', 'Plumbing', 'Electrical', 'Childcare', 'Handyman', 'Hauling', 'Storage', 'Laundry', 'Locksmith'],
  'Professional & Tech': ['Notary', 'IT Support', 'Accounting', 'Legal', 'Marketing', 'Photography', 'Consulting', 'Real Estate', 'Insurance'],
  'Grocery & Provisions': ['Full-Service Grocery', 'Farm Stands', 'Local Meat/Butcher', 'Specialty Foods', 'Convenience'],
  'Dining & Drinks': ['Restaurant', 'Coffee Shop', 'Bakery', 'Brewery', 'Catering', 'Food Truck', 'Farm Stand'],
  'Health & Wellness': ['Yoga', 'Fitness', 'Dental', 'Therapy', 'Massage', 'Chiropractic', 'Pharmacy', 'Holistic'],
  'Makers & Artisans': ['Pottery', 'Handcrafted Jewelry', 'Woodworking', 'Textiles/Fiber Arts', 'Fine Art', 'Specialty Gifts', 'Custom Signage'],
  'Events & Gatherings': ['Community Events', 'Venues', 'Festivals', 'Workshops', 'Meeting Spaces', 'Pop-up Markets'],
  'Community': ['Non-Profit', 'Education', 'Library', 'Church', 'Volunteer', 'Club', 'Government']
};

export const DIVIDE_COMMUNITIES = ["Cool", "Pilot Hill", "Garden Valley", "Greenwood", "Lotus", "Coloma", "Georgetown", "Volcanoville"];

export const CATEGORIES = [
  'Home & Property', 
  'Land & Forest', 
  'Local Services', 
  'Professional & Tech', 
  'Grocery & Provisions',
  'Dining & Drinks', 
  'Health & Wellness', 
  'Makers & Artisans',
  'Events & Gatherings', 
  'Community'
];
