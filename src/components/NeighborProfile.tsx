import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Heart, 
  MessageSquare, 
  Phone,
  Calendar, 
  ArrowLeft,
  Store,
  Home,
  Trees,
  Sprout,
  Star as StarIcon,
  EyeOff,
  Settings,
  XCircle,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, useNeighborProfile, useUserReviews, useBusinesses, updateProfile } from '../lib/hooks';
import { Business, NeighborProfile as ProfileType } from '../types';
import { getRawPhone } from '../utils';
import { BusinessCard } from './common/BusinessCard';
import { BusinessDetailPopup } from './common/BusinessDetailPopup';
import { BrandLogo } from './common/BrandLogo';
import { ICON_STROKE } from '../constants';

export const NeighborProfile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useNeighborProfile(user?.uid);
  const { reviews } = useUserReviews(user?.uid);
  const { businesses } = useBusinesses();
  
  const [selectedDetailBusiness, setSelectedDetailBusiness] = useState<Business | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    displayName: '',
    residentSince: '',
    bio: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/directory');
    }
    if (user) {
      document.title = `My Profile | Divide Locals`;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setEditFormData({
        displayName: profile.displayName || user?.displayName || '',
        residentSince: profile.residentSince || '',
        bio: profile.bio || ''
      });
    }
  }, [profile, user]);

  if (authLoading || profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-4 border-earth/10 border-t-earth rounded-full animate-spin" />
      </div>
    );
  }

  const favoriteBusinesses = businesses.filter(b => profile?.favorites?.includes(b.id || ''));
  
  const getNeighborSinceDisplay = () => {
    if (profile?.residentSince) {
      const [year, month] = profile.residentSince.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (profile?.createdAt) {
      const date = new Date(profile.createdAt.seconds * 1000);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    // Default to current month/year for new users if everything else is missing
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const residentSinceDisplay = getNeighborSinceDisplay();

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(user.uid, {
        displayName: editFormData.displayName,
        residentSince: editFormData.residentSince,
        bio: editFormData.bio
      });
      setIsEditModalOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert("Failed to save profile: " + (err.code || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-24 overflow-x-hidden">
      <BusinessDetailPopup business={selectedDetailBusiness} onClose={() => setSelectedDetailBusiness(null)} />
      
      {/* Sticky Profile Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-earth/5 py-3 px-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/directory')}
              className="w-11 h-11 rounded-full bg-navy/5 flex items-center justify-center text-navy/40 hover:bg-navy hover:text-white transition-all shadow-sm border border-navy/5 active:scale-90"
              aria-label="Back to Directory"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-xl font-serif font-black text-navy italic tracking-tight">Neighbor Profile</h2>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-11 h-11 rounded-full bg-navy/5 flex items-center justify-center text-navy/40 hover:bg-navy hover:text-white transition-all shadow-sm border border-navy/5 active:scale-90"
              aria-label="Edit Profile"
            >
              <Settings size={18} />
            </button>
            <Link 
              to="/onboarding" 
              className="px-4 py-2 bg-navy text-cream rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-navy/90 transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              Add Business
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 mt-8 flex flex-col gap-10">
        {/* Identity Section: Vertical Stack */}
        <section className="bg-white p-8 rounded-[48px] border border-earth/10 shadow-xl flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-sand/10 p-1 bg-cream shadow-inner">
              <img 
                src={user?.photoURL || null} 
                alt={user?.displayName || ''} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <Heart size={14} className="fill-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-black text-navy italic leading-tight">{profile?.displayName || user?.displayName}</h3>
            <div className="flex flex-col items-center">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-sand break-all leading-tight">{user?.email}</p>
              <p className="text-xs font-black text-navy/40 uppercase tracking-widest mt-2 italic">
                Neighbor since {residentSinceDisplay}
              </p>
              {profile?.bio ? (
                <p className="mt-4 text-sm text-navy/70 leading-relaxed max-w-[280px] italic">
                  "{profile.bio}"
                </p>
              ) : (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="mt-4 text-[10px] font-black uppercase tracking-widest text-earth/40 hover:text-earth transition-colors"
                >
                  Add a bio to let neighbors know a bit about you
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-4 border-t border-earth/5 w-full">
            <div className="text-center flex-1">
              <p className="text-[9px] uppercase tracking-widest font-black text-navy/30">Favorites</p>
              <p className="text-lg font-serif font-black italic">{favoriteBusinesses.length}</p>
            </div>
            <div className="w-px h-6 bg-earth/5" />
            <div className="text-center flex-1">
              <p className="text-[9px] uppercase tracking-widest font-black text-navy/30">Reviews</p>
              <p className="text-lg font-serif font-black italic">{reviews.length}</p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <div className="space-y-12">
          {/* Favorites Section: Tight Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-earth/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Heart size={16} className="fill-red-500" />
                </div>
                <h3 className="text-xl font-serif font-black text-navy italic">My Favorites</h3>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#B2AC88]">{favoriteBusinesses.length} Saved</span>
            </div>

            {favoriteBusinesses.length > 0 ? (
              <div className="flex flex-col gap-3">
                {favoriteBusinesses.map((b, idx) => (
                  <motion.div
                    key={b.id || `fav-${idx}`}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDetailBusiness(b)}
                    className="bg-white rounded-3xl border border-earth/5 shadow-sm overflow-hidden flex items-center group cursor-pointer p-3 gap-4"
                  >
                    <div className="w-20 h-20 relative overflow-hidden bg-earth/5 rounded-2xl shrink-0">
                      <BrandLogo business={b} size="md" className="w-full h-full rounded-none shadow-none border-none" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <h4 className="text-[13px] font-serif font-black text-navy italic truncate leading-tight group-hover:text-earth transition-colors">{b.name}</h4>
                      <div className="flex items-center gap-1.5">
                        <StarIcon size={8} className="fill-gold text-gold" />
                        <span className="text-[9px] font-black uppercase text-sand leading-none tracking-wider">{b.category}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 opacity-60">
                        {b.isResidentOwned && <Home size={10} className="text-navy" />}
                        {b.isDivideGrown && <Sprout size={10} className="text-earth" />}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 pr-1">
                       {(b.contact?.phone || b.contact?.textPhone) && (
                        <div className="flex items-center gap-1.5">
                          {b.contact?.phone && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `tel:${getRawPhone(b.contact.phone)}`;
                              }}
                              className="w-8 h-8 rounded-full bg-navy/5 text-navy flex items-center justify-center transition-all hover:bg-navy hover:text-white"
                            >
                              <Phone size={12} />
                            </div>
                          )}
                          {b.contact?.textPhone && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `sms:${getRawPhone(b.contact.textPhone)}`;
                              }}
                              className="w-8 h-8 rounded-full bg-navy/5 text-navy flex items-center justify-center transition-all hover:bg-navy hover:text-white"
                            >
                              <MessageSquare size={12} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-6 bg-white rounded-[32px] border border-dashed border-earth/20 text-center shadow-inner">
                <Store size={32} className="mx-auto mb-4 text-earth/20" />
                <p className="text-sm text-navy/60 italic font-serif">No hearted neighbors yet.</p>
                <Link 
                  to="/directory" 
                  className="mt-6 inline-block px-6 py-2 bg-navy text-cream rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95"
                >
                  Explore Directory
                </Link>
              </div>
            )}
          </section>

          {/* Edit Profile Modal */}
          <AnimatePresence>
            {isEditModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute inset-0 bg-[#2F3E5B]/90 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 10 }}
                  className="relative w-full max-w-md bg-[#FDFBF7] rounded-[40px] shadow-2xl p-8"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-serif font-black italic text-[#2F3E5B]">Edit Profile</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A24A]">Profile Customization</p>
                    </div>
                    <button 
                      onClick={() => setIsEditModalOpen(false)}
                      className="w-10 h-10 rounded-full bg-[#2F3E5B]/5 flex items-center justify-center text-[#2F3E5B]/40 hover:bg-[#2F3E5B]/10 transition-all"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#2F3E5B]">Display Name</label>
                      <input 
                        type="text"
                        placeholder="How you appear on your profile..."
                        value={editFormData.displayName}
                        onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                        className="w-full bg-[#F5E6D3] border border-[#2F3E5B]/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#C9A24A] transition-all font-bold text-[#2F3E5B]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#2F3E5B]">Neighbor Bio</label>
                      <textarea 
                        placeholder="Tell the community a bit about yourself..."
                        value={editFormData.bio}
                        onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                        className="w-full bg-[#F5E6D3] border border-[#2F3E5B]/10 rounded-3xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#C9A24A] transition-all font-bold text-[#2F3E5B] h-32 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#2F3E5B]">Moved to the Divide</label>
                      <input 
                        type="month"
                        value={editFormData.residentSince}
                        onChange={(e) => setEditFormData({ ...editFormData, residentSince: e.target.value })}
                        className="w-full bg-[#F5E6D3] border border-[#2F3E5B]/10 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 ring-[#C9A24A] transition-all font-bold text-[#2F3E5B]"
                      />
                      <p className="text-[9px] text-[#2F3E5B]/40 italic">This date will appear on your public profile card.</p>
                    </div>

                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-6 py-4 bg-white border border-[#2F3E5B]/10 text-[#2F3E5B] rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-[#2F3E5B]/5 transition-all"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={isSaving}
                        className={`px-6 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                          isSaving 
                          ? 'bg-[#2F3E5B]/50 text-[#E7D6BF] cursor-not-allowed' 
                          : 'bg-[#2F3E5B] text-[#E7D6BF] hover:bg-[#2F3E5B]/90'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3 h-3 border-2 border-[#E7D6BF]/20 border-t-[#E7D6BF] rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Toast Notification */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] px-8 py-4 bg-[#3E5B42] text-[#E7D6BF] rounded-full shadow-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 border border-[#E7D6BF]/20"
              >
                <div className="w-5 h-5 bg-[#E7D6BF] rounded-full flex items-center justify-center text-[#3E5B42]">
                  <ShieldCheck size={10} />
                </div>
                Profile Saved!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews Section: Mobile Optimized Typography */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-earth/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-navy/5 text-navy rounded-xl flex items-center justify-center shadow-sm">
                  <MessageSquare size={16} strokeWidth={ICON_STROKE} />
                </div>
                <h3 className="text-xl font-serif font-black text-navy italic">My Reviews</h3>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#B2AC88]">{reviews.length} Total</span>
            </div>

            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map(r => (
                  <div key={r.id} className="bg-white p-6 rounded-[32px] border border-earth/5 shadow-sm space-y-3 relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Link to={`/business/${businesses.find(b => b.id === r.businessId)?.slug || ''}`} className="text-base font-serif font-black text-navy hover:text-earth transition-colors italic leading-tight">
                          {r.businessName}
                        </Link>
                        {r.status === 'hidden' && (
                          <div className="flex items-center gap-1.5 py-1 px-2.5 bg-[#2F3E5B] text-[#E7D6BF] rounded-full w-fit">
                            <EyeOff size={10} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Under Moderation</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="flex text-gold">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon 
                                key={i} 
                                size={10} 
                                className={i < r.rating ? "fill-gold text-gold" : "text-earth/10"} 
                              />
                            ))}
                          </div>
                          <span className="text-[8px] uppercase tracking-widest font-black text-navy/30">
                             {r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-navy/80 leading-[1.6] font-medium italic relative z-10 bg-cream/30 p-4 rounded-2xl border border-earth/5">
                      "{r.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-12 px-6 bg-white rounded-[32px] border border-dashed border-earth/20 text-center shadow-inner">
                  <MessageSquare size={32} className="mx-auto mb-4 text-earth/20" />
                  <p className="text-sm text-navy/60 italic font-serif">No reviews shared yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
