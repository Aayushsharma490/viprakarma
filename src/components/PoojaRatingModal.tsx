"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface PoojaRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    poojaName: string;
}

export default function PoojaRatingModal({ isOpen, onClose, poojaName }: PoojaRatingModalProps) {
    const { t } = useLanguage();
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error(t("pooja.rating.selectError") || "Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/pooja-rating', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    poojaName,
                    rating,
                    review
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit rating');
            }

            toast.success(t("pooja.rating.thankYou") || "Thank you for your feedback!");
            onClose();
            // Reset form
            setRating(0);
            setReview('');
        } catch (error) {
            toast.error(t("pooja.rating.error") || "Failed to submit rating. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-orange-500 p-6 text-white text-center">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-2xl font-bold mb-2">{t("pooja.rating.title") || "Rate Your Experience"}</h2>
                            <p className="text-orange-100">{t("pooja.rating.question")} {poojaName}?</p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Star Rating */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= (hoveredStar || rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-gray-500">
                                    {rating === 0 ? t("pooja.rating.selectRating") :
                                        rating === 5 ? t("pooja.rating.excellent") :
                                            rating === 4 ? t("pooja.rating.good") :
                                                rating === 3 ? t("pooja.rating.average") :
                                                    rating === 2 ? t("pooja.rating.poor") : t("pooja.rating.veryPoor")}
                                </span>
                            </div>

                            {/* Review Textarea */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {t("pooja.rating.writeReview") || "Write a review (optional)"}
                                </label>
                                <Textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    placeholder={t("pooja.rating.placeholder") || "Share your experience..."}
                                    className="resize-none h-24 focus:ring-orange-500"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1"
                                >
                                    {t("pooja.rating.cancel") || "Cancel"}
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    {isSubmitting ? (t("pooja.rating.submitting") || 'Submitting...') : (t("pooja.rating.submit") || 'Submit Review')}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
