import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download,
  Upload,
  FileSpreadsheet,
  Users, 
  Store, 
  Trash2, 
  XCircle,
  Clock,
  Settings,
  Mail,
  Zap,
  Sprout,
  Search,
  Sparkles,
  Home,
  Leaf,
  Star,
  Handshake,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  FileText,
  LayoutDashboard,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { useAuth, useNeighborProfile, useBusinesses, updateBusiness, deleteBusiness, useProfiles, addBusiness, useAllReviews, deleteReview, updateReview } from '../lib/hooks';
import { ADMIN_EMAIL, ICON_STROKE, CATEGORIES } from '../constants';
import { Business } from '../types';
import { generateBusinessStory, getBusinessMetadataSuggestions } from '../services/geminiService';

type SortKey = 'name' | 'category' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export const AdminPortal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useNeighborProfile(user?.uid);
  const { businesses } = useBusinesses();
  const { profiles } = useProfiles();
  const { reviews: allReviews } = useAllReviews();
  const [activeTab, setActiveTab] = useState<'businesses' | 'neighbors' | 'reviews' | 'placeholders' | 'vital_records'>('businesses');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'review'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedNeighbor, setSelectedNeighbor] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'business' | 'neighbor' | 'review', data: any } | null>(null);
  const [actionConfirm, setActionConfirm] = useState<{ 
    title: string; 
    message: string; 
    onConfirm: () => void; 
    confirmText: string;
  } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: null });
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [showDataActions, setShowDataActions] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ subCategories: string[]; metaKeywords: string[]; recommendFireSafe: boolean } | null>(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [lastFetchedId, setLastFetchedId] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.isAdmin;
  const { deleteDoc: firestoreDeleteDoc } = { deleteDoc: deleteReview }; // Reuse deleteReview for name logic

  const fetchAiSuggestions = React.useCallback(async (business: Business) => {
    if (isFetchingSuggestions) return;
    
    setIsFetchingSuggestions(true);
    try {
      const suggestions = await getBusinessMetadataSuggestions({
        name: business.name,
        category: business.category,
        description: business.description
      });
      
      if (suggestions) {
        setAiSuggestions(suggestions);
        setLastFetchedId(business.id || business.name);
        
        // Local logic to recommend Fire Safe toggle if not already set
        if (suggestions.recommendFireSafe && !business.isFireSafeCertified) {
          setSelectedBusiness(prev => prev ? { ...prev, isFireSafeCertified: true } : null);
          setShowSuccess('AI Recommendation: Fire Safe Certified Toggled ON.');
          setTimeout(() => setShowSuccess(null), 5000);
        }
      }
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, [isFetchingSuggestions]);

  useEffect(() => {
    if (selectedBusiness && selectedBusiness.id !== lastFetchedId && !isFetchingSuggestions) {
      fetchAiSuggestions(selectedBusiness);
    } else if (!selectedBusiness) {
      setLastFetchedId(null);
      setAiSuggestions(null);
    }
  }, [selectedBusiness?.id, selectedBusiness?.name, lastFetchedId, isFetchingSuggestions, fetchAiSuggestions]);

  useEffect(() => {
    if (!user || (!isAdmin && user.email !== ADMIN_EMAIL)) {
      const timer = setTimeout(() => {
        if (!isAdmin && user?.email !== ADMIN_EMAIL) {
          navigate('/');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, navigate]);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => {
      if (current.key === key) {
        if (current.direction === 'asc') return { key, direction: 'desc' };
        if (current.direction === 'desc') return { key, direction: null };
        return { key, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortedBusinesses = (items: Business[]) => {
    if (!sortConfig.direction) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
      const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleExportCSV = (currentFilteredBusinesses: Business[]) => {
    const dataToExport = currentFilteredBusinesses.map(b => ({
      'Business Name': b.name,
      'Owner Name': b.ownerName || '',
      'Email': b.contact?.email || '',
      'Phone': b.contact?.phone || '',
      'Category': b.category,
      'Description': b.description,
      'Status': b.status,
      'Badges': `${b.isDivideGrown ? 'LocalProduct' : ''} ${b.isVital ? 'VitalResource' : ''}`.trim()
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `divide-locals-businesses-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'business_name', 
      'owner_name', 
      'email', 
      'phone', 
      'category', 
      'description', 
      'website_url', 
      'zip_code', 
      'divide_grown', 
      'resident_owned'
    ];
    
    const csv = Papa.unparse([headers]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `divide-locals-template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAPPING_LIBRARY: Record<string, Record<string, string[]>> = {
      'Professional & Tech': {
        'Notary': ['notary', 'signing agent', 'legal witness'],
        'IT Support': ['computer', 'network', 'web', 'it'],
        'Legal': ['attorney', 'lawyer', 'legal'],
        'Accounting': ['accountant', 'tax', 'bookkeeping']
      },
      'Local Services': {
        'Pet/Ranch Sitting': ['ranch', 'barn', 'livestock', 'farm stay', 'stable', 'sitter', 'ranch sitting'],
        'Pet Care': ['vet', 'veterinary', 'grooming', 'pet care', 'dog', 'cat'],
        'Weed Eating': ['mowing', 'blackberry', 'brush clearing', 'defensible space', 'fire safe', 'weed eating', 'clearance'],
        'Steel/Metal Work': ['welding', 'gate', 'fence', 'iron', 'fabrication', 'steel', 'metal work'],
        'Plumbing': ['pipe', 'drain', 'septic', 'plumber', 'plumbing'],
        'Electrical': ['wire', 'panel', 'outlet', 'electrician', 'electrical'],
        'Delivery/Ride Services': ['shuttle', 'transport', 'delivery', 'uber', 'lyft', 'courier', 'taxi', 'ride'],
        'Hauling': ['haul', 'dump', 'junk', 'trash']
      },
      'Land & Forest': {
        'Fire Mitigation': ['fire safe', 'clearing', 'defensible', 'brush', 'fuel reduction'],
        'Tree Removal': ['tree', 'logging', 'arborist'],
        'Excavation': ['grading', 'digging', 'excavation', 'dirt']
      },
      'Dining & Drinks': {
        'Restaurant': ['cafe', 'restaurant', 'food', 'grill', 'pizza', 'deli'],
        'Coffee Shop': ['coffee', 'bakery', 'tea', 'latte'],
        'Brewery': ['brewery', 'pub', 'beer', 'tavern']
      },
      'Health & Wellness': {
        'Yoga': ['yoga', 'studio', 'meditation'],
        'Gym': ['fitness', 'gym', 'workout', 'training'],
        'Medical': ['medical', 'clinic', 'dentist', 'doctor']
      }
    };

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let importedCount = 0;
        let updatedCount = 0;
        let mappedCount = 0;
        let reviewCount = 0;

        for (const row of results.data as any[]) {
          const name = row['business_name'] || row['Business Name'] || row['name'];
          if (!name) {
            reviewCount++;
            continue;
          }

          const rawCategoryAndSub = ((row['category'] || row['Category'] || '') + ' ' + (row['subcategory'] || row['subcategory'] || row['Sub-Category'] || '')).toLowerCase();
          let mappedCategory = row['category'] || row['Category'] || 'Local Services'; 
          let mappedSubCategory = row['subcategory'] || row['subcategory'] || row['Sub-Category'] || '';
          let mappingConfidence = 'low';

          // Semantic Category Mapping Engine
          for (const [officialCat, subCats] of Object.entries(MAPPING_LIBRARY)) {
            for (const [subCat, keywords] of Object.entries(subCats)) {
              const nameLower = name.toLowerCase();
              if (keywords.some(k => nameLower.includes(k) || rawCategoryAndSub.includes(k))) {
                mappedCategory = officialCat;
                mappedSubCategory = subCat;
                mappingConfidence = 'high';
                mappedCount++;
                break;
              }
            }
            if (mappingConfidence === 'high') break;
          }

          const existing = (businesses || []).find(b => b.name.toLowerCase() === name.toLowerCase());
          const slugify = (name: string) => name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
          
          let status = (row['status'] || row['Status'] || 'pending').toLowerCase() as any;
          if (mappingConfidence === 'low') {
            status = 'review';
            reviewCount++;
          }

          // Local ZIP to Town Mapping
          const zip = row['zip_code'] || row['zip'] || '95634';
          const isFireSafe = (row['fire_safe'] || '').toLowerCase() === 'true' || 
                             (row['Badges'] || '').includes('FireSafe') ||
                             mappedSubCategory === 'Weed Eating' || 
                             mappedSubCategory === 'Steel/Metal Work' ||
                             mappedSubCategory === 'Fire Mitigation';

          const businessData: Partial<Business> = {
            name,
            slug: slugify(name),
            ownerName: row['owner_name'] || row['Owner Name'] || row['ownerName'],
            contact: {
              email: row['email'] || row['Email'] || row['email_address'] || '',
              phone: row['phone'] || row['Phone'] || '',
              website: row['website_url'] || row['Website'] || row['website'] || '',
              businessAddress: row['business_address'] || row['Address'] || row['address'] || '',
            },
            category: mappedCategory,
            description: row['description'] || row['Description'] || '',
            status: status,
            isDivideGrown: (row['divide_grown'] || '').toLowerCase() === 'true' || (row['Badges'] || '').includes('LocalProduct'),
            isResidentOwned: (row['resident_owned'] || '').toLowerCase() === 'true',
            isVital: (row['is_vital'] || '').toLowerCase() === 'true' || (row['Badges'] || '').includes('VitalResource'),
            isFireSafeCertified: isFireSafe,
            privateHomeZip: zip,
            serviceAreas: ['The Divide'],
            tags: row['subcategory'] ? [row['subcategory']] : [],
            metaKeywords: row['keywords'] ? row['keywords'].split(',').map((k: string) => k.trim()) : []
          };

          // Trigger AI Meta-Data Suggestions
          if (businessData.tags?.length === 0 || businessData.metaKeywords?.length === 0) {
            const suggestions = await getBusinessMetadataSuggestions({
              name: businessData.name,
              category: businessData.category || 'Local Services',
              description: businessData.description
            });
            
            if (suggestions) {
              if (businessData.tags?.length === 0) businessData.tags = suggestions.subCategories;
              businessData.metaKeywords = [...new Set([...(businessData.metaKeywords || []), ...suggestions.metaKeywords])];
              if (suggestions.recommendFireSafe) {
                businessData.isFireSafeCertified = true;
              }
            }
          }

          // SEO Automation for Fire Safe
          if (businessData.isFireSafeCertified) {
            const safetyKeywords = ["Fire Safe Certified", "Emergency Preparedness", "Defensible Space"];
            businessData.metaKeywords = [...new Set([...(businessData.metaKeywords || []), ...safetyKeywords])];
          }

          // Trigger AI Description if empty
          if (!businessData.description) {
            const aiDesc = await generateBusinessStory({
              name: businessData.name,
              category: businessData.category || 'Local Services',
              zipCode: zip,
              serviceAreas: businessData.serviceAreas,
              isDivideGrown: businessData.isDivideGrown,
              isFireSafeCertified: businessData.isFireSafeCertified
            });
            if (aiDesc) businessData.description = aiDesc;
          }

          if (existing) {
            await updateBusiness(existing.id!, businessData);
            updatedCount++;
          } else {
            await addBusiness(businessData);
            importedCount++;
          }
        }

        setImportStatus(`Success: ${importedCount} Listings imported. ${mappedCount} Categories mapped. ${reviewCount} Flagged for Review.`);
        setTimeout(() => setImportStatus(null), 8000);
      }
    });

    // Reset file input
    e.target.value = '';
  };

  if (!isAdmin && user?.email !== ADMIN_EMAIL) {
    return (
      <div className="h-screen flex items-center justify-center bg-cream">
        <div className="text-center animate-pulse">
          <ShieldCheck size={48} className="mx-auto mb-4 text-earth/20" />
          <p className="text-earth/40 font-black uppercase tracking-widest text-xs">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  const filteredBusinesses = getSortedBusinesses(
    businesses
      .filter(b => {
        if (activeTab === 'businesses' && b.isVital) return false;
        if (activeTab === 'vital_records' && !b.isVital) return false;
        if (filter !== 'all' && b.status !== filter) return false;
        return true;
      })
      .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNeighbors = profiles.filter(p => 
    p.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = allReviews.filter(r => 
    r.userName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegenerateDescription = async (business: Business) => {
    setIsRegenerating(true);
    try {
      const newStory = await generateBusinessStory({
        name: business.name,
        category: business.category,
        serviceAreas: business.serviceAreas,
        isDivideGrown: business.isDivideGrown,
        isFireSafeCertified: business.isFireSafeCertified
      });
      if (newStory) {
        // Ensure new story doesn't contain Placer County (backup check)
        const scrubbedStory = newStory.replace(/Placer County/gi, 'El Dorado County');
        await updateBusiness(business.id!, { description: scrubbedStory });
        setSelectedBusiness({ ...business, description: scrubbedStory });
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleScrubVitals = async () => {
    const fireKeywords = ['fire station', 'fire dept', 'fire protection', 'cal fire', 'garden valley fire', 'georgetown fire', 'cool fire'];
    const candidates = businesses.filter(b => 
      !b.isVital && (
        fireKeywords.some(k => b.name.toLowerCase().includes(k)) ||
        b.category.toLowerCase().includes('public safety') ||
        b.vitalsCategory === 'Fire'
      )
    );

    if (candidates.length === 0) {
      setShowSuccess('No additional vital records found to scrub.');
      setTimeout(() => setShowSuccess(null), 5000);
      return;
    }

    setActionConfirm({
      title: 'Scrub Public Services → Vitals',
      message: `Found ${candidates.length} records that look like vital services (Fire/Safety). Would you like to move them to the Vitals managed collection?`,
      confirmText: 'Sync to Vitals',
      onConfirm: async () => {
        setIsScrubbing(true);
        let fixed = 0;
        try {
          for (const b of candidates) {
            await updateBusiness(b.id!, { 
              isVital: true, 
              status: 'approved',
              vitalsCategory: b.vitalsCategory || (b.name.toLowerCase().includes('fire') ? 'Fire' : 'Safety')
            });
            fixed++;
          }
          setShowSuccess(`Successfully promoted ${fixed} records to Vital Records.`);
          setTimeout(() => setShowSuccess(null), 6000);
        } finally {
          setIsScrubbing(false);
        }
      }
    });
  };

  const handleScrubCountyData = async () => {
    const affected = businesses.filter(b => 
      b.description?.toLowerCase().includes('placer county') || 
      b.metaKeywords?.some(k => k.toLowerCase().includes('placer county'))
    );

    if (affected.length === 0) {
      setShowSuccess('Perfect! No mentions of "Placer County" found in any records.');
      setTimeout(() => setShowSuccess(null), 5000);
      return;
    }

    setActionConfirm({
      title: 'Scrub County Data',
      message: `Found ${affected.length} businesses mentioning "Placer County". Would you like to automatically replace these with "El Dorado County"?`,
      confirmText: 'Scrub & Fix All',
      onConfirm: async () => {
        setIsScrubbing(true);
        let fixed = 0;
        try {
          for (const b of affected) {
            const updates: Partial<Business> = {};
            
            if (b.description?.toLowerCase().includes('placer county')) {
              updates.description = b.description.replace(/Placer County/gi, 'El Dorado County');
            }
            
            if (b.metaKeywords?.some(k => k.toLowerCase().includes('placer county'))) {
              updates.metaKeywords = b.metaKeywords.map(k => 
                k.toLowerCase().includes('placer county') ? k.replace(/Placer County/gi, 'El Dorado County') : k
              );
            }

            if (Object.keys(updates).length > 0) {
              await updateBusiness(b.id!, updates);
              fixed++;
            }
          }
          setShowSuccess(`Successfully scrubbed ${fixed} records. All references now point to El Dorado County.`);
          setTimeout(() => setShowSuccess(null), 6000);
        } finally {
          setIsScrubbing(false);
        }
      }
    });
  };

  const handleDeleteExecution = async () => {
    if (!itemToDelete) return;
    
    const { type, data } = itemToDelete;
    const itemName = data.name || data.displayName || 'Item';

    if (type === 'business') {
      await deleteBusiness(data.id);
      setSelectedBusiness(null);
    } else if (type === 'review') {
      await deleteReview(data.id);
    } else if (type === 'neighbor') {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      await deleteDoc(doc(db, 'profiles', data.uid));
      setSelectedNeighbor(null);
    }

    setItemToDelete(null);
    setShowSuccess(`"${itemName}" successfully removed.`);
    setTimeout(() => setShowSuccess(null), 4000);
  };

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Admin Header */}
      <header className="bg-[#2F3E5B] text-cream py-6 px-4 shadow-2xl relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/directory')}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-cream/60 hover:text-cream transition-colors"
              >
                <ChevronLeft size={14} />
                Back to Directory
              </button>
              <button 
                onClick={async () => {
                  const toFix = businesses.filter(b => !b.slug);
                  if (toFix.length === 0) {
                    setShowSuccess('All businesses already have slugs!');
                    setTimeout(() => setShowSuccess(null), 4000);
                    return;
                  }
                  setActionConfirm({
                    title: 'Sync Missing Slugs',
                    message: `Auto-generate URL slugs for ${toFix.length} businesses?`,
                    confirmText: 'Sync Slugs',
                    onConfirm: async () => {
                      let fixed = 0;
                      for (const b of toFix) {
                        const slug = b.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
                        await updateBusiness(b.id!, { slug });
                        fixed++;
                      }
                      setShowSuccess(`Synced ${fixed} missing slugs. Directory links are now active.`);
                      setTimeout(() => setShowSuccess(null), 4000);
                    }
                  });
                }}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#C9A24A] hover:text-white transition-colors ml-4 bg-[#C9A24A]/10 px-3 py-1 rounded-full"
              >
                <Sparkles size={12} />
                Sync Missing Slugs
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cream/10 rounded-2xl flex items-center justify-center border border-cream/20">
                <LayoutDashboard size={28} strokeWidth={ICON_STROKE} />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-black tracking-tight italic text-cream">Admin Portal</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-cream/40">Divide Locals Master Records</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-cream text-[#2F3E5B] rounded-full text-xs font-black uppercase tracking-widest hover:bg-cream/90 transition-all border border-cream/20 active:scale-95 shadow-xl"
            >
              Exit Portal
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-12 gap-8">
        {/* Main Navigation Tabs */}
        <div className="col-span-12">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide select-none pb-4 no-scrollbar px-2">
            <button
              onClick={() => setActiveTab('businesses')}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === 'businesses' ? 'bg-[#2F3E5B] text-[#E7D6BF] shadow-lg' : 'bg-white text-[#2F3E5B]/40 hover:bg-[#2F3E5B]/5'
              }`}
            >
              Businesses
            </button>
            <button
              onClick={() => setActiveTab('neighbors')}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === 'neighbors' ? 'bg-[#2F3E5B] text-[#E7D6BF] shadow-lg' : 'bg-white text-[#2F3E5B]/40 hover:bg-[#2F3E5B]/5'
              }`}
            >
              Neighbors
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === 'reviews' ? 'bg-[#2F3E5B] text-[#E7D6BF] shadow-lg' : 'bg-white text-[#2F3E5B]/40 hover:bg-[#2F3E5B]/5'
              }`}
            >
              Neighbor Feedback
            </button>
            <button
              onClick={() => setActiveTab('placeholders')}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === 'placeholders' ? 'bg-[#2F3E5B] text-[#E7D6BF] shadow-lg' : 'bg-white text-[#2F3E5B]/40 hover:bg-[#2F3E5B]/5'
              }`}
            >
              System Placeholders
            </button>
            <button
              onClick={() => setActiveTab('vital_records')}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === 'vital_records' ? 'bg-[#2F3E5B] text-[#E7D6BF] shadow-lg' : 'bg-white text-[#2F3E5B]/40 hover:bg-[#2F3E5B]/5'
              }`}
            >
              Vital Records
            </button>
          </div>
        </div>

        {/* Content Area */}
        <main className="col-span-12 bg-white rounded-[40px] border border-earth/10 shadow-sm overflow-hidden flex flex-col h-[75vh]">
          {/* Internal Toolbar: Utility Bar */}
          <div className="p-4 border-b border-[#2F3E5B]/5 bg-[#FDFBF7] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {activeTab === 'businesses' && (
                <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#2F3E5B]/10 shadow-sm overflow-hidden">
                  {(['all', 'pending', 'approved', 'review'] as const).map((f, idx) => (
                    <button
                      key={`${f}-${idx}`}
                      onClick={() => setFilter(f)}
                      className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        filter === f ? 'bg-[#2F3E5B] text-white shadow-sm' : 'text-[#2F3E5B]/30 hover:text-[#2F3E5B]/60'
                      }`}
                    >
                      {f === 'all' ? `All (${businesses.length})` : f === 'pending' ? `Pending (${businesses.filter(b => b.status === 'pending').length})` : f === 'review' ? `Review (${businesses.filter(b => b.status === 'review').length})` : 'Approved'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className={`relative flex items-center transition-all duration-300 ${isSearchExpanded ? 'w-full md:w-64' : 'w-10 md:w-48 overflow-hidden'}`}>
                <Search 
                  className={`absolute left-3 text-[#2F3E5B]/30 cursor-pointer hover:text-[#2F3E5B]/50 transition-colors ${!isSearchExpanded ? 'md:pointer-events-none' : ''}`} 
                  size={14} 
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                />
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`} 
                  className={`w-full bg-white border border-[#2F3E5B]/10 rounded-full py-2.5 pl-10 pr-4 text-[10px] outline-none focus:ring-2 ring-[#2F3E5B]/5 transition-all font-bold text-[#2F3E5B] ${!isSearchExpanded ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchExpanded(true)}
                  onBlur={() => searchQuery === '' && setIsSearchExpanded(false)}
                />
              </div>

              {activeTab === 'businesses' || activeTab === 'vital_records' ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowDataActions(!showDataActions)}
                    className={`flex items-center gap-2 px-6 py-2.5 bg-[#2F3E5B] rounded-full text-[10px] font-black uppercase tracking-widest text-[#E7D6BF] hover:bg-[#2F3E5B]/90 transition-all shadow-lg active:scale-95 ${showDataActions ? 'ring-2 ring-[#C9A24A]' : ''}`}
                  >
                    <Database size={14} />
                    Data Actions
                    <ChevronDown size={14} className={`transition-transform ${showDataActions ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showDataActions && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowDataActions(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-64 bg-[#E7D6BF] rounded-2xl shadow-2xl border border-[#2F3E5B]/10 overflow-hidden z-20"
                        >
                          <div className="p-2 space-y-1">
                            {activeTab === 'vital_records' && (
                              <>
                                <button 
                                  onClick={handleScrubVitals}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#2F3E5B] hover:bg-[#2F3E5B]/5 rounded-xl transition-all text-left"
                                >
                                  <ShieldCheck size={16} className="text-[#C9A24A]" />
                                  Scrub Public Services → Vitals
                                </button>
                                <button 
                                  onClick={async () => {
                                    const seedRecords: Partial<Business>[] = [
                                      {
                                        name: "Garden Valley Fire (HQ)",
                                        category: "Public Safety",
                                        description: "Garden Valley Fire Protection District Headquarters.",
                                        isVital: true,
                                        vitalsCategory: "Fire",
                                        status: "approved",
                                        contact: {
                                          businessAddress: "4860 Marshall Rd, Garden Valley, CA 95633",
                                          phone: "(530) 333-1240",
                                          email: "wnorman@gardenvalley.org",
                                          website: "https://gardenvalleyfire.org"
                                        },
                                        privateHomeZip: "95633",
                                        serviceAreas: ["Garden Valley", "Greenwood"]
                                      },
                                      {
                                        name: "Georgetown Fire (HQ)",
                                        category: "Public Safety",
                                        description: "Georgetown Fire Protection District Headquarters.",
                                        isVital: true,
                                        vitalsCategory: "Fire",
                                        status: "approved",
                                        contact: {
                                          businessAddress: "6283 Main St, Georgetown, CA 95634",
                                          phone: "(530) 333-4111",
                                          email: "info@geofire.org",
                                          website: "https://geofire.org"
                                        },
                                        privateHomeZip: "95634",
                                        serviceAreas: ["Georgetown"]
                                      },
                                      {
                                        name: "Cool Fire (Station 72)",
                                        category: "Public Safety",
                                        description: "Garden Valley Fire Protection District - Station 72.",
                                        isVital: true,
                                        vitalsCategory: "Fire",
                                        status: "approved",
                                        contact: {
                                          businessAddress: "7000 St Florian Dr, Cool, CA 95614",
                                          phone: "(530) 889-0111",
                                          email: "",
                                          website: ""
                                        },
                                        privateHomeZip: "95614",
                                        serviceAreas: ["Cool"]
                                      },
                                      {
                                        name: "CAL FIRE Garden Valley",
                                        category: "Public Safety",
                                        description: "California Department of Forestry and Fire Protection - Garden Valley Station.",
                                        isVital: true,
                                        vitalsCategory: "Fire",
                                        status: "approved",
                                        contact: {
                                          businessAddress: "4860 Marshall Rd, Garden Valley, CA 95633",
                                          phone: "(530) 644-2345",
                                          email: "",
                                          website: ""
                                        },
                                        privateHomeZip: "95633",
                                        serviceAreas: ["Garden Valley", "The Divide"]
                                      }
                                    ];

                                    let added = 0;
                                    for (const b of seedRecords) {
                                      const exists = businesses.find(eb => eb.name === b.name);
                                      if (!exists) {
                                        await addBusiness(b);
                                        added++;
                                      } else if (!exists.isVital) {
                                        await updateBusiness(exists.id!, { isVital: true, status: 'approved', vitalsCategory: 'Fire' });
                                        added++;
                                      }
                                    }
                                    setShowSuccess(`Synced ${added} Emergency Records to App!`);
                                    setTimeout(() => setShowSuccess(null), 5000);
                                    setShowDataActions(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#2F3E5B] hover:bg-[#2F3E5B]/5 rounded-xl transition-all text-left"
                                >
                                  <Zap size={16} className="text-[#C9A24A]" />
                                  Sync Emergency Seeds
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => {
                                handleDownloadTemplate();
                                setShowDataActions(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#2F3E5B] hover:bg-[#2F3E5B]/5 rounded-xl transition-all text-left"
                            >
                              <FileSpreadsheet size={16} className="text-[#2F3E5B]/40" />
                              Download CSV Template
                            </button>
                            <button 
                              onClick={() => {
                                handleExportCSV(filteredBusinesses);
                                setShowDataActions(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#2F3E5B] hover:bg-[#2F3E5B]/5 rounded-xl transition-all text-left"
                            >
                              <Download size={16} className="text-[#2F3E5B]/40" />
                              Export All Listings (CSV)
                            </button>
                            <button 
                              onClick={() => {
                                handleScrubCountyData();
                                setShowDataActions(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-xl transition-all text-left"
                            >
                              <ShieldCheck size={16} className="text-red-400" />
                              Scrub County Data (Placer → El Dorado)
                            </button>
                            <label className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#2F3E5B] hover:bg-[#2F3E5B]/5 rounded-xl transition-all cursor-pointer">
                              <Upload size={16} className="text-[#2F3E5B]/40" />
                              Import New Listings (CSV)
                              <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                            </label>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}
            </div>
          </div>

          <AnimatePresence>
            {importStatus && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-sage/10 border-b border-sage/20 px-8 py-3 text-[10px] font-bold text-sage uppercase tracking-wider flex items-center justify-between"
              >
                {importStatus}
                <button onClick={() => setImportStatus(null)} className="text-sage/40 hover:text-sage">
                  <XCircle size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-auto admin-scroll no-scrollbar scrollbar-hide">
            {activeTab === 'businesses' && (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-[#2F3E5B] z-10">
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E7D6BF]/60">
                    <th className="px-8 py-6 text-center">
                      <button 
                        onClick={() => handleSort('status')}
                        className="flex items-center justify-center gap-2 mx-auto hover:text-[#C9A24A] transition-colors group relative"
                      >
                        Status
                        {sortConfig.key === 'status' && (
                          sortConfig.direction === 'asc' ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />
                        )}
                        <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-[#C9A24A] transition-all group-hover:w-full"></span>
                      </button>
                    </th>
                    <th className="px-8 py-6 text-left">
                      <button 
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 hover:text-[#C9A24A] transition-colors group relative"
                      >
                        Business Name
                        {sortConfig.key === 'name' && (
                          sortConfig.direction === 'asc' ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />
                        )}
                        <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-[#C9A24A] transition-all group-hover:w-full"></span>
                      </button>
                    </th>
                    <th className="px-8 py-6 text-left">
                      <button 
                        onClick={() => handleSort('category')}
                        className="flex items-center gap-2 hover:text-[#C9A24A] transition-colors group relative"
                      >
                        Category
                        {sortConfig.key === 'category' && (
                          sortConfig.direction === 'asc' ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />
                        )}
                        <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-[#C9A24A] transition-all group-hover:w-full"></span>
                      </button>
                    </th>
                    <th className="px-8 py-6 text-right font-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth/5">
                  {filteredBusinesses.map((b, index) => (
                    <tr 
                      key={`biz-row-${b.id || index}`} 
                      className={`group transition-all ${index % 2 === 0 ? 'bg-[#F5E6D3]/10' : 'bg-[#E7D6BF]/05'} ${b.status === 'review' ? 'border-l-4 border-l-[#7A4A2E]' : ''}`}
                    >
                      <td className="px-8 py-5 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            let nextStatus = 'approved';
                            if (b.status === 'approved') nextStatus = 'pending';
                            if (b.status === 'pending') nextStatus = 'review';
                            if (b.status === 'review') nextStatus = 'approved';
                            updateBusiness(b.id!, { status: nextStatus as any });
                          }}
                          className={`inline-block px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
                            b.status === 'approved' ? 'bg-sage/20 text-[#2D3E2F] border-sage/40 shadow-sm' : 
                            b.status === 'review' ? 'bg-[#7A4A2E]/20 text-[#7A4A2E] border-[#7A4A2E]/40' :
                            'bg-gold/20 text-[#5B4A2F] border-gold/40'
                          }`}
                        >
                          {b.status}
                        </button>
                      </td>
                      <td className="px-8 py-5">
                        <div 
                          onClick={() => {
                            if (b.slug) {
                              navigate(`/business/${b.slug}`);
                            } else {
                              setSelectedBusiness(b);
                            }
                          }}
                          className="flex flex-col cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#7A4A2E] text-sm group-hover:text-[#2F3E5B] transition-colors">{b.name}</span>
                            {b.isResidentOwned && (
                              <div className="w-5 h-5 rounded-full bg-[#2F3E5B] flex items-center justify-center text-[#C9A24A] shrink-0 shadow-sm" title="Resident Owned">
                                <Home size={10} strokeWidth={3} className="fill-current" />
                              </div>
                            )}
                            {!b.slug && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[7px] font-black uppercase tracking-widest border border-red-200">Needs Review</span>
                            )}
                            {!b.heroUrl && (
                               <span className="px-2 py-0.5 bg-[#E7D6BF] text-[#2F3E5B] rounded text-[7px] font-black uppercase tracking-widest border border-[#2F3E5B]/10">Placeholder Hero</span>
                            )}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#B2AC88]">{b.serviceAreas?.[0] || 'The Divide'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black uppercase tracking-tight text-[#2F3E5B]/40 bg-[#2F3E5B]/5 px-3 py-1 rounded-full">{b.category}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBusiness(b);
                            }}
                            className="w-10 h-10 bg-navy/5 text-navy rounded-xl hover:bg-navy hover:text-white transition-all flex items-center justify-center shadow-sm"
                          >
                            <Settings size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'neighbors' && (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-[#2F3E5B] z-10">
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                    <th className="px-8 py-6 text-left font-black">Name</th>
                    <th className="px-8 py-6 text-left font-black">Email</th>
                    <th className="px-8 py-6 text-center font-black">Joined Date</th>
                    <th className="px-8 py-6 text-right font-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth/5">
                  {filteredNeighbors.map((p, index) => (
                    <tr key={`neighbor-row-${p.uid || index}`} className={`transition-all ${index % 2 === 0 ? 'bg-[#F5E6D3]/10' : 'bg-[#E7D6BF]/05'}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#2F3E5B]/10 rounded-full flex items-center justify-center font-serif text-sm font-black italic text-[#2F3E5B]">
                            {p.displayName?.[0] || '?'}
                          </div>
                          <span className="font-bold text-[#7A4A2E] text-sm">{p.displayName || 'Anonymous Neighbor'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs text-[#2F3E5B]/60">{p.email || 'No email provided'}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-[10px] font-bold text-[#2F3E5B]/40 uppercase tracking-widest">
                          {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : 'Historical'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-[#2F3E5B]">
                         <div className="flex items-center justify-end gap-6">
                           <span>{p.favorites?.length || 0}</span>
                           <button 
                             onClick={() => setSelectedNeighbor(p)}
                             className="w-10 h-10 bg-navy/5 text-navy rounded-xl hover:bg-navy hover:text-white transition-all flex items-center justify-center shadow-sm"
                           >
                             <Settings size={18} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'reviews' && (
              <div className="flex-1 overflow-auto no-scrollbar">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-[#2F3E5B] z-10">
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                      <th className="px-8 py-6 text-left font-black">Neighbor</th>
                      <th className="px-8 py-6 text-left font-black">Business</th>
                      <th className="px-8 py-6 text-center font-black">Rating</th>
                      <th className="px-8 py-6 text-left font-black">Comment</th>
                      <th className="px-8 py-6 text-right font-black">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth/5">
                    {allReviews.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <p className="text-earth/40 font-black uppercase tracking-widest text-xs">No reviews found yet.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredReviews.map((r, index) => (
                        <tr key={`review-row-${r.id || index}`} className={`transition-all ${index % 2 === 0 ? 'bg-[#F5E6D3]/10' : 'bg-[#E7D6BF]/05'} ${r.status === 'hidden' ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <img src={r.userPhoto || undefined} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full bg-[#2F3E5B]/10" alt="" />
                              <span className="font-bold text-[#7A4A2E] text-sm">{r.userName || 'Neighbor'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="font-bold text-[#2F3E5B] text-xs">{r.businessName}</span>
                            {r.status === 'hidden' && (
                              <span className="ml-2 px-2 py-0.5 bg-[#2F3E5B] text-[#E7D6BF] rounded text-[8px] font-black uppercase tracking-widest">Hidden</span>
                            )}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex justify-center text-gold">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} className={i < r.rating ? "fill-gold" : "text-gold/20"} />
                              ))}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-xs text-[#2F3E5B]/60 italic line-clamp-1 max-w-xs">{r.comment}</p>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button 
                                onClick={async () => {
                                  const newStatus = (r.status === 'hidden' ? 'published' : 'hidden') as any;
                                  await updateReview(r.id!, { status: newStatus });
                                  setShowSuccess(`Review status updated to ${newStatus}.`);
                                  setTimeout(() => setShowSuccess(null), 3000);
                                }}
                                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-sm ${
                                  r.status === 'hidden' 
                                  ? 'bg-[#2F3E5B] text-[#E7D6BF] hover:bg-[#2F3E5B]/90' 
                                  : 'bg-[#2F3E5B]/5 text-[#2F3E5B]/40 hover:bg-[#2F3E5B]/10'
                                }`}
                                title={r.status === 'hidden' ? 'Show Review' : 'Hide Review'}
                              >
                                {r.status === 'hidden' ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button 
                                onClick={() => setItemToDelete({ type: 'review', data: r })}
                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'vital_records' && (
              <div className="flex-1 overflow-auto no-scrollbar">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-[#2F3E5B] z-10">
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A24A]">
                      <th className="px-8 py-6 text-left font-black">Record Name</th>
                      <th className="px-8 py-6 text-left font-black">Town</th>
                      <th className="px-8 py-6 text-center font-black">Sync Type</th>
                      <th className="px-8 py-6 text-left font-black">Public Contact</th>
                      <th className="px-8 py-6 text-right font-black px-8">Authority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2F3E5B]/5">
                    {filteredBusinesses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <p className="text-earth/40 font-black uppercase tracking-widest text-xs">No vital records found matching search.</p>
                          <button 
                            onClick={() => setShowDataActions(true)}
                            className="mt-4 px-6 py-2 bg-[#2F3E5B] text-[#C9A24A] rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                          >
                            Sync Emergency Seeds
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredBusinesses.map((b, index) => (
                        <tr key={`vital-row-${b.id || index}`} className={`group transition-all ${index % 2 === 0 ? 'bg-[#2F3E5B]/05' : 'bg-transparent'}`}>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#2F3E5B] text-[#C9A24A] rounded-lg flex items-center justify-center">
                                <ShieldCheck size={16} />
                              </div>
                              <span className="font-bold text-[#2F3E5B] text-xs">{b.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#2F3E5B]/40">{b.privateHomeZip === '95634' ? 'Georgetown' : b.privateHomeZip === '95633' ? 'Garden Valley' : b.privateHomeZip === '95614' ? 'Cool' : 'The Divide'}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="px-3 py-1 bg-[#C9A24A]/10 text-[#C9A24A] rounded-full text-[8px] font-black uppercase tracking-widest border border-[#C9A24A]/20">
                              {b.vitalsCategory || 'System'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] font-black text-[#7A4A2E]">{b.contact?.phone}</span>
                              <span className="text-[9px] text-[#2F3E5B]/60 font-medium truncate max-w-[150px]">{b.contact?.email || b.contact?.businessAddress}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button 
                               onClick={() => setSelectedBusiness(b)}
                               className="w-10 h-10 bg-navy/5 text-navy rounded-xl hover:bg-navy hover:text-white transition-all flex items-center justify-center shadow-sm"
                             >
                               <Settings size={18} />
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'placeholders' && (
              <div className="p-12 text-center">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="w-20 h-20 bg-[#2F3E5B]/5 rounded-3xl flex items-center justify-center mx-auto text-[#2F3E5B]/20">
                    <FileText size={40} />
                  </div>
                  <h3 className="text-2xl font-serif font-black italic text-[#2F3E5B]">Data Import Queue</h3>
                  <p className="text-sm text-[#2F3E5B]/60 leading-relaxed">
                    This table is a temporary landing area for "Coming Soon" listings and automated data imports harvested from regional databases.
                  </p>
                  <div className="pt-8 border-t border-[#2F3E5B]/5">
                    <table className="w-full text-left">
                       <thead className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">
                         <tr>
                           <th className="pb-4">Source</th>
                           <th className="pb-4">Count</th>
                           <th className="pb-4">Status</th>
                         </tr>
                       </thead>
                       <tbody className="text-xs font-bold text-[#7A4A2E]">
                         <tr>
                           <td className="py-2">Chamber Data</td>
                           <td>12</td>
                           <td><span className="text-gold uppercase text-[8px]">In Queue</span></td>
                         </tr>
                         <tr>
                           <td className="py-2">Grown Local API</td>
                           <td>5</td>
                           <td><span className="text-gold uppercase text-[8px]">Validating</span></td>
                         </tr>
                       </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {selectedBusiness && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBusiness(null)}
              className="absolute inset-0 bg-[#2F3E5B]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-earth/5 flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="text-3xl font-serif font-black italic text-[#2F3E5B]">Manage Listing</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A24A]">Master Authority Record</p>
                </div>
                <button onClick={() => setSelectedBusiness(null)} className="w-10 h-10 rounded-full bg-[#2F3E5B]/5 flex items-center justify-center text-[#2F3E5B]/40 hover:bg-[#2F3E5B]/10 transition-all">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scroll">
                {/* Business Identity */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#2F3E5B]/30 pb-2 border-b border-[#2F3E5B]/5">Business Identity</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Business Name</label>
                      <input 
                        type="text"
                        value={selectedBusiness.name}
                        onChange={(e) => setSelectedBusiness({...selectedBusiness, name: e.target.value})}
                        className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Owner Name</label>
                      <input 
                        type="text"
                        value={selectedBusiness.ownerName || ''}
                        onChange={(e) => setSelectedBusiness({...selectedBusiness, ownerName: e.target.value})}
                        placeholder="Verified Individual Name"
                        className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Category</label>
                    <select 
                      value={selectedBusiness.category}
                      onChange={(e) => setSelectedBusiness({...selectedBusiness, category: e.target.value})}
                      className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B] appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Logo URL (Manual Override)</label>
                      <input 
                        type="text"
                        value={selectedBusiness.logoUrl || ''}
                        onChange={(e) => setSelectedBusiness({...selectedBusiness, logoUrl: e.target.value})}
                        placeholder="Paste a direct image link..."
                        className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Hero Image URL</label>
                      <input 
                        type="text"
                        value={selectedBusiness.heroUrl || ''}
                        onChange={(e) => setSelectedBusiness({...selectedBusiness, heroUrl: e.target.value})}
                        placeholder="Paste a direct image link..."
                        className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Sub-categories / Search Tags</label>
                    <input 
                      type="text"
                      value={selectedBusiness.tags?.join(', ') || ''}
                      onChange={(e) => setSelectedBusiness({...selectedBusiness, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                      placeholder="e.g. Plumbing, HVAC, Woodworking (comma separated)"
                      className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                    />
                    {aiSuggestions && aiSuggestions.subCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#C9A24A] flex items-center gap-1 w-full mb-1">
                          <Sparkles size={8} />
                          AI Suggestions (Click to Add):
                        </span>
                        {aiSuggestions.subCategories.map((sub, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const currentTags = selectedBusiness.tags || [];
                              if (!currentTags.includes(sub)) {
                                setSelectedBusiness({ ...selectedBusiness, tags: [...currentTags, sub] });
                              }
                            }}
                            className="px-3 py-1 bg-[#C9A24A]/10 text-[#C9A24A] rounded-full text-[9px] font-bold hover:bg-[#C9A24A]/20 transition-all border border-[#C9A24A]/20"
                          >
                            + {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* Contact Info */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#2F3E5B]/30 pb-2 border-b border-[#2F3E5B]/5">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Public Email</label>
                      <input 
                        type="email"
                        value={selectedBusiness.contact?.email || ''}
                        onChange={(e) => setSelectedBusiness({
                          ...selectedBusiness, 
                          contact: { 
                            website: selectedBusiness.contact?.website || '',
                            businessAddress: selectedBusiness.contact?.businessAddress || '',
                            phone: selectedBusiness.contact?.phone || '',
                            ...(selectedBusiness.contact || {}), 
                            email: e.target.value 
                          }
                        })}
                        className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Public Phone (Call)</label>
                      <input 
                        type="tel"
                        value={selectedBusiness.contact?.phone || ''}
                        onChange={(e) => setSelectedBusiness({
                          ...selectedBusiness, 
                          contact: { 
                            ...selectedBusiness.contact,
                            phone: e.target.value 
                          }
                        })}
                        className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">SMS / Text Number</label>
                      <input 
                        type="tel"
                        value={selectedBusiness.contact?.textPhone || ''}
                        onChange={(e) => setSelectedBusiness({
                          ...selectedBusiness, 
                          contact: { 
                            ...selectedBusiness.contact,
                            textPhone: e.target.value 
                          }
                        })}
                        className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Website URL</label>
                      <input 
                        type="url"
                        value={selectedBusiness.contact?.website || ''}
                        onChange={(e) => setSelectedBusiness({
                          ...selectedBusiness, 
                          contact: { 
                            email: selectedBusiness.contact?.email || '',
                            phone: selectedBusiness.contact?.phone || '',
                            businessAddress: selectedBusiness.contact?.businessAddress || '',
                            ...(selectedBusiness.contact || {}), 
                            website: e.target.value 
                          }
                        })}
                        className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Business Address</label>
                      <input 
                        type="text"
                        value={selectedBusiness.contact?.businessAddress || ''}
                        onChange={(e) => setSelectedBusiness({
                          ...selectedBusiness, 
                          contact: { 
                            email: selectedBusiness.contact?.email || '',
                            phone: selectedBusiness.contact?.phone || '',
                            website: selectedBusiness.contact?.website || '',
                            ...(selectedBusiness.contact || {}), 
                            businessAddress: e.target.value 
                          }
                        })}
                        className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                      />
                    </div>
                  </div>
                </section>

                {/* Classification & Status */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2F3E5B]/5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#2F3E5B]/30">Listing Classification</h3>
                    {selectedBusiness.status === 'pending' && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-gold animate-pulse flex items-center gap-1">
                        <ShieldCheck size={12} />
                        Badges Ready for Verification
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Current Status</label>
                        <select 
                          value={selectedBusiness.status}
                          onChange={(e) => setSelectedBusiness({...selectedBusiness, status: e.target.value as any})}
                          className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="review">Needs Review</option>
                          <option value="draft">Hidden / Draft</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Resident Owned</label>
                      <button 
                        onClick={() => setSelectedBusiness({...selectedBusiness, isResidentOwned: !selectedBusiness.isResidentOwned})}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${selectedBusiness.isResidentOwned ? 'bg-[#C9A24A] text-[#2F3E5B] border-[#C9A24A]' : 'bg-white text-[#2F3E5B]/20 border-[#2F3E5B]/5'}`}
                      >
                        {selectedBusiness.isResidentOwned ? 'Resident Owned' : 'Commuter / Corporate'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Divide Grown</label>
                      <button 
                        onClick={() => setSelectedBusiness({...selectedBusiness, isDivideGrown: !selectedBusiness.isDivideGrown})}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${selectedBusiness.isDivideGrown ? 'bg-[#7A4A2E] text-cream border-[#7A4A2E]' : 'bg-white text-[#2F3E5B]/20 border-[#2F3E5B]/5'}`}
                      >
                        {selectedBusiness.isDivideGrown ? 'Yes, Local Product' : 'Standard Business'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Vital Resource</label>
                      <button 
                        onClick={() => setSelectedBusiness({...selectedBusiness, isVital: !selectedBusiness.isVital})}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${selectedBusiness.isVital ? 'bg-[#2F3E5B] text-[#E7D6BF] border-[#2F3E5B]' : 'bg-white text-[#2F3E5B]/20 border-[#2F3E5B]/5'}`}
                      >
                        {selectedBusiness.isVital ? 'Vital Resource' : 'Normal Service'}
                      </button>
                    </div>
                    {selectedBusiness.isVital && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Vitals Category</label>
                        <select 
                          value={selectedBusiness.vitalsCategory || 'System'}
                          onChange={(e) => setSelectedBusiness({...selectedBusiness, vitalsCategory: e.target.value as any})}
                          className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B] appearance-none"
                        >
                          <option value="Fire">Fire</option>
                          <option value="Water">Water</option>
                          <option value="Medical">Medical</option>
                          <option value="System">System</option>
                          <option value="Safety">Safety</option>
                        </select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Eco-Friendly</label>
                      <button 
                        onClick={() => setSelectedBusiness({...selectedBusiness, isEcoFriendly: !selectedBusiness.isEcoFriendly})}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${selectedBusiness.isEcoFriendly ? 'bg-sage text-white border-sage' : 'bg-white text-[#2F3E5B]/20 border-[#2F3E5B]/5'}`}
                      >
                        {selectedBusiness.isEcoFriendly ? 'Eco Badge Active' : 'No Eco Badge'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Community Partner</label>
                      <button 
                        onClick={() => setSelectedBusiness({...selectedBusiness, isCommunityPartner: !selectedBusiness.isCommunityPartner})}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${selectedBusiness.isCommunityPartner ? 'bg-earth text-cream border-earth' : 'bg-white text-[#2F3E5B]/20 border-[#2F3E5B]/5'}`}
                      >
                        {selectedBusiness.isCommunityPartner ? 'Partner Active' : 'No Partner Badge'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Fire Safe Certified</label>
                      <button 
                        onClick={() => {
                          const isCertified = !selectedBusiness.isFireSafeCertified;
                          let newKeywords = [...(selectedBusiness.metaKeywords || [])];
                          if (isCertified) {
                            const safetyKeywords = ["Fire Safe Certified", "Emergency Preparedness", "Defensible Space"];
                            newKeywords = [...new Set([...newKeywords, ...safetyKeywords])];
                            setShowSuccess('Fire Safe Badges & Meta-Keywords Updated!');
                            setTimeout(() => setShowSuccess(null), 3000);
                          }
                          setSelectedBusiness({...selectedBusiness, isFireSafeCertified: isCertified, metaKeywords: newKeywords});
                        }}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${selectedBusiness.isFireSafeCertified ? 'bg-[#2F3E5B] text-[#C9A24A] border-[#2F3E5B]' : 'bg-white text-[#2F3E5B]/20 border-[#2F3E5B]/5'}`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <ShieldCheck size={14} />
                          {selectedBusiness.isFireSafeCertified ? 'Fire Safe Certified' : 'Not Certified'}
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">SEO Meta-Keywords</label>
                    <input 
                      type="text"
                      value={selectedBusiness.metaKeywords?.join(', ') || ''}
                      onChange={(e) => setSelectedBusiness({...selectedBusiness, metaKeywords: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                      placeholder="e.g. Tree Removal, Defensible Space, Sierra Foothills (comma separated)"
                      className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                    />
                    {aiSuggestions && aiSuggestions.metaKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#C9A24A] flex items-center gap-1 w-full mb-1">
                          <Sparkles size={8} />
                          AI Suggestions (Click to Add):
                        </span>
                        {aiSuggestions.metaKeywords.map((kw, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const currentKeywords = selectedBusiness.metaKeywords || [];
                              if (!currentKeywords.includes(kw)) {
                                setSelectedBusiness({ ...selectedBusiness, metaKeywords: [...currentKeywords, kw] });
                              }
                            }}
                            className="px-3 py-1 bg-[#C9A24A]/10 text-[#C9A24A] rounded-full text-[9px] font-bold hover:bg-[#C9A24A]/20 transition-all border border-[#C9A24A]/20"
                          >
                            + {kw}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-[8px] text-[#2F3E5B]/40 font-bold uppercase tracking-widest pt-1">Used for deep search indexing & emergency discovery.</p>
                  </div>
                </section>

                {/* AI Magic Station */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2F3E5B]/5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#2F3E5B]/30">AI Magic Station</h3>
                    <button 
                      onClick={() => handleRegenerateDescription(selectedBusiness)}
                      disabled={isRegenerating}
                      className="flex items-center gap-2 px-6 py-2 bg-[#2F3E5B] text-[#E7D6BF] rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                    >
                      <Sparkles size={14} className={isRegenerating ? "animate-spin" : ""} />
                      {isRegenerating ? "Poofing..." : "Regenerate AI Description"}
                    </button>
                  </div>
                  <textarea 
                    value={selectedBusiness.description}
                    onChange={(e) => setSelectedBusiness({...selectedBusiness, description: e.target.value})}
                    className="w-full h-32 bg-[#FDFBF7] border border-earth/10 rounded-[32px] p-8 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all italic text-[#2F3E5B]/80 leading-relaxed font-serif resize-none"
                  />
                </section>

                {/* Danger Zone */}
                <section className="pt-10 border-t border-red-500/10">
                  <div className="flex items-center justify-between bg-red-500/5 p-6 rounded-[32px] border border-red-500/10">
                    <div>
                      <h4 className="text-sm font-bold text-red-600">Danger Zone</h4>
                      <p className="text-[10px] text-red-600/60 font-medium">Irreversible actions for this record.</p>
                    </div>
                    <button 
                      onClick={() => setItemToDelete({ type: 'business', data: selectedBusiness })}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-red-600 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={16} />
                      Delete Business Listing
                    </button>
                  </div>
                </section>
              </div>

              <div className="p-8 bg-[#FDFBF7] border-t border-earth/5 flex items-center justify-between">
                <button 
                  onClick={() => setSelectedBusiness(null)}
                  className="px-10 py-4 bg-white text-[#2F3E5B] border border-[#2F3E5B]/10 rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#2F3E5B]/5 transition-all"
                >
                  Cancel Changes
                </button>
                <button 
                  onClick={async () => {
                    await updateBusiness(selectedBusiness.id!, selectedBusiness);
                    setSelectedBusiness(null);
                    setShowSuccess('Record Updated!');
                    setTimeout(() => setShowSuccess(null), 3000);
                  }}
                  className="px-12 py-4 bg-[#2F3E5B] text-[#E7D6BF] rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all text-xs"
                >
                  Save Master Record
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Action Confirmation Modal */}
        {actionConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActionConfirm(null)}
              className="absolute inset-0 bg-[#2F3E5B]/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="relative w-full max-w-md bg-[#E7D6BF] rounded-[40px] shadow-2xl p-10 text-center"
            >
              <div className="w-20 h-20 bg-[#2F3E5B]/5 rounded-3xl flex items-center justify-center mx-auto mb-8 text-[#2F3E5B]">
                <Clock size={40} />
              </div>
              <h3 className="text-2xl font-serif font-black italic text-[#2F3E5B] mb-4">
                {actionConfirm.title}
              </h3>
              <p className="text-sm text-[#2F3E5B]/60 leading-relaxed mb-10 px-4">
                {actionConfirm.message}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setActionConfirm(null)}
                  className="px-6 py-4 bg-white border border-[#2F3E5B]/10 text-[#2F3E5B] rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-[#2F3E5B]/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    actionConfirm.onConfirm();
                    setActionConfirm(null);
                  }}
                  className="px-6 py-4 bg-[#2F3E5B] text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-[#2F3E5B]/90 transition-all hover:scale-105"
                >
                  {actionConfirm.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-[#2F3E5B]/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="relative w-full max-w-md bg-[#E7D6BF] rounded-[40px] shadow-2xl p-10 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-[#DC2626]">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-serif font-black italic text-[#2F3E5B] mb-4">
                Delete {itemToDelete.type === 'business' ? itemToDelete.data.name : 
                        itemToDelete.type === 'neighbor' ? (itemToDelete.data.displayName || 'Neighbor') :
                        'Review'}?
              </h3>
              <p className="text-sm text-[#2F3E5B]/60 leading-relaxed mb-10 px-4">
                {itemToDelete.type === 'business' ? 'This action is permanent and will remove this listing from Divide Locals. Are you absolutely sure?' :
                 itemToDelete.type === 'neighbor' ? 'This will permanently remove this user and all their associated data (favorites and reviews) from Divide Locals. This action cannot be undone.' :
                 'This feedback will be removed permanently. This action cannot be undone.'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="px-6 py-4 bg-white border border-[#2F3E5B]/10 text-[#2F3E5B] rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-[#2F3E5B]/5 transition-all"
                >
                  Nevermind
                </button>
                <button 
                  onClick={handleDeleteExecution}
                  className="px-6 py-4 bg-[#DC2626] text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all hover:scale-105"
                >
                  Yes, Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Neighbor Management Modal */}
        {selectedNeighbor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNeighbor(null)}
              className="absolute inset-0 bg-[#2F3E5B]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-earth/5 flex justify-between items-center bg-[#FDFBF7]">
                <div>
                  <h2 className="text-3xl font-serif font-black italic text-[#2F3E5B]">Neighbor Record</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A24A]">Profile & Trust Management</p>
                </div>
                <button onClick={() => setSelectedNeighbor(null)} className="w-10 h-10 rounded-full bg-[#2F3E5B]/5 flex items-center justify-center text-[#2F3E5B]/40 hover:bg-[#2F3E5B]/10 transition-all">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scroll">
                <section className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Neighbor Name</label>
                    <input 
                      type="text"
                      value={selectedNeighbor.displayName || ''}
                      onChange={(e) => setSelectedNeighbor({...selectedNeighbor, displayName: e.target.value})}
                      className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Email Address</label>
                    <input 
                      type="email"
                      readOnly
                      value={selectedNeighbor.email || ''}
                      className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none font-bold text-[#2F3E5B]/60 cursor-not-allowed"
                    />
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Account Trust Level</label>
                    <select
                      value={selectedNeighbor.status || 'active'}
                      onChange={(e) => setSelectedNeighbor({...selectedNeighbor, status: e.target.value as any})}
                      className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                    >
                      <option value="active">Active Neighbor</option>
                      <option value="flagged">Flagged</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Moved to the Divide</label>
                    <input 
                      type="month"
                      value={selectedNeighbor.residentSince || ''}
                      onChange={(e) => setSelectedNeighbor({...selectedNeighbor, residentSince: e.target.value})}
                      className="w-full bg-[#FDFBF7] border border-earth/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all font-bold text-[#2F3E5B]"
                    />
                  </div>
                </section>

                <section className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Neighbor Bio</label>
                  <textarea 
                    value={selectedNeighbor.bio || ''}
                    onChange={(e) => setSelectedNeighbor({...selectedNeighbor, bio: e.target.value})}
                    placeholder="Neighbor's public intro..."
                    className="w-full h-24 bg-[#FDFBF7] border border-earth/10 rounded-3xl p-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all text-[#2F3E5B] font-medium resize-none shadow-inner"
                  />
                </section>

                <section className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Internal Administrative Notes</label>
                  <textarea 
                    value={selectedNeighbor.notes || ''}
                    onChange={(e) => setSelectedNeighbor({...selectedNeighbor, notes: e.target.value})}
                    placeholder="e.g., Local business owner, helpful community contributor..."
                    className="w-full h-24 bg-[#FDFBF7] border border-earth/10 rounded-3xl p-6 text-sm outline-none focus:ring-2 ring-[#7A4A2E] transition-all text-[#2F3E5B] font-medium resize-none shadow-inner"
                  />
                </section>

                <section className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Favorites Overview</label>
                  <div className="bg-[#FDFBF7] rounded-3xl p-6 border border-[#2F3E5B]/5">
                    {selectedNeighbor.favorites?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedNeighbor.favorites.map((favId: string, idx: number) => {
                          const name = businesses.find(b => b.id === favId)?.name || 'Unknown Business';
                          return (
                            <span key={`${favId}-${idx}`} className="px-3 py-1.5 bg-white border border-[#2F3E5B]/10 rounded-full text-[10px] font-bold text-[#2F3E5B]/60">
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-[#2F3E5B]/20 uppercase tracking-widest italic">No favorites saved yet.</p>
                    )}
                  </div>
                </section>

                {/* Danger Zone */}
                <section className="pt-10 border-t border-red-500/10">
                  <div className="flex items-center justify-between bg-red-500/5 p-6 rounded-[32px] border border-red-500/10">
                    <div>
                      <h4 className="text-sm font-bold text-red-600">Danger Zone</h4>
                      <p className="text-[10px] text-red-600/60 font-medium">Permanently remove this neighbor and their data.</p>
                    </div>
                    <button 
                      onClick={() => setItemToDelete({ type: 'neighbor', data: selectedNeighbor })}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-red-600 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={16} />
                      Delete Neighbor Account
                    </button>
                  </div>
                </section>
              </div>

              <div className="p-8 bg-[#FDFBF7] border-t border-earth/5 flex items-center justify-between">
                <button 
                  onClick={() => setSelectedNeighbor(null)}
                  className="px-10 py-4 bg-white text-[#2F3E5B] border border-[#2F3E5B]/10 rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#2F3E5B]/5 transition-all"
                >
                  Discard Changes
                </button>
                <button 
                  onClick={async () => {
                    const { updateProfile } = await import('../lib/hooks');
                    await updateProfile(selectedNeighbor.uid, {
                      displayName: selectedNeighbor.displayName || '',
                      status: selectedNeighbor.status || 'active',
                      notes: selectedNeighbor.notes || '',
                      bio: selectedNeighbor.bio || '',
                      residentSince: selectedNeighbor.residentSince || ''
                    });
                    setSelectedNeighbor(null);
                    setShowSuccess('Neighbor Record Updated!');
                    setTimeout(() => setShowSuccess(null), 3000);
                  }}
                  className="px-12 py-4 bg-[#7A4A2E] text-white rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all text-xs"
                >
                  Save Neighbor Record
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Success Notification */}
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[110] px-8 py-4 bg-sage text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center gap-3"
          >
            <ShieldCheck size={16} />
            {showSuccess}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
