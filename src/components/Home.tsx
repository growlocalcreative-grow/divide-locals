import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../lib/hooks';

export const Home = () => {
  useEffect(() => {
    document.title = "Divide Locals - The Divide Community Directory";
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl"
      >
        <h1 className="text-6xl md:text-9xl font-black mb-8 leading-[0.85] tracking-tight text-navy">
          Find your <span className="italic font-serif">local</span> people.
        </h1>
        <p className="text-xl md:text-2xl text-navy/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          The Divide Locals directory is a neighborly guide to the businesses and services that make our community thrive.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            to="/directory" 
            className="px-10 py-5 bg-navy text-cream rounded-full text-lg font-black hover:bg-navy/90 transition-all shadow-2xl shadow-navy/30 flex items-center gap-3 active:scale-95"
          >
            <Search size={22} strokeWidth={2.5} />
            <span>Find your Locals</span>
          </Link>
          <Link 
            to="/onboarding" 
            className="px-10 py-5 bg-white border-2 border-navy text-navy rounded-full text-lg font-black hover:bg-navy/5 transition-all flex items-center gap-3 active:scale-95"
          >
            <Plus size={22} strokeWidth={2.5} />
            <span>Add Your Business</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
