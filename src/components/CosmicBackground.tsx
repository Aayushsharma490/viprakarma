'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const CosmicBackground = () => {
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; duration: number; delay: number }[]>([]);
    const bgRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 5000], [0, -500]);
    const y2 = useTransform(scrollY, [0, 5000], [0, -1000]);

    useEffect(() => {
        setMounted(true);

        // Safely get theme from Context after mount
        try {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            setTheme(savedTheme);
        } catch (error) {
            setTheme('dark');
        }

        const starCount = 150;
        const newStars = Array.from({ length: starCount }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2 + 1,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5,
        }));
        setStars(newStars);
    }, []);

    // Don't render anything until mounted to avoid SSR issues
    if (!mounted) {
        return null;
    }

    const isDark = theme === 'dark';

    return (
        <div
            ref={bgRef}
            className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
            style={{
                background: isDark
                    ? 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f1e 50%, #050510 100%)'
                    : 'radial-gradient(ellipse at top, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
            }}
        >
            {/* Animated gradient orbs */}
            <motion.div
                className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
                style={{
                    background: isDark ? '#6366f1' : '#818cf8',
                    top: '10%',
                    left: '20%',
                    y: y1,
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
                style={{
                    background: isDark ? '#8b5cf6' : '#a78bfa',
                    bottom: '10%',
                    right: '20%',
                    y: y2,
                }}
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.2, 0.3],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Stars */}
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        background: isDark ? '#ffffff' : '#4f46e5',
                    }}
                    animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            {/* Shooting stars */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={`shooting-${i}`}
                    className="absolute h-0.5 w-12 rounded-full"
                    style={{
                        background: isDark
                            ? 'linear-gradient(90deg, transparent, #ffffff, transparent)'
                            : 'linear-gradient(90deg, transparent, #4f46e5, transparent)',
                        top: `${Math.random() * 50}%`,
                        left: '-50px',
                    }}
                    animate={{
                        x: ['0vw', '110vw'],
                        y: ['0vh', '50vh'],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 5,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
};

export default CosmicBackground;
