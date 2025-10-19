'use client';

import React, { useRef, useEffect } from 'react';

// --- Helper Data & Types (Self-contained for this component) ---

// This interface represents the expected structure of a planet object.
// The `fullDegree` is optional but recommended for a complete chart.
interface Planet {
  name: string;
  house: number;
  isRetrograde?: boolean;
  fullDegree?: number;
}

// The props for our chart component. It requires planets and the ascendant sign.
export interface KundaliChartProps {
  planets: Planet[];
  ascendant: string;
  houses?: any[]; // accepted but not used for drawing
}

const planetHindiNames = {
  Sun: 'सूर्य',
  Moon: 'चंद्र',
  Mars: 'मंगल',
  Mercury: 'बुध',
  Jupiter: 'बृहस्पति',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु',
} as const;

const signHindiNames = {
  Aries: 'मेष',
  Taurus: 'वृषभ',
  Gemini: 'मिथुन',
  Cancer: 'कर्क',
  Leo: 'सिंह',
  Virgo: 'कन्या',
  Libra: 'तुला',
  Scorpio: 'वृश्चिक',
  Sagittarius: 'धनु',
  Capricorn: 'मकर',
  Aquarius: 'कुंभ',
  Pisces: 'मीन',
} as const;

const signNumbers = {
  Aries: 1,
  Taurus: 2,
  Gemini: 3,
  Cancer: 4,
  Leo: 5,
  Virgo: 6,
  Libra: 7,
  Scorpio: 8,
  Sagittarius: 9,
  Capricorn: 10,
  Aquarius: 11,
  Pisces: 12,
} as const;


// --- The Chart Component ---

