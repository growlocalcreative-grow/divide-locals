export interface Business {
  id?: string;
  name: string;
  category: string;
  description: string;
  isVital: boolean;
  contact: {
    website: string;
    email: string;
    phone: string;
    textPhone?: string;
    businessAddress: string;
  };
  isResidentOwned: boolean;
  isSupporter?: boolean;
  isCommunityFavorite?: boolean;
  isVerifiedPro?: boolean;
  favoriteCount?: number;
  privateHomeZip: string;
  serviceAreas: string[];
  ownerId: string;
  ownerName?: string;
  tags?: string[];
  isAiGenerated?: boolean;
  preferredContact?: 'call' | 'text';
  isEmergencySupport?: boolean;
  isDivideGrown?: boolean;
  isEcoFriendly?: boolean;
  isFireSafeCertified?: boolean;
  isCommunityPartner?: boolean;
  vitalsCategory?: 'Fire' | 'Water' | 'Medical' | 'System' | 'Safety';
  createdAt: any;
  status: 'pending' | 'approved' | 'draft' | 'review';
  slug?: string; // Kept for routing if needed
  heroUrl?: string;
  logoUrl?: string;
  logoIconName?: string;
  primaryContactMethod?: 'text' | 'call' | 'email';
  metaKeywords?: string[];
}

export interface NeighborProfile {
  uid: string;
  displayName: string;
  favorites: string[];
  isAdmin: boolean;
  email?: string; // Optional but useful
  photoURL?: string;
  createdAt?: any;
  status?: 'active' | 'flagged' | 'banned';
  notes?: string;
  residentSince?: string; // Format: YYYY-MM
  bio?: string;
}

export interface Review {
  id?: string;
  businessId: string;
  businessName?: string;
  neighborId: string;
  authorId?: string; // Standardizing on authorId for the query in useUserReviews
  rating: number;
  comment: string;
  createdAt: any;
  userName?: string;
  userPhoto?: string;
  status: 'published' | 'hidden' | 'flagged';
}
