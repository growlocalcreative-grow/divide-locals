import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sprout, CheckCircle, Mail, RotateCcw, Leaf, Handshake, Home, Wand2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useAuth, addBusiness } from '../lib/hooks';
import { signInWithGoogle } from '../lib/firebase';
import { CategoryIcon } from './common/CategoryIcon';
import { generateBusinessStory, generateHeroImage } from '../services/geminiService';
import { 
  CATEGORIES, 
  CATEGORY_SUBCATEGORIES, 
  DIVIDE_COMMUNITIES,
  CATEGORY_HEROES,
  CATEGORY_ICON_NAMES
} from '../constants';
import { formatPhoneNumber } from '../utils';

// Helper for App.tsx originally had CATEGORIES list locally
// Using CATEGORIES from constants now

export const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    category: 'Home & Property',
    description: '',
    phone: '',
    textPhone: '',
    email: '',
    website: '',
    businessAddress: '',
    privateHomeZip: '',
    serviceAreas: [] as string[],
    tags: [] as string[],
    isVital: false,
    isDivideGrown: false,
    preferredContact: 'call' as 'call' | 'text',
    isEmergencySupport: false,
    heroUrl: ''
  });

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionPhase, setSubmissionPhase] = useState<'idle' | 'verifying' | 'sending'>('idle');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const firstInputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    // Dismiss keyboard/blur focus before transition
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Scroll to top on step change
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Auto focus first input
    const timeout = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 400); // Small delay to account for motion transitions and potential keyboard dismissal
    
    return () => clearTimeout(timeout);
  }, [step]);

  useEffect(() => {
    document.title = "Add Your Business | Divide Locals";
    const saved = localStorage.getItem('divide_onboarding_draft');
    if (saved) {
      try { setFormData(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    localStorage.setItem('divide_onboarding_draft', JSON.stringify(formData));
    await new Promise(r => setTimeout(r, 800));
    setIsSavingDraft(false);
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await signInWithGoogle();
      return;
    }
    
    if (formData.phone.replace(/\D/g, '').length < 10) {
      alert("Please enter a full 10-digit phone number!");
      setStep(4);
      return;
    }

    setIsSubmitting(true);
    setSubmissionPhase('sending');
    
    try {
      let finalDescription = formData.description;
      let isAiGenerated = false;

      if (!finalDescription.trim()) {
        setSubmissionPhase('verifying');
        const story = await generateBusinessStory({
          name: formData.name,
          category: formData.category,
          tags: formData.tags,
          isDivideGrown: formData.isDivideGrown
        });
        if (story) {
          finalDescription = story;
          isAiGenerated = true;
        }
      }

      const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
      await addBusiness({
        ...formData,
        isResidentOwned: false,
        isEcoFriendly: false,
        isCommunityPartner: false,
        heroUrl: formData.heroUrl || CATEGORY_HEROES[formData.category] || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
        logoIconName: CATEGORY_ICON_NAMES[formData.category],
        contact: {
          email: formData.email,
          phone: formData.phone,
          textPhone: formData.textPhone,
          website: formData.website,
          businessAddress: formData.businessAddress
        },
        slug,
        description: finalDescription,
        isAiGenerated,
        status: 'pending'
      });
      setIsSuccess(true);
      localStorage.removeItem('divide_onboarding_draft');
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.code || err.message));
    } finally {
      setIsSubmitting(false);
      setSubmissionPhase('idle');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 bg-sage rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl">
            <CheckCircle size={48} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-black text-earth mb-4">You're on the map!</h1>
            <p className="text-[#2F3E5B]/60 italic leading-relaxed px-4">
              Welcome to the neighborhood! Your entry is being reviewed by the Divide Locals Admin. We'll be in touch soon!
            </p>
          </div>
          <button onClick={() => navigate('/directory')} className="w-full py-5 bg-earth text-cream rounded-full font-black uppercase tracking-widest hover:bg-earth/90 transition-all shadow-xl">
            Back to Directory
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-20">
       <div className="mb-12 text-center">
        <div className="w-16 h-1 bg-earth/10 mx-auto rounded-full mb-8 flex overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
            className="bg-earth transition-all duration-500"
          />
        </div>
        <h1 className="text-4xl font-bold font-serif mb-2 text-earth">Grow your local reach.</h1>
        <p className="text-navy/60 italic">Join the Divide Locals neighborhood directory.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] shadow-2xl border border-earth/5 space-y-8">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-xl font-bold font-serif border-b border-earth/10 pb-4">1. The Basics</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Business Name</label>
                <input 
                  ref={firstInputRef as any}
                  required
                  placeholder="e.g. Divide General Store"
                  className="w-full bg-[#F5E6D3] text-[#2F3E5B] px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-[#C9A24A] transition-all font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Owner Name</label>
                <input 
                  required
                  placeholder="e.g., Jane Doe"
                  className="w-full bg-[#F5E6D3] text-[#2F3E5B] px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-[#C9A24A] transition-all font-medium"
                  value={formData.ownerName}
                  onChange={e => setFormData({...formData, ownerName: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-sand">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c, idx) => (
                    <button
                      key={`${c}-${idx}`}
                      type="button"
                      onClick={() => setFormData({...formData, category: c, tags: []})}
                      disabled={isSubmitting}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                        formData.category === c
                        ? 'bg-earth text-cream border-earth shadow-lg'
                        : 'bg-white text-navy/40 border-earth/10 hover:border-earth/30'
                      }`}
                    >
                      <CategoryIcon category={c} size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-tight">{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              {CATEGORY_SUBCATEGORIES[formData.category] && (
                <div className="space-y-3 pt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-sand">What We Do (Subcategories)</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_SUBCATEGORIES[formData.category].map((tag, idx) => (
                      <button
                        key={`${tag}-${idx}`}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        disabled={isSubmitting}
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

              {/* 1.5 Business Type - Divide Grown Section */}
              <div className="pt-4 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-sand">Business Type</label>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isDivideGrown: !formData.isDivideGrown})}
                  className={`w-full p-6 rounded-[32px] border-2 transition-all flex items-center justify-between group ${
                    formData.isDivideGrown 
                    ? 'bg-sage/10 border-sage' 
                    : 'bg-white border-earth/5 hover:border-earth/20'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      formData.isDivideGrown ? 'bg-sage text-white' : 'bg-earth/5 text-earth/20'
                    }`}>
                      <Sprout size={24} className={formData.isDivideGrown ? 'fill-white' : ''} />
                    </div>
                    <div>
                      <p className="font-bold text-earth leading-tight">Divide Grown / Harvested?</p>
                      <p className="text-[10px] text-navy/40 font-medium font-sans">Locally grown, raised, or crafted products.</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => {
                // Initialize default hero if not set
                if (!formData.heroUrl) {
                  setFormData(prev => ({ ...prev, heroUrl: CATEGORY_HEROES[prev.category] || '' }));
                }
                setStep(2);
              }}
              className="w-full py-4 bg-earth text-cream rounded-full font-black tracking-widest hover:bg-earth/90 transition-all shadow-xl shadow-earth/20"
            >
              Next Step
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-xl font-bold font-serif border-b border-earth/10 pb-4">2. The Details</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-sand">General Description</label>
                <textarea 
                  ref={firstInputRef as any}
                  required
                  placeholder="Tell neighbors what you offer..."
                  className="w-full bg-cream/20 px-6 py-4 rounded-2xl outline-none h-32 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-sand">Service Areas</label>
                <div className="flex flex-wrap gap-2">
                  {DIVIDE_COMMUNITIES.map((area, idx) => (
                    <button
                      key={`${area}-${idx}`}
                      type="button"
                      onClick={() => {
                        const next = formData.serviceAreas.includes(area)
                          ? formData.serviceAreas.filter(a => a !== area)
                          : [...formData.serviceAreas, area];
                        setFormData({...formData, serviceAreas: next});
                      }}
                      disabled={isSubmitting}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        formData.serviceAreas.includes(area) 
                        ? 'bg-[#2D5A5E] text-[#FCF9F2] border-[#2D5A5E] shadow-md' 
                        : 'bg-white text-navy/60 border-earth/10 hover:border-earth/20'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-cream text-earth rounded-full font-bold">Back</button>
              <button type="button" onClick={() => setStep(3)} className="flex-[2] py-4 bg-earth text-cream rounded-full font-black tracking-widest shadow-lg">Next Step</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h3 className="text-xl font-bold font-serif border-b border-earth/10 pb-4">3. Visuals</h3>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Profile Hero Image</label>
                
                <div className="relative rounded-[32px] overflow-hidden aspect-video bg-[#F5E6D3] border-4 border-white shadow-xl group">
                  <img 
                    src={formData.heroUrl || CATEGORY_HEROES[formData.category] || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e'} 
                    alt="Hero Preview" 
                    className={`w-full h-full object-cover transition-transform duration-700 ${isGeneratingImage ? 'scale-110 blur-sm brightness-75' : 'group-hover:scale-105'}`}
                  />
                  
                  {isGeneratingImage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-earth/40 backdrop-blur-[2px]">
                      <Sparkles size={32} className="animate-pulse mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">AI Magic Station...</p>
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsGeneratingImage(true);
                        const newUrl = await generateHeroImage({ name: formData.name, category: formData.category });
                        if (newUrl) setFormData(prev => ({ ...prev, heroUrl: newUrl }));
                        setIsGeneratingImage(false);
                      }}
                      disabled={isGeneratingImage}
                      className="flex items-center gap-2 px-6 py-3 bg-[#C9A24A] text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Wand2 size={14} />
                      Regenerate AI
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-earth/5 rounded-[32px] border border-earth/10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-earth/40 shadow-sm shrink-0">
                      <ImageIcon size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-earth leading-tight mb-1">Mountain Modern Aesthetic</p>
                      <p className="text-[10px] text-[#2F3E5B]/60 italic font-medium font-sans">
                        Our AI generates images following a Sierra-inspired vibe of organic textures, Earth-tones, and clean lines.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7A4A2E]">Manual Overlay URL (Optional)</label>
                <input 
                  type="url"
                  placeholder="Paste a custom Unsplash link..."
                  className="w-full bg-[#F5E6D3] text-[#2F3E5B] px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-[#C9A24A] transition-all font-medium"
                  value={formData.heroUrl}
                  onChange={e => setFormData({...formData, heroUrl: e.target.value})}
                  disabled={isSubmitting || isGeneratingImage}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 bg-cream text-earth rounded-full font-bold">Back</button>
              <button type="button" onClick={() => setStep(4)} className="flex-[2] py-4 bg-earth text-cream rounded-full font-black tracking-widest shadow-lg">Next Step</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-xl font-bold font-serif border-b border-earth/10 pb-4">4. Final Connection</h3>
            <div className="space-y-4">
               <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-sand">Phone Number</label>
                <input 
                  ref={firstInputRef as any}
                  required
                  placeholder="(530) 000-0000"
                  className="w-full bg-cream/20 px-6 py-4 rounded-2xl outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                  disabled={isSubmitting}
                />
              </div>

               <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-sand">Text/SMS Number (Optional)</label>
                <input 
                  placeholder="(530) 000-0000"
                  className="w-full bg-cream/20 px-6 py-4 rounded-2xl outline-none"
                  value={formData.textPhone}
                  onChange={e => setFormData({...formData, textPhone: formatPhoneNumber(e.target.value)})}
                  disabled={isSubmitting}
                />
              </div>

               <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-sand text-uppercase">Preferred Contact Method</label>
                <div className="flex bg-cream/20 p-1 rounded-2xl gap-1">
                  {(['call', 'text'] as const).map(method => (
                    <button
                        key={method}
                      type="button"
                      onClick={() => setFormData({...formData, preferredContact: method})}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                        formData.preferredContact === method 
                        ? 'bg-earth text-cream shadow-md' 
                        : 'text-navy/40 hover:text-navy/60'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-red-50 rounded-[32px] border border-red-100 space-y-2">
                <label className="flex items-start gap-4 cursor-pointer">
                  <div className="pt-1">
                    <input 
                      type="checkbox"
                      checked={formData.isEmergencySupport}
                      onChange={e => setFormData({...formData, isEmergencySupport: e.target.checked})}
                      className="w-5 h-5 accent-red-600 rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-900">Offers 24/7 Emergency Support</p>
                    <p className="text-[10px] text-red-700/60 leading-relaxed font-sans">
                      Check if available for after-hours emergency calls.
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-sand">Business Link (Website)</label>
                <input 
                  className="w-full bg-cream/20 px-6 py-4 rounded-2xl outline-none"
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  disabled={isSubmitting}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-sand">Mailing / Shop Address</label>
                <input 
                  required
                  className="w-full bg-cream/20 px-6 py-4 rounded-2xl outline-none"
                  value={formData.businessAddress}
                  onChange={e => setFormData({...formData, businessAddress: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-sand">Divide Resident Zip Code</label>
                <input 
                  required
                  className="w-full bg-cream/20 px-6 py-4 rounded-2xl outline-none"
                  value={formData.privateHomeZip}
                  onChange={e => setFormData({...formData, privateHomeZip: e.target.value})}
                  disabled={isSubmitting}
                  placeholder="5-digit zip for verification"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-8">
               <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-cream text-earth rounded-full font-bold"
                  disabled={isSubmitting || isSavingDraft}
                >
                  Back
                </button>
                <button 
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting || isSavingDraft}
                  className="flex-1 py-4 bg-white text-[#2D5A5E] border-2 border-[#2D5A5E]/10 rounded-full font-bold hover:bg-[#2D5A5E]/5 transition-all flex items-center justify-center gap-2"
                >
                  {isSavingDraft ? <RotateCcw size={18} className="animate-spin" /> : <Mail size={18} />}
                  <span>{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
                </button>
               </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-gold text-white rounded-full font-black tracking-widest uppercase shadow-xl hover:bg-gold/90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{submissionPhase === 'verifying' ? 'Verifying...' : 'Submitting...'}</span>
                  </div>
                ) : (
                  !user ? 'Sign In & Verify' : 'Verify'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
};