const KundaliChart: React.FC<KundaliChartProps> = ({ planets, ascendant }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- 1. Setup Canvas and Sizing ---
    const isMobile = window.innerWidth < 768;
    const size = Math.min(window.innerWidth - 30, isMobile ? 400 : 550);
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const margin = isMobile ? 15 : 20;

    // --- 2. Coordinates & Styling ---
    const p = {
      tl: { x: margin, y: margin },
      tr: { x: size - margin, y: margin },
      br: { x: size - margin, y: size - margin },
      bl: { x: margin, y: size - margin },
      // Midpoints for the diamond
      tm: { x: center, y: margin },
      rm: { x: size - margin, y: center },
      bm: { x: center, y: size - margin },
      lm: { x: margin, y: center },
    };
    
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#FFFDF5'; // A warm, parchment-like background
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#8C6E4A'; // A soft, brown-gray for lines
    ctx.lineWidth = isMobile ? 1.5 : 2.5;

    // --- 3. Draw Correct North Indian (Diamond) Chart Lines ---
    ctx.beginPath();
    // Outer square
    ctx.moveTo(p.tl.x, p.tl.y);
    ctx.lineTo(p.tr.x, p.tr.y);
    ctx.lineTo(p.br.x, p.br.y);
    ctx.lineTo(p.bl.x, p.bl.y);
    ctx.closePath();
    
    // Inner diamond (connecting the midpoints of the outer square)
    ctx.moveTo(p.tm.x, p.tm.y);
    ctx.lineTo(p.rm.x, p.rm.y);
    ctx.lineTo(p.bm.x, p.bm.y);
    ctx.lineTo(p.lm.x, p.lm.y);
    ctx.closePath();
    
    // Diagonals that divide the inner diamond
    ctx.moveTo(p.tl.x, p.tl.y);
    ctx.lineTo(p.br.x, p.br.y);
    ctx.moveTo(p.tr.x, p.tr.y);
    ctx.lineTo(p.bl.x, p.bl.y);
    ctx.stroke();

    // --- 4. Define Accurate House Positions (NEW LOGIC) ---
    // This logic calculates accurate center points for each of the 12 houses
    // ensuring they are properly separated and never overlap.
    const mainBoxSize = size - 2 * margin;
    const q1 = margin + mainBoxSize / 4;
    const q3 = margin + (mainBoxSize * 3) / 4;
    const mid = center;

    const housePos = [
      { house: 1, pos: { x: mid, y: q1 } },           // Top Rhombus
      { house: 2, pos: { x: q1, y: q1 } },            // Top-Left Triangle
      { house: 3, pos: { x: q1, y: mid } },           // Left Rhombus
      { house: 4, pos: { x: q1, y: q3 } },            // Bottom-Left Triangle
      { house: 5, pos: { x: mid, y: q3 } },           // Bottom Rhombus
      { house: 6, pos: { x: q3, y: q3 } },            // Bottom-Right Triangle
      { house: 7, pos: { x: q3, y: mid } },           // Right Rhombus
      { house: 8, pos: { x: q3, y: q1 } },            // Top-Right Triangle
      { house: 9, pos: { x: mid + mainBoxSize / 8, y: mid + mainBoxSize / 8 } },   // Inner Bottom-Right
      { house: 10, pos: { x: mid, y: mid - mainBoxSize / 5 } }, // Inner Top (Special placement for focus)
      { house: 11, pos: { x: mid - mainBoxSize / 8, y: mid + mainBoxSize / 8 } },   // Inner Bottom-Left
      { house: 12, pos: { x: mid - mainBoxSize / 8, y: mid - mainBoxSize / 8 } },   // Inner Top-Left
    ];
    
    // --- 5. Group Planets and Prepare for Drawing ---
    const planetsInHouses: { [key: number]: Planet[] } = {};
    planets.forEach((pl) => {
      if (!planetsInHouses[pl.house]) planetsInHouses[pl.house] = [];
      planetsInHouses[pl.house].push(pl);
    });

    const ascendantNum = signNumbers[ascendant as keyof typeof signNumbers] ?? 1;

    // --- 6. Draw Signs and Planets in Each House ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lineHeight = isMobile ? 14 : 18;

    housePos.forEach(({ house, pos }) => {
      // This logic correctly places the zodiac signs in a counter-clockwise manner
      // starting from the ascendant sign in the first house.
      const signNum = ((ascendantNum + house - 2 + 12) % 12) + 1;

      const signNameKey = Object.keys(signNumbers).find(
        (key) => signNumbers[key as keyof typeof signNumbers] === signNum,
      ) as keyof typeof signHindiNames;

      const planetsHere = planetsInHouses[house] || [];
      const totalElements = planetsHere.length + 1; // 1 for rashi name
      const startY = pos.y - ((totalElements - 1) / 2) * lineHeight;

      // Draw Rashi Name
      ctx.font = `bold ${isMobile ? 12 : 14}px Noto Sans Devanagari`;
      ctx.fillStyle = '#D32F2F'; // A deep red for the sign name
      ctx.fillText(`(${signNum}) ${signHindiNames[signNameKey]}`, pos.x, startY);

      // Draw Planets
      planetsHere.forEach((planet, index) => {
        ctx.font = `${isMobile ? 11 : 14}px Noto Sans Devanagari`;
        ctx.fillStyle = '#1976D2'; // A strong blue for planet names
        const retro = planet.isRetrograde ? ' (व)' : ''; // 'व' for Vakri (Retrograde)
        const degree = planet.fullDegree !== undefined ? ` ${Math.floor(planet.fullDegree)}°` : '';
        const nameKey = (planet.name in planetHindiNames)
          ? (planet.name as keyof typeof planetHindiNames)
          : undefined;
        const label = nameKey ? planetHindiNames[nameKey] : planet.name;
        const planetText = `${label}${retro}${degree}`;
        ctx.fillText(planetText, pos.x, startY + (index + 1) * lineHeight);
      });
    });

  }, [planets, ascendant]); // Redraw when data changes

  return (
    <div className="w-full flex justify-center p-4 bg-gray-50">
      <canvas
        ref={canvasRef}
        className="bg-white rounded-lg shadow-xl max-w-full h-auto"
      />
    </div>
  );
};

export default KundaliChart;

