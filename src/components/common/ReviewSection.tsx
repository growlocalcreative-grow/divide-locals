import React, { useState } from 'react';
import { Star, MessageSquare, LogIn, User, CheckCircle, X, Send } from 'lucide-react';
import { useAuth, useReviews, addReview } from '../../lib/hooks';
import { signInWithGoogle } from '../../lib/firebase';
import { ICON_STROKE } from '../../constants';
import { motion, AnimatePresence } from 'motion/react';

export const ReviewSection = ({ businessId, businessName }: { businessId: string, businessName: string }) => {
  const { user } = useAuth();
  const { reviews, loading, error } = useReviews(businessId);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isWriting, setIsWriting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addReview({
        businessId,
        businessName,
        neighborId: user.uid,
        authorId: user.uid,
        userName: user.displayName || 'Neighbor',
        userPhoto: user.photoURL || '',
        rating,
        comment
      });
      setIsSubmitted(true);
      setIsWriting(false);
      setComment('');
      setRating(5);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err: any) {
      alert("Error: " + (err.code || err.message));
    }
  };

  if (error) return null;

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center justify-between border-b border-earth/10 pb-4">
        <h3 className="text-2xl font-serif font-bold">Neighbor Reviews</h3>
        <div className="flex items-center gap-1 text-gold">
          <Star size={18} strokeWidth={ICON_STROKE} className="fill-gold" />
          <span className="font-bold">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'New'}</span>
        </div>
      </div>

      {isSubmitted ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-sage/10 border border-sage/20 p-6 rounded-[32px] text-center space-y-2"
        >
          <div className="w-12 h-12 bg-sage text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
            <CheckCircle size={24} />
          </div>
          <h4 className="text-lg font-serif font-black italic text-[#2D3E2F]">Neighborly Thanks!</h4>
          <p className="text-xs text-[#2D3E2F]/60 font-bold uppercase tracking-widest">Thanks for supporting a local business on Divide Locals! Your review is now live.</p>
        </motion.div>
      ) : user ? (
        <div className="space-y-4">
          {!isWriting ? (
            <button 
              onClick={() => setIsWriting(true)}
              className="flex items-center gap-2 px-8 py-4 border-2 border-[#2F3E5B] text-[#2F3E5B] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#2F3E5B] hover:text-white transition-all shadow-sm active:scale-95 group"
            >
              <MessageSquare size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
              Write a Review
            </button>
          ) : (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleReview} 
              className="bg-white p-8 rounded-[40px] border border-earth/5 shadow-2xl space-y-6 relative"
            >
              <button 
                type="button"
                onClick={() => setIsWriting(false)}
                className="absolute top-6 right-6 text-navy/20 hover:text-navy transition-colors"
              >
                <X size={20} />
              </button>

              <div>
                <p className="text-[10px] font-black text-sand uppercase tracking-widest mb-4">How was your experience?</p>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button 
                      key={s} 
                      type="button" 
                      onClick={() => setRating(s)}
                      className={`transition-all hover:scale-110 active:scale-95 ${rating >= s ? 'text-[#C9A24A]' : 'text-earth/10'}`}
                    >
                      <Star 
                        size={32} 
                        strokeWidth={ICON_STROKE} 
                        className={rating >= s ? 'fill-[#C9A24A]' : ''} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea 
                className="w-full bg-[#F5E6D3] p-6 rounded-3xl outline-none focus:ring-4 ring-[#C9A24A]/10 resize-none h-40 text-navy font-bold placeholder:text-navy/20"
                placeholder="Share your experience with the community..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
              />

              <div className="flex items-center gap-4">
                <button 
                  type="submit"
                  className="px-12 py-5 bg-[#2F3E5B] text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#2F3E5B]/90 transition-all shadow-xl active:scale-95 flex items-center gap-2 group"
                >
                  Post Review
                  <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
                <button 
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="px-8 py-5 text-[#2F3E5B]/40 font-black uppercase tracking-widest text-[10px] hover:text-[#2F3E5B] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </div>
      ) : (
        <div className="flex justify-center">
          <button 
            onClick={() => signInWithGoogle()}
            className="flex items-center gap-3 px-8 py-4 bg-[#7A4A2E] text-[#E7D6BF] rounded-full text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95 group"
          >
            <LogIn size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
            Sign in to leave a review
          </button>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="italic text-navy/40">No reviews yet. Be the first neighbor to say hello!</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="flex gap-4 p-4 bg-white/50 rounded-2xl border border-earth/5">
              <img src={r.userPhoto || undefined} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full shrink-0" alt="" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#7A4A2E]">{r.userName}</span>
                  <div className="flex text-gold">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} size={10} className="fill-gold" />)}
                  </div>
                </div>
                <p className="text-sm text-navy/70 leading-relaxed">{r.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
