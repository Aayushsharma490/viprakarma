import React, { useState } from 'react';
import KundaliTabs from './KundaliTabs';

interface PlanetData {
  planet: string;
  degree: number;
  rashi: string;
  nakshatra: string;
  house: number;
}

interface HouseData {
  rashi: string;
}

interface KundaliCustomPanelProps {
  planets: PlanetData[];
  houses: HouseData[];
  ascendant: string;
}

// Helper for chart legend
const legendItems = [
  { label: 'Lagna', color: 'bg-yellow-400' },
  { label: 'Chandra (Moon)', color: 'bg-blue-300' },
  { label: 'Navmaansh (D9)', color: 'bg-purple-300' },
];

export default function KundaliCustomPanel({ planets, houses, ascendant }: KundaliCustomPanelProps) {
  const [showLegend, setShowLegend] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPlanetModal, setShowPlanetModal] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [layout, setLayout] = useState<'north' | 'south'>('north');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Download chart as image (placeholder)
  function handleDownload() {
    alert('Download as image coming soon!');
  }

  // Share chart (placeholder)
  function handleShare() {
    alert('Share feature coming soon!');
  }

  // Custom data input (placeholder)
  function handleDataInput() {
    alert('Custom data input coming soon!');
  }

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Chart Settings */}
      <div className="flex gap-4 mb-2">
        <button className="px-3 py-1 rounded bg-gray-200 font-semibold" onClick={() => setLayout(layout === 'north' ? 'south' : 'north')}>
          Layout: {layout === 'north' ? 'North Indian' : 'South Indian'}
        </button>
        <button className="px-3 py-1 rounded bg-gray-200 font-semibold" onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}>
          Language: {language === 'en' ? 'English' : 'Hindi'}
        </button>
        <button className="px-3 py-1 rounded bg-yellow-300 font-bold" onClick={handleDownload}>Download Chart</button>
        <button className="px-3 py-1 rounded bg-blue-300 font-bold" onClick={handleShare}>Share Chart</button>
        <button className="px-3 py-1 rounded bg-purple-300 font-bold" onClick={handleDataInput}>Custom Data</button>
        <button className="px-3 py-1 rounded bg-gray-300 font-bold" onClick={() => setShowLegend(!showLegend)}>Legend</button>
        <button className="px-3 py-1 rounded bg-gray-300 font-bold" onClick={() => setShowHelp(!showHelp)}>Help</button>
      </div>
      {/* Legend */}
      {showLegend && (
        <div className="flex gap-4 mb-2">
          {legendItems.map(item => (
            <div key={item.label} className={`px-3 py-1 rounded font-bold text-black ${item.color}`}>{item.label}</div>
          ))}
        </div>
      )}
      {/* Help Tooltip */}
      {showHelp && (
        <div className="bg-gray-100 border border-gray-300 rounded p-4 max-w-lg text-sm text-gray-700 mb-2">
          <b>Kundali Chart Help:</b><br />
          - Lagna: Ascendant chart, houses from birth time.<br />
          - Chandra: Moon chart, houses from Moon's sign.<br />
          - Navmaansh: D9 divisional chart, deeper marriage/fortune analysis.<br />
          - Click a planet for details.<br />
          - Use settings to change layout, language, download, or share.<br />
        </div>
      )}
      {/* Chart Tabs */}
      <KundaliTabs
        planets={planets}
        houses={houses}
        ascendant={ascendant}
      />
      {/* Planet Details Modal */}
      {/* Planet Details Modal (feature to be wired up in chart components) */}
      {showPlanetModal && selectedPlanet && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg min-w-[300px]">
            <h3 className="text-lg font-bold mb-2">{selectedPlanet.planet} Details</h3>
            <div className="text-sm text-gray-700">
              <div>Degree: {selectedPlanet.degree}</div>
              <div>Sign: {selectedPlanet.rashi}</div>
              <div>Nakshatra: {selectedPlanet.nakshatra}</div>
              <div>House: {selectedPlanet.house}</div>
            </div>
            <button className="mt-4 px-3 py-1 rounded bg-yellow-400 font-bold" onClick={() => setShowPlanetModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
