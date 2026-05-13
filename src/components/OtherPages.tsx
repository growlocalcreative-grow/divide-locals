import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Mail, Facebook, Heart, ChevronRight, Trees } from 'lucide-react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';

export const PrivacyPage = () => {
  useEffect(() => {
    document.title = "Privacy Policy | Divide Locals";
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 md:py-32">
      <h1 className="text-4xl md:text-6xl font-serif font-black text-[#1B2A1D] mb-8">Privacy Policy</h1>
      <div className="bg-white/50 backdrop-blur-sm p-8 md:p-12 rounded-[40px] border border-earth/10">
        <p className="text-xl text-[#1B2A1D]/80 leading-relaxed font-medium">
          We value your privacy as much as our own. Your data is used only to power this directory and is never sold to third parties.
        </p>
      </div>
    </div>
  );
};

export const TermsPage = () => {
  useEffect(() => {
    document.title = "Terms of Service | Divide Locals";
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 md:py-32">
      <h1 className="text-4xl md:text-6xl font-serif font-black text-[#1B2A1D] mb-8">Terms of Service</h1>
      <div className="bg-white/50 backdrop-blur-sm p-8 md:p-12 rounded-[40px] border border-earth/10">
        <p className="text-xl text-[#1B2A1D]/80 leading-relaxed font-medium">
          By using Divide Locals, you agree to keep things neighborly. We reserve the right to remove listings that don't align with our community spirit.
        </p>
      </div>
    </div>
  );
};

export const AboutPage = () => {
  useEffect(() => {
    document.title = "About | Divide Locals";
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 md:py-32 text-[#1B2A1D]">
      <h1 className="text-4xl md:text-6xl font-serif font-black mb-12 leading-tight">Supporting the Heart of the Divide</h1>
      
      <div className="flex flex-col gap-16">
        <section>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth mb-6">What We Do</h2>
          <p className="text-lg opacity-80 leading-relaxed mb-6">
            Divide Locals is a free, neighborly guide built specifically for the communities along the Sierra Nevada Divide; including <strong>Georgetown, Garden Valley, Cool, Pilot Hill, Coloma, Lotus, and the surrounding foothills</strong>. Our goal is simple: to make it easy for residents and visitors to discover and support the talented local businesses that make this region thrive.
          </p>
          <p className="text-lg opacity-80 leading-relaxed">
            From essential trades and ranch services to boutique shops and creators, you’ll find genuine, vetted listings here. Every entry is reviewed and approved by a real person to ensure quality for our neighbors.
          </p>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth mb-6">Who It’s For</h2>
          <p className="text-lg opacity-80 leading-relaxed mb-6">
            This directory is for the entire foothills community. Whether you’re a long-time resident looking for a trusted handyman, a newcomer searching for a reliable veterinarian, or a weekend visitor looking for a local café, this is your guide.
          </p>
        </section>

        <section className="bg-[#F5F5DC]/40 p-8 md:p-12 rounded-[40px] border border-gold/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trees size={80} className="text-earth" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth mb-6">The Heart Behind the Project</h2>
          <p className="text-lg opacity-80 leading-relaxed mb-6">
            Divide Locals is created and maintained by <a href="https://growlocalcreative.com" target="_blank" rel="noopener noreferrer" className="text-earth font-bold hover:underline">Grow Local Creative</a>. My heart is for the maker, the volunteer, and the small business owner right here in the Divide.
          </p>
          <div className="flex items-center gap-4 border-t border-earth/10 pt-8">
            <div className="w-14 h-14 bg-earth rounded-full flex items-center justify-center text-cream font-serif italic text-xl font-bold">RG</div>
            <div>
              <p className="font-serif font-bold text-xl text-earth">Renee Gaw</p>
              <p className="text-xs uppercase tracking-[0.2em] font-black text-[#B2AC88]">Founder, Grow Local Creative</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export const ContactPage = () => {
  useEffect(() => {
    document.title = "Contact | Divide Locals";
  }, []);

  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.current) return;

    setIsSending(true);
    
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setTimeout(() => {
        setStatus("Message sent! (Simulated).");
        setIsSending(false);
        if (form.current) form.current.reset();
      }, 1500);
      return;
    }

    emailjs.sendForm(serviceId, templateId, form.current, publicKey)
      .then(() => {
          setStatus("Message sent! We'll get back to you soon.");
          setIsSending(false);
          if (form.current) form.current.reset();
      }, (error) => {
          console.error(error.text);
          setStatus("Something went wrong. Please try emailing us directly.");
          setIsSending(false);
      });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 md:py-32 text-[#1B2A1D]">
      <h1 className="text-4xl md:text-6xl font-serif font-black mb-8">Contact Us</h1>
      <div className="bg-white/50 backdrop-blur-sm p-8 md:p-12 rounded-[40px] border border-earth/10">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
          <div className="flex-1">
            <p className="text-xl opacity-80 mb-6 leading-relaxed">
              Reach out to Renee at Grow Local Creative—we'd love to help you get listed.
            </p>
            <div className="flex flex-col gap-4">
              <a href="mailto:growlocalcreative@gmail.com" className="text-earth font-bold hover:underline flex items-center gap-2">
                <Mail size={18} />
                growlocalcreative@gmail.com
              </a>
              <a href="https://facebook.com/growlocalcreative" target="_blank" rel="noopener noreferrer" className="text-earth font-bold hover:underline flex items-center gap-2">
                <Facebook size={18} />
                Facebook
              </a>
            </div>
          </div>
          <div className="flex-1">
            <form ref={form} onSubmit={handleSubmit} className="flex flex-col gap-6">
              <input type="text" name="user_name" required placeholder="Your Name" className="bg-white px-4 py-3 rounded-xl border border-earth/10 outline-none" />
              <input type="email" name="user_email" required placeholder="email@example.com" className="bg-white px-4 py-3 rounded-xl border border-earth/10 outline-none" />
              <textarea name="message" required rows={4} placeholder="How can we help?" className="bg-white px-4 py-3 rounded-xl border border-earth/10 outline-none resize-none"></textarea>
              <button type="submit" disabled={isSending} className="w-full py-4 bg-earth text-cream rounded-full text-base font-black hover:bg-earth/90 transition-all shadow-xl active:scale-95">
                {isSending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SupportPage = () => {
  useEffect(() => {
    document.title = "Support Divide Locals";
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-inner border border-rose-100">
        <Heart size={40} className="fill-rose-500" />
      </div>
      <h1 className="text-4xl md:text-6xl font-serif font-black text-earth mb-8 tracking-tight">Support the Project</h1>
      <div className="bg-[#FCF9F2] p-10 md:p-16 rounded-[48px] border border-earth/5 shadow-sm space-y-8">
        <p className="text-xl md:text-2xl text-navy/80 font-serif italic leading-relaxed">
          "Your support helps keep Divide Locals free for the whole community."
        </p>
        <button className="px-10 py-5 bg-earth text-cream rounded-full text-lg font-black hover:bg-earth/90 transition-all shadow-2xl active:scale-95">
          Become a Supporter
        </button>
      </div>
      <Link to="/directory" className="mt-12 inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#B2AC88] hover:text-earth transition-all">
        <ChevronRight size={16} className="rotate-180" />
        <span>Back to the Neighborhood</span>
      </Link>
    </div>
  );
};
