'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedPlanetProps {
  size?: number;
  color?: string;
  orbitRadius?: number;
  speed?: number;
}

export default function AnimatedPlanet({
  size = 40,
  color = '#a855f7',
  orbitRadius = 150,
  speed = 8,
}: AnimatedPlanetProps) {
  const planetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!planetRef.current) return;

    const tl = gsap.timeline({ repeat: -1 });
    
    tl.to(planetRef.current, {
      rotation: 360,
      duration: speed,
      ease: 'none',
    });

    return () => {
      tl.kill();
    };
  }, [speed]);

  return (
    <div
      ref={planetRef}
      className="absolute"
      style={{
        width: `${orbitRadius * 2}px`,
        height: `${orbitRadius * 2}px`,
      }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full glow-purple floating-animation"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}dd)`,
          boxShadow: `0 0 ${size / 2}px ${color}88`,
        }}
      />
    </div>
  );
}