import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { VitalsRow, VitalsPopup } from './components/common/VitalsView';
import { Home } from './components/Home';
import { DirectoryView } from './components/DirectoryView';
import { NeighborProfile } from './components/NeighborProfile';
import { AdminPortal } from './components/AdminPortal';
import { BusinessProfile, BusinessEdit } from './components/BusinessProfile';
import { Onboarding } from './components/Onboarding';
import { AboutPage, ContactPage, PrivacyPage, TermsPage, SupportPage } from './components/OtherPages';
import { Link } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

export default function App() {
  const [activeVital, setActiveVital] = useState<string | null>(null);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#E7D6BF]">
        <Navbar />
        
        {/* Vitals Section - Always visible but centered */}
        <div className="max-w-7xl mx-auto px-4 w-full overflow-hidden">
          <VitalsRow onSelectCategory={setActiveVital} />
          <VitalsPopup category={activeVital} onClose={() => setActiveVital(null)} />
        </div>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/directory" element={<DirectoryView />} />
            <Route path="/profile" element={<NeighborProfile />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/business/:slug" element={<BusinessProfile />} />
            <Route path="/business/edit/:slug" element={<BusinessEdit />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/support-divide-locals" element={<SupportPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </main>

        <footer className="bg-earth py-20 text-cream border-t border-[#B2AC88]/30 mt-20">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16 text-left">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-serif text-cream italic">Divide Locals</h2>
              <p className="text-[12px] opacity-70 leading-relaxed max-w-[240px]">
                Built with neighborly love by Grow Local Creative in the Divide.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Explore</span>
              <div className="flex flex-col gap-5 text-sm font-black uppercase tracking-widest text-[#F5F5DC] italic">
                <Link to="/directory" className="hover:text-cream transition-all text-left">Directory</Link>
                <Link to="/about" className="hover:text-cream transition-all text-left">About the Project</Link>
                <Link to="/onboarding" className="hover:text-cream transition-all text-left">Add Your Business</Link>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#B2AC88]">Connect & Support</span>
              <div className="flex flex-col gap-5 text-sm font-black uppercase tracking-widest text-[#F5F5DC] italic">
                <Link to="/contact" className="hover:text-cream transition-all text-left">Contact Renee</Link>
                <a href="mailto:growlocalcreative@gmail.com" className="hover:text-cream transition-all text-left">Email Support</a>
                <div className="flex gap-4 pt-2">
                  <Link to="/terms" className="hover:text-cream transition-all text-left uppercase text-[10px]">Terms</Link>
                  <Link to="/privacy" className="hover:text-cream transition-all text-left uppercase text-[10px]">Privacy</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
