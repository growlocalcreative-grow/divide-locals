import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Store,
  Plus, 
  LayoutDashboard, 
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
  Heart,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useBusinesses, useNeighborProfile } from '../../lib/hooks';
import { auth, signInWithGoogle } from '../../lib/firebase';
import { ADMIN_EMAIL, ICON_STROKE } from '../../constants';

export const Navbar = () => {
  const { user } = useAuth();
  const { profile } = useNeighborProfile(user?.uid);
  const { businesses } = useBusinesses();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.isAdmin;
  const userBusiness = user ? businesses.find(b => b.ownerId === user.uid) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    setIsMenuOpen(false);
    navigate('/directory');
    // Brief notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-earth text-cream px-8 py-4 rounded-full shadow-2xl z-[100] font-bold text-sm animate-bounce';
    toast.innerText = 'See you later, neighbor!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };
  
  return (
    <>
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-earth/5 py-2">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-cream shadow-lg">
              <Store size={22} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-serif font-black italic text-navy tracking-tight">Divide Locals</span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/directory" className="hidden md:block text-sm font-medium hover:text-earth transition-colors">Directory</Link>
            <Link 
              to="/onboarding" 
              className="hidden sm:flex px-4 py-2 bg-gold text-white rounded-full text-xs font-bold hover:bg-gold/90 transition-all shadow-md items-center gap-2 active:scale-95"
            >
              <Plus size={14} strokeWidth={ICON_STROKE} />
              <span>Add Business</span>
            </Link>
            {user ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-3 bg-earth/5 hover:bg-earth/10 rounded-full transition-all group border border-earth/10"
                >
                  <span className="text-xs font-bold text-earth hidden sm:block">
                    {user.displayName?.split(' ')[0] || 'Neighbor'}
                  </span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-sand shadow-sm">
                    <img src={user.photoURL || null} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  </div>
                  <ChevronDown size={14} className={`text-earth/40 group-hover:text-earth transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-[#FCF9F2] rounded-[32px] shadow-2xl border-2 border-sage/20 py-4 z-50 overflow-hidden"
                    >
                      <div className="px-6 py-4 border-b border-earth/5">
                        <p className="text-xs font-bold text-earth line-clamp-1">{user.displayName}</p>
                        <p className="text-[10px] text-navy/40 font-medium truncate">{user.email}</p>
                      </div>

                      <div className="p-2">
                        <Link 
                          to="/profile" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-earth hover:bg-sage/10 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                            <Heart size={18} strokeWidth={2.5} className="fill-red-500" />
                          </div>
                          My Profile
                        </Link>

                        {isAdmin && (
                          <Link 
                            to="/admin" 
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-navy hover:bg-[#2D5A5E]/10 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#2D5A5E]/10 flex items-center justify-center text-[#2D5A5E]">
                              <LayoutDashboard size={18} strokeWidth={2.5} />
                            </div>
                            Admin Portal
                          </Link>
                        )}
                        
                        {userBusiness && (
                          <Link 
                            to={`/business/${userBusiness.slug}`} 
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-earth hover:bg-sage/10 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center text-sage">
                              <LayoutDashboard size={18} strokeWidth={2.5} />
                            </div>
                            Manage My Listing
                          </Link>
                        )}

                        <button 
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                            <LogOut size={18} strokeWidth={2.5} />
                          </div>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="px-4 py-2 bg-earth text-cream rounded-full text-sm font-medium hover:bg-earth/90 transition-all shadow-lg shadow-earth/20 flex items-center gap-2"
              >
                <UserIcon size={16} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};
