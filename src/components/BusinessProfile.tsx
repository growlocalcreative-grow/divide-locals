import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Award, 
  Sprout, 
  Heart, 
  Share2, 
  Edit3,
  Trees,
  MessageSquare,
  Send,
  Mail,
  ExternalLink,
  Settings,
  X,
  Check
} from 'lucide-react';
import { auth, db, signInWithGoogle } from '../lib/firebase';
import { useAuth, useBusinesses, useNeighborProfile, toggleFavorite, updateBusiness } from '../lib/hooks';
import { updateDoc, doc } from 'firebase/firestore';
import { formatPhoneNumber, getRawPhone } from '../utils';
import { ReviewSection } from './common/ReviewSection';
import { TrustBadgeTray } from './common/TrustBadgeTray';
import { BrandLogo } from './common/BrandLogo';
import { CategoryIcon } from './common/CategoryIcon';
import { ShareModal } from './common/ShareModal';
import { ICON_STROKE, CATEGORY_SUBCATEGORIES, DIVIDE_COMMUNITIES, CATEGORY_HEROES, CATEGORY_ICON_NAMES, CATEGORIES } from '../constants';
import { AnimatePresence } from 'motion/react';

export const BusinessProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { businesses, loading } = useBusinesses();
  const business = businesses.find(b => b.slug === slug || b.id === slug);
  const { profile } = useNeighborProfile(user?.uid);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    if (business) {
      document.title = `${business.name} | Divide Locals`;
      setIsFavorited(profile?.favorites?.includes(business.id || '') || false);
    }
  }, [business, profile]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#E7D6BF]"><div className="w-8 h-8 border-4 border-[#2F3E5B]/10 border-t-[#2F3E5B] rounded-full animate-spin" /></div>;
  if (!business) return <div className="h-screen flex items-center justify-center bg-[#E7D6BF] text-[#2F3E5B] font-serif italic">Business not found.</div>;

  const handleToggleFavorite = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    await toggleFavorite(business.id!, user.uid, isFavorited);
  };

  const handleShare = () => {
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
    <div className="min-h-screen bg-[#E7D6BF] pb-32">
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        businessName={business.name}
        shareUrl={window.location.href}
      />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-4 relative z-10">
        <button 
          onClick={() => navigate('/directory')}
          className="flex items-center gap-2 text-[#2F3E5B] hover:opacity-70 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-sm border border-[#2F3E5B]/5">
            <ChevronLeft size={16} strokeWidth={3} />
          </div>
          <span className="font-black uppercase tracking-widest text-[10px]">Directory</span>
        </button>
      </div>

      {/* Hero Section (16:9) */}
      <div className="max-w-4xl mx-auto px-4 overflow-hidden">
        <div 
          className="relative aspect-video rounded-[40px] overflow-hidden shadow-2xl bg-center transition-all duration-700 flex items-center justify-center shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] border border-[#2F3E5B]/5"
          style={business.heroUrl ? { backgroundImage: `url(${business.heroUrl})`, backgroundSize: 'cover' } : { backgroundColor: getHeroBackground(business.category) }}
        >
          {/* Noise/Gradient Overlay for placeholders */}
          {!business.heroUrl && (
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
          )}
          {!business.heroUrl && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#2F3E5B]/40 via-transparent to-transparent" />
          
          {!business.heroUrl && (
            <div className="relative z-10 scale-150 text-[#E7D6BF]">
              <CategoryIcon category={business.category} size={100} />
            </div>
          )}
          
          {/* Manage Profile Button for Owners */}
          {(user?.uid === business.ownerId || user?.email === business.contact?.email) && (
            <div className="absolute top-6 right-6">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-5 py-3 bg-white/90 backdrop-blur-md rounded-full text-[#2F3E5B] shadow-xl hover:scale-105 active:scale-95 transition-all border border-white flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
              >
                <Settings size={16} />
                <span>Manage Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <BusinessSelfServiceModal 
            business={business} 
            onClose={() => setIsEditModalOpen(false)} 
            onSuccess={() => {
              setShowUpdateToast(true);
              setTimeout(() => setShowUpdateToast(false), 3000);
            }}
          />
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showUpdateToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-[#869F77] text-white rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <Check size={20} />
            Profile updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Identity Block */}
      <div className="max-w-2xl mx-auto px-6 relative -mt-16 text-center">
        <div className="inline-block relative">
          <BrandLogo business={business} size="lg" className="border-4 border-[#E7D6BF]" />
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-[#2F3E5B] italic leading-tight">{business.name}</h1>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">
            {business.category} • {business.serviceAreas?.[0] || 'The Divide'}
          </span>
        </div>

        {/* Action Grid (2x3 or 3x2) - Centered */}
        <div className="mt-10 max-w-sm mx-auto grid grid-cols-3 gap-6 justify-center">
          <a 
            href={`tel:${getRawPhone(business.contact?.phone || '')}`}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-active:scale-95 transition-all ${business.primaryContactMethod === 'call' ? 'bg-[#C9A24A] text-white ring-4 ring-[#C9A24A]/20' : 'bg-[#2F3E5B] text-white'}`}>
              <Phone size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-[#2F3E5B]/40">Call</span>
          </a>

          <a 
            href={`sms:${getRawPhone(business.contact?.phone || '')}?body=${encodeURIComponent("Hi! I found you on Divide Locals and I'm interested in your services. Looking forward to hearing from you!")}`}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-active:scale-95 transition-all ${business.primaryContactMethod === 'text' ? 'bg-[#C9A24A] text-white ring-4 ring-[#C9A24A]/20' : 'bg-[#2F3E5B] text-white'}`}>
              <MessageSquare size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-[#2F3E5B]/40">Text</span>
          </a>

          <a 
            href={`mailto:${business.contact?.email || ''}`}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-active:scale-95 transition-all ${business.primaryContactMethod === 'email' ? 'bg-[#C9A24A] text-white ring-4 ring-[#C9A24A]/20' : 'bg-[#2F3E5B] text-white'}`}>
              <Mail size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-[#2F3E5B]/40">Email</span>
          </a>

          {business.contact?.website && (
            <a 
              href={business.contact.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-[#2F3E5B] text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-all">
                <Globe size={22} strokeWidth={2.5} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-[#2F3E5B]/40">Website</span>
            </a>
          )}


          <button 
            onClick={handleToggleFavorite}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-active:scale-95 transition-all ${isFavorited ? 'bg-[#C9A24A] text-white' : 'bg-[#2F3E5B] text-white'}`}>
              <Heart size={22} strokeWidth={2.5} className={isFavorited ? 'fill-white' : ''} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-[#2F3E5B]/40">Favorite</span>
          </button>

          <button 
            onClick={handleShare}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-full bg-[#2F3E5B] text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-all">
              <Share2 size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-[#2F3E5B]/40">Share</span>
          </button>
        </div>
      </div>

      {/* Content Flow */}
      <div className="max-w-2xl mx-auto px-6 mt-20 space-y-20">
        {/* Story Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-[#2F3E5B]/10" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2F3E5B]/40">Our Neighborhood Story</h2>
            <div className="h-[1px] flex-1 bg-[#2F3E5B]/10" />
          </div>
          <p className="text-xl text-[#2F3E5B] leading-[1.6] font-serif italic text-center whitespace-pre-wrap">
            "{business.description || 'A trusted neighbor serving our mountain community.'}"
          </p>
        </section>

        {/* Highlights Section */}
        <section className="bg-white/40 rounded-[40px] p-8 border border-white/40 space-y-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#2F3E5B] text-center">Quick Highlights</h3>
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A24A] mt-2 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2F3E5B]/40">Home Base</span>
                <span className="font-serif italic font-black text-[#2F3E5B]">{business.contact?.businessAddress || 'The Divide'}</span>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A24A] mt-2 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2F3E5B]/40">Service Area</span>
                <span className="font-serif italic font-black text-[#2F3E5B]">
                  {business.serviceAreas?.join(', ') || 'All Communities'}
                </span>
              </div>
            </li>

            {business.tags && business.tags.length > 0 && (
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A24A] mt-2 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#2F3E5B]/40">Expertise</span>
                  <p className="font-serif italic font-black text-[#2F3E5B] leading-relaxed">
                    {business.tags.join(' • ')}
                  </p>
                </div>
              </li>
            )}
          </ul>
        </section>

        {/* Badges Section */}
        <div className="flex justify-center">
          <TrustBadgeTray business={business} />
        </div>

        {/* Reviews */}
        <ReviewSection businessId={business.id!} businessName={business.name} />
      </div>

    </div>
  );
};

const BusinessSelfServiceModal = ({ business, onClose, onSuccess }: { business: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: business.name || '',
    ownerName: business.ownerName || '',
    category: business.category || '',
    description: business.description || '',
    phone: business.contact?.phone || '',
    email: business.contact?.email || '',
    website: business.contact?.website || '',
    primaryContactMethod: business.primaryContactMethod || 'email'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, {
        name: formData.name,
        ownerName: formData.ownerName,
        category: formData.category,
        description: formData.description,
        primaryContactMethod: formData.primaryContactMethod,
        contact: {
          ...business.contact,
          phone: formData.phone,
          email: formData.email,
          website: formData.website
        }
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating business profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#2F3E5B]/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-[#2F3E5B]/5 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-serif font-black italic text-[#2F3E5B]">Manage Your Profile</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Self-Service Editor</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-[#2F3E5B]/5 rounded-full transition-colors text-[#2F3E5B]">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-12">
          {/* Identity Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-[#2F3E5B]/10" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2F3E5B]/40">Business Identity</h3>
              <div className="h-[1px] flex-1 bg-[#2F3E5B]/10" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Business Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-[#2F3E5B]/10 px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-[#7A4A2E] text-[#2F3E5B] font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Owner Name</label>
                <input 
                  type="text" 
                  value={formData.ownerName}
                  onChange={e => setFormData({...formData, ownerName: e.target.value})}
                  className="w-full bg-white border border-[#2F3E5B]/10 px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-[#7A4A2E] text-[#2F3E5B] font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Business Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-white border border-[#2F3E5B]/10 px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-[#7A4A2E] text-[#2F3E5B] font-bold appearance-none"
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Vitals Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-[#2F3E5B]/10" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2F3E5B]/40">Contact Vitals</h3>
              <div className="h-[1px] flex-1 bg-[#2F3E5B]/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Public Phone</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                  className="w-full bg-white border border-[#2F3E5B]/10 px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-[#7A4A2E] text-[#2F3E5B] font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Public Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-[#2F3E5B]/10 px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-[#7A4A2E] text-[#2F3E5B] font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Website URL</label>
              <input 
                type="url" 
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                className="w-full bg-white border border-[#2F3E5B]/10 px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-[#7A4A2E] text-[#2F3E5B] font-bold"
                placeholder="https://..."
              />
            </div>
          </section>

          {/* Story Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-[#2F3E5B]/10" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2F3E5B]/40">The Story</h3>
              <div className="h-[1px] flex-1 bg-[#2F3E5B]/10" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Business Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-white border border-[#2F3E5B]/10 px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-[#7A4A2E] text-[#2F3E5B] font-bold h-40 resize-none"
                placeholder="Tell our neighbors your story..."
              />
            </div>
          </section>

          {/* Preferred Contact */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-[#2F3E5B]/10" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2F3E5B]/40">Communication</h3>
              <div className="h-[1px] flex-1 bg-[#2F3E5B]/10" />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Preferred Contact Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['text', 'call', 'email'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({...formData, primaryContactMethod: method as any})}
                    className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${
                      formData.primaryContactMethod === method
                      ? 'bg-[#2F3E5B] text-white border-[#2F3E5B] shadow-lg shadow-[#2F3E5B]/20 scale-[1.02]'
                      : 'bg-white text-[#2F3E5B]/40 border-[#2F3E5B]/10 hover:border-[#2F3E5B]/40'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </form>

        <div className="p-8 border-t border-[#2F3E5B]/5 bg-white/50 backdrop-blur-md flex gap-4 sticky bottom-0 z-10">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-5 rounded-full font-black uppercase tracking-widest text-[10px] text-[#2F3E5B] border border-[#2F3E5B]/10 hover:bg-[#2F3E5B]/5 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] py-5 bg-[#2F3E5B] text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#2F3E5B]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export const BusinessEdit = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { businesses } = useBusinesses();
  const business = businesses.find(b => b.slug === slug);
  const [formData, setFormData] = useState<any>(null);
  const [currentService, setCurrentService] = useState('');

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name,
        description: business.description,
        phone: business.contact.phone,
        email: business.contact.email,
        website: business.contact.website,
        businessAddress: business.contact.businessAddress,
        serviceAreas: business.serviceAreas || [],
        category: business.category,
        isVital: business.isVital,
        tags: business.tags || [],
        preferredContact: business.preferredContact || 'call',
        isEmergencySupport: business.isEmergencySupport || false
      });
    }
  }, [business]);

  const toggleTag = (tag: string) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter((t: string) => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  const addServiceArea = () => {
    if (currentService.trim() && !formData.serviceAreas.includes(currentService.trim())) {
      setFormData({
        ...formData,
        serviceAreas: [...formData.serviceAreas, currentService.trim()]
      });
      setCurrentService('');
    }
  };

  const removeServiceArea = (tag: string) => {
    setFormData({
      ...formData,
      serviceAreas: formData.serviceAreas.filter((s: string) => s !== tag)
    });
  };

  if (!business || !formData) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (auth.currentUser?.uid !== business.ownerId) return <div className="h-screen flex items-center justify-center">Unauthorized.</div>;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBusiness(business.id!, {
        ...formData,
        contact: {
          website: formData.website,
          email: formData.email,
          phone: formData.phone,
          businessAddress: formData.businessAddress
        }
      });
      navigate(`/business/${business.slug}`);
    } catch (err: any) {
      alert("Error: " + (err.code || err.message));
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold font-serif mb-8 text-earth">Edit Business Profile</h1>
      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[40px] shadow-2xl border border-earth/5 space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-sand">Business Name</label>
          <input 
            className="w-full bg-cream/20 px-6 py-4 rounded-2xl outline-none"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-sand">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(CATEGORY_SUBCATEGORIES).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setFormData({...formData, category: c, tags: []})}
                className={`p-3 rounded-xl border transition-all flex items-center gap-2 text-left ${
                  formData.category === c
                  ? 'bg-earth text-cream border-earth shadow-md'
                  : 'bg-white text-navy/40 border-earth/10'
                }`}
              >
                <CategoryIcon category={c} size={16} />
                <span className="text-[10px] font-bold uppercase tracking-tight">{c}</span>
              </button>
            ))}
          </div>
        </div>

        {CATEGORY_SUBCATEGORIES[formData.category] && (
          <div className="space-y-3 pt-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-sand">What We Do</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_SUBCATEGORIES[formData.category].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    formData.tags.includes(tag) 
                    ? 'bg-[#2D5A5E] text-[#FCF9F2] border-[#2D5A5E] shadow-md' 
                    : 'bg-white text-navy/60 border-earth/10 hover:border-earth/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-sand">Contact Phone</label>
          <input 
            className="w-full bg-cream/20 px-6 py-4 rounded-2xl outline-none"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-sand">General Description</label>
          <textarea 
            className="w-full bg-cream/20 px-6 py-4 rounded-2xl outline-none h-32 resize-none"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 bg-cream text-earth rounded-full font-bold">Cancel</button>
          <button type="submit" className="flex-[2] py-4 bg-earth text-cream rounded-full font-black tracking-wide shadow-lg">Save Changes</button>
        </div>
      </form>
    </div>
  );
};
