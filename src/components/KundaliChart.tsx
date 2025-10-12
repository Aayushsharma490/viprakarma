'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Planet, House } from '@/lib/astrologyApi';

interface KundaliChartProps {
  planets: Planet[];
  houses: House[];
  ascendant: string;
}

const KundaliChart: React.FC<KundaliChartProps> = ({ planets, houses, ascendant }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 700;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;

    // Create gradient background
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 2);
    gradient.addColorStop(0, '#fef3c7');
    gradient.addColorStop(0.5, '#fde68a');
    gradient.addColorStop(1, '#fbbf24');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Draw ornate border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, size - 40, size - 40);
    
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, size - 60, size - 60);

    // Draw North Indian Diamond Chart
    const squareSize = size * 0.7;
    const halfSquare = squareSize / 2;
    const offsetX = centerX;
    const offsetY = centerY;

    // Draw outer diamond shape
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY - halfSquare); // Top
    ctx.lineTo(offsetX + halfSquare, offsetY); // Right
    ctx.lineTo(offsetX, offsetY + halfSquare); // Bottom
    ctx.lineTo(offsetX - halfSquare, offsetY); // Left
    ctx.closePath();
    ctx.stroke();

    // Fill diamond with light gradient
    const diamondGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, halfSquare);
    diamondGradient.addColorStop(0, '#ffffff');
    diamondGradient.addColorStop(0.6, '#fef3c7');
    diamondGradient.addColorStop(1, '#fde68a');
    ctx.fillStyle = diamondGradient;
    ctx.fill();

    // Draw inner cross lines
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY - halfSquare);
    ctx.lineTo(offsetX, offsetY + halfSquare);
    ctx.stroke();
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(offsetX - halfSquare, offsetY);
    ctx.lineTo(offsetX + halfSquare, offsetY);
    ctx.stroke();
    
    // Diagonal from top-left to bottom-right
    ctx.beginPath();
    ctx.moveTo(offsetX - halfSquare, offsetY);
    ctx.lineTo(offsetX, offsetY - halfSquare);
    ctx.lineTo(offsetX + halfSquare, offsetY);
    ctx.lineTo(offsetX, offsetY + halfSquare);
    ctx.closePath();
    ctx.stroke();

    // Draw additional division lines for 12 houses
    const quarterSquare = halfSquare / 2;
    
    // Top triangle divisions
    ctx.beginPath();
    ctx.moveTo(offsetX - quarterSquare, offsetY - quarterSquare);
    ctx.lineTo(offsetX, offsetY - halfSquare);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(offsetX + quarterSquare, offsetY - quarterSquare);
    ctx.lineTo(offsetX, offsetY - halfSquare);
    ctx.stroke();
    
    // Right triangle divisions
    ctx.beginPath();
    ctx.moveTo(offsetX + quarterSquare, offsetY - quarterSquare);
    ctx.lineTo(offsetX + halfSquare, offsetY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(offsetX + quarterSquare, offsetY + quarterSquare);
    ctx.lineTo(offsetX + halfSquare, offsetY);
    ctx.stroke();
    
    // Bottom triangle divisions
    ctx.beginPath();
    ctx.moveTo(offsetX + quarterSquare, offsetY + quarterSquare);
    ctx.lineTo(offsetX, offsetY + halfSquare);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(offsetX - quarterSquare, offsetY + quarterSquare);
    ctx.lineTo(offsetX, offsetY + halfSquare);
    ctx.stroke();
    
    // Left triangle divisions
    ctx.beginPath();
    ctx.moveTo(offsetX - quarterSquare, offsetY + quarterSquare);
    ctx.lineTo(offsetX - halfSquare, offsetY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(offsetX - quarterSquare, offsetY - quarterSquare);
    ctx.lineTo(offsetX - halfSquare, offsetY);
    ctx.stroke();

    // House positions (12 sections in diamond)
    const housePositions = [
      // Top section (House 1 - Ascendant)
      { x: offsetX, y: offsetY - halfSquare * 0.65, label: '1', align: 'center' },
      // Top-right
      { x: offsetX + halfSquare * 0.35, y: offsetY - halfSquare * 0.5, label: '2' },
      // Right-upper
      { x: offsetX + halfSquare * 0.6, y: offsetY - halfSquare * 0.25, label: '3' },
      // Right
      { x: offsetX + halfSquare * 0.65, y: offsetY, label: '4' },
      // Right-lower
      { x: offsetX + halfSquare * 0.6, y: offsetY + halfSquare * 0.25, label: '5' },
      // Bottom-right
      { x: offsetX + halfSquare * 0.35, y: offsetY + halfSquare * 0.5, label: '6' },
      // Bottom
      { x: offsetX, y: offsetY + halfSquare * 0.65, label: '7', align: 'center' },
      // Bottom-left
      { x: offsetX - halfSquare * 0.35, y: offsetY + halfSquare * 0.5, label: '8' },
      // Left-lower
      { x: offsetX - halfSquare * 0.6, y: offsetY + halfSquare * 0.25, label: '9' },
      // Left
      { x: offsetX - halfSquare * 0.65, y: offsetY, label: '10' },
      // Left-upper
      { x: offsetX - halfSquare * 0.6, y: offsetY - halfSquare * 0.25, label: '11' },
      // Top-left
      { x: offsetX - halfSquare * 0.35, y: offsetY - halfSquare * 0.5, label: '12' },
    ];

    // Draw house numbers and signs
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    houses.forEach((house, index) => {
      const pos = housePositions[index];
      if (pos) {
        // Draw house number
        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 18px Playfair Display';
        ctx.fillText(house.house.toString(), pos.x, pos.y - 10);

        // Draw sign abbreviation
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 13px Lora';
        const signAbbr = house.sign.substring(0, 3).toUpperCase();
        ctx.fillText(signAbbr, pos.x, pos.y + 8);

        // Mark ascendant with special symbol
        if (house.house === 1) {
          ctx.fillStyle = '#d97706';
          ctx.font = 'bold 14px Lora';
          ctx.fillText('◈ ASC', pos.x, pos.y + 25);
        }
      }
    });

    // Draw planets in their houses
    ctx.font = 'bold 12px Lora';
    planets.forEach((planet) => {
      const houseIndex = planet.house - 1;
      const pos = housePositions[houseIndex];
      if (pos) {
        const planetSymbols: Record<string, string> = {
          Sun: '☉',
          Moon: '☽',
          Mars: '♂',
          Mercury: '☿',
          Jupiter: '♃',
          Venus: '♀',
          Saturn: '♄',
          Rahu: '☊',
          Ketu: '☋'
        };

        const symbol = planetSymbols[planet.name] || planet.name.substring(0, 2);
        
        const planetsInSameHouse = planets.filter(p => p.house === planet.house);
        const planetIndexInHouse = planetsInSameHouse.indexOf(planet);
        const xOffset = (planetIndexInHouse - (planetsInSameHouse.length - 1) / 2) * 20;

        ctx.fillStyle = planet.benefic ? '#059669' : '#dc2626';
        ctx.fillText(symbol, pos.x + xOffset, pos.y + 40);

        if (planet.isRetrograde) {
          ctx.font = '9px Lora';
          ctx.fillStyle = '#991b1b';
          ctx.fillText('R', pos.x + xOffset + 10, pos.y + 35);
          ctx.font = 'bold 12px Lora';
        }
      }
    });

    // Draw center circle for deity/symbol
    const centerRadius = 80;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw inner decorative circle
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius - 10, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw Om symbol or text in center
    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ॐ', centerX, centerY);

    // Add decorative corners
    const cornerSize = 30;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(40, 60);
    ctx.lineTo(40, 40);
    ctx.lineTo(60, 40);
    ctx.stroke();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(size - 60, 40);
    ctx.lineTo(size - 40, 40);
    ctx.lineTo(size - 40, 60);
    ctx.stroke();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(size - 40, size - 60);
    ctx.lineTo(size - 40, size - 40);
    ctx.lineTo(size - 60, size - 40);
    ctx.stroke();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(60, size - 40);
    ctx.lineTo(40, size - 40);
    ctx.lineTo(40, size - 60);
    ctx.stroke();

    // Add title
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 24px Playfair Display';
    ctx.textAlign = 'center';
    ctx.fillText('जन्म कुंडली', centerX, 60);
    ctx.font = '16px Lora';
    ctx.fillStyle = '#92400e';
    ctx.fillText('Birth Chart (Kundali)', centerX, 85);

    // Add legend at bottom
    ctx.font = '13px Lora';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#78350f';
    ctx.fillText(`Ascendant: ${ascendant}`, 60, size - 55);
    
    ctx.fillStyle = '#059669';
    ctx.fillText('● Benefic', 60, size - 35);
    
    ctx.fillStyle = '#dc2626';
    ctx.fillText('● Malefic', 160, size - 35);
    
    ctx.fillStyle = '#78350f';
    ctx.fillText('R = Retrograde', 260, size - 35);

  }, [planets, houses, ascendant]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-4 border-double border-amber-400 classical-shadow">
      <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-lg" />
      <p className="text-sm text-amber-900 text-center font-medium italic">
        Traditional North Indian Diamond Style Kundali
      </p>
    </div>
  );
};

export default KundaliChart;