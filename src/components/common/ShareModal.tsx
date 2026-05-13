import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Send, MessageSquare, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  shareUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, businessName, shareUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: `Check out this local business on Divide Locals:`,
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleSMS = () => {
    const message = `Hey! I found this business on Divide Locals and thought it was useful. Check out their profile: ${shareUrl}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2F3E5B]/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-[#E7D6BF] rounded-[32px] shadow-2xl overflow-hidden p-8 border border-[#7A4A2E]/10"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif font-black italic text-[#7A4A2E]">Share Listing</h3>
              <button 
                onClick={onClose} 
                className="w-11 h-11 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full transition-all active:scale-90"
              >
                <X size={20} className="text-[#7A4A2E]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Copy Link Button */}
              <button
                onClick={handleCopy}
                className="w-full h-[72px] flex items-center gap-4 px-6 bg-white/40 rounded-2xl hover:bg-white/60 transition-all group active:scale-[0.98]"
              >
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-[#7A4A2E]/5">
                  {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} className="text-[#7A4A2E]" />}
                </div>
                <div className="text-left">
                  <span className="block font-black uppercase tracking-widest text-[11px] text-[#7A4A2E]">
                    {copied ? 'Link Copied!' : 'Copy Link'}
                  </span>
                  <span className="text-[10px] text-[#7A4A2E]/40 font-serif italic">Copy to clipboard</span>
                </div>
              </button>

              {/* Native Share Button */}
              {navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="w-full h-[72px] flex items-center gap-4 px-6 bg-white/40 rounded-2xl hover:bg-white/60 transition-all group active:scale-[0.98]"
                >
                  <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-[#7A4A2E]/5">
                    <Send size={20} className="text-[#7A4A2E]" />
                  </div>
                  <div className="text-left">
                    <span className="block font-black uppercase tracking-widest text-[11px] text-[#7A4A2E]">
                      System Share
                    </span>
                    <span className="text-[10px] text-[#7A4A2E]/40 font-serif italic">AirDrop, Email, Socials</span>
                  </div>
                </button>
              )}

              {/* Text/SMS Button */}
              <button
                onClick={handleSMS}
                className="w-full h-[72px] flex items-center gap-4 px-6 bg-[#7A4A2E] text-white rounded-2xl hover:bg-[#7A4A2E]/90 transition-all shadow-lg active:scale-[0.98]"
              >
                <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <span className="block font-black uppercase tracking-widest text-[11px] text-white">
                    Send via Text
                  </span>
                  <span className="text-[10px] text-white/40 font-serif italic">Direct to friend</span>
                </div>
              </button>
            </div>

            <p className="mt-8 text-[11px] text-[#7A4A2E]/60 text-center font-serif italic leading-relaxed px-4">
               "When we share local favorites, our whole community grows stronger."
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
