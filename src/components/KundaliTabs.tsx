import React, { useState } from 'react';
import KundaliChart from './KundaliChart';
import ChandraKundaliChart from './ChandraKundaliChart';
import NavmaanshKundaliChart from './NavmaanshKundaliChart';

interface KundaliTabsProps {
  planets: any[];
  houses: any[];
  ascendant: string;
}

const tabList = [
  { key: 'lagna', label: 'Lagna Kundali' },
  { key: 'chandra', label: 'Chandra Kundali' },
  { key: 'navmaansh', label: 'Navmaansh Kundali' },
];

export default function KundaliTabs({ planets, houses, ascendant }: KundaliTabsProps) {
  const [tab, setTab] = useState('lagna');

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex gap-4 mb-6">
        {tabList.map(t => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded font-bold border-2 transition-all ${tab === t.key ? 'bg-yellow-400 text-black border-yellow-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="w-full">
        {tab === 'lagna' && <KundaliChart planets={planets} houses={houses} ascendant={ascendant} />}
        {tab === 'chandra' && <ChandraKundaliChart planets={planets} houses={houses} />}
        {tab === 'navmaansh' && <NavmaanshKundaliChart planets={planets} />}
      </div>
    </div>
  );
}
