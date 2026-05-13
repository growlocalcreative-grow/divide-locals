import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, Filter, Sprout, Store, Share2, Flame, Droplets, Shield, Phone, ArrowRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useDirectory, useAuth } from '../lib/hooks';
import { auth, signInWithGoogle } from '../lib/firebase';
import { Business } from '../types';
import { BusinessCard } from './common/BusinessCard';
import { CategoryIcon } from './common/CategoryIcon';
import { ADMIN_EMAIL, ICON_STROKE, CATEGORIES } from '../constants';

export const DirectoryView = () => {
  useEffect(() => {
    document.title = "Directory | Divide Locals - Find Your Local Neighbors";
  }, []);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    const cat = new URLSearchParams(location.search).get('category');
    if (cat) setSelectedCategory(cat);
  }, [location.search]);

  const { user } = useAuth();
  const { businesses, loading } = useDirectory(selectedCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDivideGrownOnly, setShowDivideGrownOnly] = useState(false);

  const vitals = businesses.filter(b => b.isVital && b.status === 'approved' && b.slug && b.slug !== '');
  const filteredBusinesses = businesses.filter(b => 
    !b.isVital && b.status === 'approved' && b.slug && b.slug !== '' && (showDivideGrownOnly ? b.isDivideGrown : true) && (
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const categories = ['All', ...CATEGORIES];

  return (
    <div className="min-h-screen bg-[#E7D6BF] pb-32">
      {/* 3. Search Bar (Tight below Vitals) */}
      <div className="max-w-2xl mx-auto px-6 pt-2 mb-6">
        <div className="relative group shadow-lg shadow-[#2F3E5B]/5 rounded-2xl overflow-hidden">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2F3E5B]/20 group-focus-within:text-[#2F3E5B] transition-colors" />
          <input 
            type="text"
            placeholder="Search by neighbor or service..."
            className="w-full bg-white px-14 py-4 rounded-2xl border border-white outline-none focus:ring-4 ring-[#2F3E5B]/5 text-base font-serif italic text-[#2F3E5B] placeholder:text-[#2F3E5B]/20 placeholder:font-serif placeholder:italic"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Category Bubble Filters (Horizontal Scroll) */}
      <div className="max-w-7xl mx-auto px-6 mb-4">
        <div className="flex items-center gap-0 overflow-x-auto py-4 scroll-smooth no-scrollbar select-none">
          {/* Divide Grown Integrated Filter */}
          <button
            onClick={() => setShowDivideGrownOnly(!showDivideGrownOnly)}
            className="flex flex-col items-center gap-2.5 shrink-0 group transition-all w-16 mx-2"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
              showDivideGrownOnly 
              ? 'bg-[#C9A24A] text-white border-[#C9A24A] scale-105 shadow-xl' 
              : 'bg-white text-[#C9A24A] border-[#2F3E5B]/5 hover:border-[#C9A24A]/20 hover:scale-105'
            }`}>
              <Sprout size={18} strokeWidth={2.5} className={showDivideGrownOnly ? 'fill-white' : 'fill-[#C9A24A]/10'} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-tighter text-center leading-tight transition-colors line-clamp-2 min-h-[2.2em] flex items-center justify-center w-full ${
              showDivideGrownOnly ? 'text-[#C9A24A]' : 'text-[#2F3E5B]/40'
            }`}>
              Divide Grown
            </span>
          </button>

          <div className="w-[1px] h-8 bg-[#2F3E5B]/10 shrink-0 self-center mx-2" />

            {categories.map((cat, idx) => (
            <button
              key={`${cat}-${idx}`}
              onClick={() => setSelectedCategory(cat)}
              className="flex flex-col items-center gap-2.5 shrink-0 group transition-all w-16 mx-2"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                selectedCategory === cat 
                ? 'bg-[#2F3E5B] text-white border-[#2F3E5B] scale-105 shadow-xl' 
                : 'bg-white text-[#2F3E5B]/40 border-[#2F3E5B]/5 hover:border-[#2F3E5B]/20 hover:scale-105'
              }`}>
                <CategoryIcon 
                  category={cat} 
                  size={18} 
                  className={selectedCategory === cat ? 'text-white' : 'text-[#2F3E5B]/40 group-hover:text-[#2F3E5B]'} 
                />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter text-center leading-tight transition-colors line-clamp-2 min-h-[2.2em] flex items-center justify-center w-full ${
                selectedCategory === cat ? 'text-[#2F3E5B]' : 'text-[#2F3E5B]/40'
              }`}>
                {cat}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Feedback String */}
      <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-serif italic text-[#2F3E5B]">
            {selectedCategory === 'All' 
              ? "Showing all local businesses in the Divide" 
              : `Showing ${selectedCategory} in the Divide`}
            {showDivideGrownOnly && " • Divide Grown"}
          </p>
          {(selectedCategory !== 'All' || showDivideGrownOnly || searchQuery) && (
            <button 
              onClick={() => {
                setSelectedCategory('All');
                setShowDivideGrownOnly(false);
                setSearchQuery('');
              }}
              className="flex items-center gap-1 px-2 py-1 bg-[#2F3E5B]/5 hover:bg-[#2F3E5B]/10 text-[#2F3E5B]/60 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors group"
            >
              <X size={10} className="group-hover:rotate-90 transition-transform" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[4/3] bg-white/40 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-32 px-6 bg-white/20 rounded-[40px] border-4 border-dashed border-white/40">
            <Store size={64} className="mx-auto mb-6 text-[#2F3E5B]/10" />
            <h2 className="text-4xl font-serif font-black text-[#2F3E5B] mb-4 italic">No neighbors found yet.</h2>
            <p className="text-[#7A4A2E]/60 mb-12 max-w-md mx-auto italic font-serif">
              {searchQuery ? `We couldn't find any neighbors matching "${searchQuery}".` : `Be the one to start this section of the directory!`}
            </p>
            <Link 
              to="/onboarding" 
              className="inline-block px-12 py-5 bg-[#2F3E5B] text-white rounded-full font-black uppercase tracking-widest text-xs shadow-2xl shadow-[#2F3E5B]/40 hover:scale-105 transition-all"
            >
              Add Your Business
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredBusinesses.map((b) => (
                <BusinessCard 
                  key={`biz-${b.id}`} 
                  business={b} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Admin Quick Entry */}
        {auth.currentUser?.email === ADMIN_EMAIL && (
          <div className="mt-32 flex justify-center">
            <Link 
              to="/admin" 
              className="flex items-center gap-3 group px-8 py-4 bg-[#2F3E5B] text-white rounded-[24px] shadow-2xl shadow-[#2F3E5B]/40 hover:scale-105 transition-all"
            >
              <Shield size={20} />
              <span className="font-black uppercase tracking-[0.2em] text-xs">Admin Control</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
