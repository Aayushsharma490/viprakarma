'use client';

import React from 'react';

const KundaliChart: React.FC = () => {
  // Chart data
  const houseData = [
    { house: 1, sign: 'Ari', planets: ['Sun', 'Moon'] },
    { house: 2, sign: 'Tau', planets: ['Venus'] },
    { house: 3, sign: 'Gem', planets: ['Mercury'] },
    { house: 4, sign: 'Can', planets: ['Jupiter'] },
    { house: 5, sign: 'Leo', planets: ['Mars'] },
    { house: 6, sign: 'Vir', planets: [] },
    { house: 7, sign: 'Lib', planets: [] },
    { house: 8, sign: 'Sco', planets: [] },
    { house: 9, sign: 'Sag', planets: [] },
    { house: 10, sign: 'Cap', planets: [] },
    { house: 11, sign: 'Aqu', planets: [] },
    { house: 12, sign: 'Pis', planets: [] }
  ];

  // Positions (approximate percentages based on the uploaded image)
  const positions: Record<number, { top: string; left: string }> = {
    1: { top: '47%', left: '47%' },
    2: { top: '25%', left: '67%' },
    3: { top: '47%', left: '82%' },
    4: { top: '68%', left: '67%' },
    5: { top: '82%', left: '47%' },
    6: { top: '68%', left: '27%' },
    7: { top: '47%', left: '13%' },
    8: { top: '25%', left: '27%' },
    9: { top: '10%', left: '47%' },
    10: { top: '25%', left: '47%' },
    11: { top: '47%', left: '47%' },
    12: { top: '68%', left: '47%' },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-6">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Kundali Chart</h1>

      <div className="relative w-[400px] h-[400px] border-4 border-amber-800 rounded-lg shadow-lg overflow-hidden">
        {/* Background Kundali image */}
        <img
          src="/kundali-chart.png" // ⬅️ place your uploaded image in /public/kundali-chart.png
          alt="Kundali Chart"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-90"
        />

        {/* Overlay houses & planets */}
        {houseData.map((house) => {
          const pos = positions[house.house] || { top: '50%', left: '50%' };
          return (
            <div 
              key={house.house}
              className="absolute text-center transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: pos.top, left: pos.left }}
            >
              <div className="text-xs font-bold text-amber-900 bg-amber-100 rounded px-1 shadow">
                {house.house}. {house.sign}
              </div>
              {house.planets.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {house.planets.map((p, i) => (
                    <div
                      key={i}
                      className="text-[10px] text-blue-700 bg-blue-50 px-1 rounded"
                    >
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Ascendant: Aries | Style: North Indian
      </p>
    </div>
  );
};

export default KundaliChart;
