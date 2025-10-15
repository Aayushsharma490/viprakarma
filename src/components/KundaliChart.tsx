'use client';

import React, { useRef, useEffect } from 'react';

// Grah (Planet) ke liye data structure
// IMPORTANT: 'name' hamesha Hindi mein hona chahiye, jaise 'सूर्य', 'चंद्र'
export interface Planet {
  name: string;
  house: number;
}

// Component ke Props
interface KundaliChartProps {
  planets: Planet[];
  ascendant: string; // Lagna Rashi ka English naam, jaise "Aries"
}

// Rashi (Zodiac) ki jaankari Hindi mein
const ZODIAC_SIGNS_HINDI = [
  { name: 'Aries', hindi: 'मेष राशि' }, { name: 'Taurus', hindi: 'वृषभ राशि' },
  { name: 'Gemini', hindi: 'मिथुन राशि' }, { name: 'Cancer', hindi: 'कर्क राशि' },
  { name: 'Leo', hindi: 'सिंह राशि' }, { name: 'Virgo', hindi: 'कन्या राशि' },
  { name: 'Libra', hindi: 'तुला राशि' }, { name: 'Scorpio', hindi: 'वृश्चिक राशि' },
  { name: 'Sagittarius', hindi: 'धनु राशि' }, { name: 'Capricorn', hindi: 'मकर राशि' },
  { name: 'Aquarius', hindi: 'कुंभ राशि' }, { name: 'Pisces', hindi: 'मीन राशि' },
];

// Har Ghar (House) ki jaankari aur unki text positions (North Indian Style)
// Sabhi positions ko % mein rakha gaya hai taaki size badalne par bhi ainvayi rahe
const HOUSE_POSITIONS = [
    { num: 1,  rashiNumPos: { x: 0.5, y: 0.42 }, rashiNamePos: { x: 0.5, y: 0.35 }, planetPos: { x: 0.5, y: 0.5 } },
    { num: 2,  rashiNumPos: { x: 0.3, y: 0.2 }, rashiNamePos: { x: 0.3, y: 0.13 }, planetPos: { x: 0.3, y: 0.28 } },
    { num: 3,  rashiNumPos: { x: 0.1, y: 0.3 }, rashiNamePos: { x: 0.1, y: 0.23 }, planetPos: { x: 0.15, y: 0.35 } },
    { num: 4,  rashiNumPos: { x: 0.2, y: 0.5 }, rashiNamePos: { x: 0.15, y: 0.5 }, planetPos: { x: 0.3, y: 0.5 } },
    { num: 5,  rashiNumPos: { x: 0.1, y: 0.7 }, rashiNamePos: { x: 0.1, y: 0.63 }, planetPos: { x: 0.15, y: 0.7 } },
    { num: 6,  rashiNumPos: { x: 0.3, y: 0.8 }, rashiNamePos: { x: 0.3, y: 0.87 }, planetPos: { x: 0.3, y: 0.72 } },
    { num: 7,  rashiNumPos: { x: 0.5, y: 0.58 }, rashiNamePos: { x: 0.5, y: 0.65 }, planetPos: { x: 0.5, y: 0.5 } },
    { num: 8,  rashiNumPos: { x: 0.7, y: 0.8 }, rashiNamePos: { x: 0.7, y: 0.87 }, planetPos: { x: 0.7, y: 0.72 } },
    { num: 9,  rashiNumPos: { x: 0.9, y: 0.7 }, rashiNamePos: { x: 0.9, y: 0.63 }, planetPos: { x: 0.85, y: 0.7 } },
    { num: 10, rashiNumPos: { x: 0.8, y: 0.5 }, rashiNamePos: { x: 0.85, y: 0.5 }, planetPos: { x: 0.7, y: 0.5 } },
    { num: 11, rashiNumPos: { x: 0.9, y: 0.3 }, rashiNamePos: { x: 0.9, y: 0.23 }, planetPos: { x: 0.85, y: 0.35 } },
    { num: 12, rashiNumPos: { x: 0.7, y: 0.2 }, rashiNamePos: { x: 0.7, y: 0.13 }, planetPos: { x: 0.7, y: 0.28 } },
];


const KundaliChart: React.FC<KundaliChartProps> = ({ planets, ascendant }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !planets || !ascendant) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 600;
    canvas.width = size;
    canvas.height = size;
    
    // --- Drawing ---
    ctx.clearRect(0, 0, size, size); 
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

    // Step 1: Decorative Outer Shape Banana
    const c = 0.55; // Curve control point
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.quadraticCurveTo(size * c, size * (1-c), 0, size * 0.5);
    ctx.quadraticCurveTo(size * (1-c), size * c, size * 0.5, size);
    ctx.quadraticCurveTo(size * c, size * c, size, size * 0.5);
    ctx.quadraticCurveTo(size * (1-c), size * (1-c), size * 0.5, 0);
    ctx.stroke();

    // Step 2: Andar ka Diamond (Rhombus) Banana
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0); ctx.lineTo(size, size * 0.5);
    ctx.lineTo(size * 0.5, size); ctx.lineTo(0, size * 0.5);
    ctx.closePath();
    ctx.moveTo(0, size * 0.5); ctx.lineTo(size, size * 0.5);
    ctx.moveTo(size * 0.5, 0); ctx.lineTo(size * 0.5, size);
    ctx.stroke();

    // Step 3: Center mein "Om" Symbol
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ॐ', size * 0.5, size * 0.5);

    // Step 4: Rashi, Grah, etc. Banana
    const ascendantIndex = ZODIAC_SIGNS_HINDI.findIndex(sign => sign.name === ascendant);
    if (ascendantIndex === -1) return;

    const planetsByHouse: { [key: number]: string[] } = {};
    planets.forEach(p => {
        if (!planetsByHouse[p.house]) planetsByHouse[p.house] = [];
        planetsByHouse[p.house].push(p.name);
    });
    
    // North Indian chart houses are fixed, signs rotate. 1st house is always top.
    HOUSE_POSITIONS.forEach((houseInfo, houseIndex) => {
        const signIndex = (ascendantIndex + houseIndex) % 12;
        const rashi = ZODIAC_SIGNS_HINDI[signIndex];
        const rashiNumber = signIndex + 1;

        // Draw Rashi Number (Lal rang mein)
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#d95f5f';
        ctx.textAlign = 'center';
        ctx.fillText(rashiNumber.toString(), houseInfo.rashiNumPos.x * size, houseInfo.rashiNumPos.y * size);

        // Draw Rashi Name (Hindi mein)
        ctx.font = '14px "Noto Sans Devanagari"';
        ctx.fillStyle = 'black';
        ctx.fillText(rashi.hindi, houseInfo.rashiNamePos.x * size, houseInfo.rashiNamePos.y * size);
        
        // Draw Planets (Neele rang mein aur stacked)
        const planetsInThisHouse = planetsByHouse[houseInfo.num];
        if(planetsInThisHouse) {
            ctx.font = 'bold 20px "Noto Sans Devanagari"';
            ctx.fillStyle = '#0000d1'; // Blue color
            planetsInThisHouse.forEach((planetName, i) => {
                const yOffset = i * 22; // Har grah ke beech mein vertical gap
                ctx.fillText(planetName, houseInfo.planetPos.x * size, houseInfo.planetPos.y * size + yOffset);
            });
        }
    });

  }, [planets, ascendant]);

  return (
    <div className="flex justify-center items-center bg-gray-100 p-4">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default KundaliChart;