'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceName: string;
}

export default function FeedbackModal({ isOpen, onClose, serviceName }: FeedbackModalProps) {
    const { t } = useLanguage();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error(t('feedback.ratingRequired') || 'Please select a rating');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceName,
                    rating,
                    feedback,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                toast.success(t('feedback.success') || 'Thank you for your feedback!');
                setRating(0);
                setFeedback('');
                onClose();
            } else {
                toast.error(t('feedback.error') || 'Failed to submit feedback');
            }
        } catch (error) {
            toast.error(t('feedback.error') || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        {t('feedback.title') || 'Rate Your Experience'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Star Rating */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-10 h-10 cursor-pointer transition-all hover:scale-110 ${star <= rating
                                        ? 'fill-amber-500 text-amber-500'
                                        : 'text-gray-300 hover:text-amber-400'
                                    }`}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>

                    {/* Feedback Text */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            {t('feedback.label') || 'Your Feedback (Optional)'}
                        </label>
                        <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder={t('feedback.placeholder') || 'Share your experience with us...'}
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || submitting}
                        className="w-full"
                        size="lg"
                    >
                        {submitting
                            ? (t('feedback.submitting') || 'Submitting...')
                            : (t('feedback.submit') || 'Submit Feedback')
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
