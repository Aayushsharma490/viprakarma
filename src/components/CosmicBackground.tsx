'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

const CosmicBackground = () => {
    const { theme } = useTheme();
    const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; duration: number; delay: number }[]>([]);
    const bgRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 5000], [0, -500]);
    const y2 = useTransform(scrollY, [0, 5000], [0, -1000]);

    useEffect(() => {
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

    const isDark = theme === 'dark';

    return (
        <div ref={bgRef} className={`fixed inset-0 z-[-1] overflow-hidden transition-colors duration-1000 pointer-events-none ${isDark ? 'bg-[#020205]' : 'bg-[#fafafa]'}`}>
            {/* Deep Space Gradients */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-100 bg-[radial-gradient(circle_at_50%_50%,#050515_0%,#020205_100%)]' : 'opacity-20 bg-[radial-gradient(circle_at_50%_0%,#fef3c7_0%,#ffffff_100%)]'}`} />

            {/* Nebula Clouds */}
            <motion.div
                style={{ y: y1 }}
                className={`absolute top-[-10%] left-[-10%] w-[120%] h-[120%] mix-blend-screen transition-opacity duration-1000 ${isDark ? 'opacity-15' : 'opacity-5'}`}
            >
                <div className={`absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse-slow ${isDark ? 'bg-purple-900/20' : 'bg-amber-200/40'}`} />
                <div className={`absolute bottom-[10%] right-[20%] w-[50%] h-[50%] rounded-full blur-[150px] animate-pulse-slow ${isDark ? 'bg-indigo-900/10' : 'bg-orange-100/30'}`} style={{ animationDelay: '3s' }} />
                <div className={`absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px] animate-pulse-slow ${isDark ? 'bg-blue-900/10' : 'bg-amber-50/20'}`} style={{ animationDelay: '6s' }} />
            </motion.div>

            {/* Stars Layer 1 (Static-ish) */}
            <div className="absolute inset-0">
                {stars.slice(0, 100).map((star) => (
                    <div
                        key={star.id}
                        className="absolute bg-white rounded-full opacity-40 animate-pulse"
                        style={{
                            top: star.top,
                            left: star.left,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            animationDuration: `${star.duration}s`,
                            animationDelay: `${star.delay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Stars Layer 2 (Parallax) */}
            <motion.div style={{ y: y2 }} className="absolute inset-0">
                {stars.slice(100).map((star) => (
                    <div
                        key={star.id}
                        className="absolute bg-amber-200 rounded-full opacity-60 animate-pulse"
                        style={{
                            top: star.top,
                            left: star.left,
                            width: `${star.size + 1}px`,
                            height: `${star.size + 1}px`,
                            animationDuration: `${star.duration * 1.5}s`,
                            animationDelay: `${star.delay * 0.5}s`,
                            boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
                        }}
                    />
                ))}
            </motion.div>

            {/* Shooting Stars */}
            <div className="absolute inset-0">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="shooting-star"
                        style={{
                            top: `${Math.random() * 50}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 10 + 2}s`,
                        }}
                    />
                ))}
            </div>

            <style jsx>{`
                .shooting-star {
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: linear-gradient(to right, white, transparent);
                    border-radius: 50%;
                    box-shadow: 0 0 10px 2px white;
                    animation: shoot 5s linear infinite;
                    opacity: 0;
                }

                @keyframes shoot {
                    0% {
                        transform: translateX(0) translateY(0) rotate(45deg) scale(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                        transform: translateX(0) translateY(0) rotate(45deg) scale(1);
                    }
                    20% {
                        transform: translateX(200px) translateY(200px) rotate(45deg) scale(1);
                        opacity: 0;
                    }
                    100% {
                        transform: translateX(200px) translateY(200px) rotate(45deg) scale(0);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default CosmicBackground;
