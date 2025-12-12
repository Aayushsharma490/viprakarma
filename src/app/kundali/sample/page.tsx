'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import NorthIndianKundali from '@/components/NorthIndianKundali';
import { generateKundali } from '@/lib/astrologyApi';

export default function SampleKundaliPage() {
  const [birthDetails, setBirthDetails] = useState({
    name: 'John Doe',
    day: 15,
    month: 6,
    year: 1990,
    hour: 14,
    minute: 30,
    latitude: 28.6139,
    longitude: 77.2090,
    city: 'Delhi',
    timezone: 5.5,
    zodiac: 'Gemini'
  });

  const [kundaliData, setKundaliData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Zodiac sign abbreviations
  const zodiacAbbr: Record<string, string> = {
    Aries: 'Ar', Taurus: 'Ta', Gemini: 'Ge', Cancer: 'Ca',
    Leo: 'Le', Virgo: 'Vi', Libra: 'Li', Scorpio: 'Sc',
    Sagittarius: 'Sa', Capricorn: 'Cp', Aquarius: 'Aq', Pisces: 'Pi'
  };

  useEffect(() => {
    generateChart();
  }, [birthDetails]);

  const generateChart = async () => {
    setLoading(true);
    try {
      const data = await generateKundali(birthDetails);
      setKundaliData(data);
    } catch (error) {
      console.error('Error generating kundali:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setBirthDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Transform data for the component
  const planets = kundaliData?.planets.map((p: any) => ({
    name: p.name,
    sign: p.sign,
    house: p.house,
    degree: p.degree
  })) || [];

  const houses = kundaliData?.houses.map((h: any) => ({
    sign: h.sign,
    lord: h.lord,
    signNumber: h.signNumber || (h.sign ? ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].indexOf(h.sign) + 1 : null)
  })) || [];

  const getZodiacSymbol = (sign: string) => {
    const symbols: Record<string, string> = {
      Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
      Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
      Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
    };
    return symbols[sign] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">🪔 Authentic North Indian Kundali Chart</h1>
          <p className="text-amber-700">Real astronomical calculations - Chart changes with birth details</p>
        </div>

        {/* Birth Details Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-amber-200 mb-8 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Enter Birth Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={birthDetails.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <input
                type="number"
                min="1"
                max="31"
                value={birthDetails.day}
                onChange={(e) => handleInputChange('day', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                value={birthDetails.month}
                onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                min="1900"
                max="2030"
                value={birthDetails.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hour (24h)</label>
              <input
                type="number"
                min="0"
                max="23"
                value={birthDetails.hour}
                onChange={(e) => handleInputChange('hour', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minute</label>
              <input
                type="number"
                min="0"
                max="59"
                value={birthDetails.minute}
                onChange={(e) => handleInputChange('minute', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={birthDetails.latitude}
                onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={birthDetails.longitude}
                onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={birthDetails.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Kundali Chart */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-amber-900 text-lg">Calculating planetary positions...</div>
          </div>
        ) : (
          <NorthIndianKundali
            planets={planets}
            houses={houses}
          />
        )}

        {/* Zodiac Signs Legend */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border border-amber-200 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Zodiac Signs Legend</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♈</span>
              <span className="text-sm text-gray-700">Aries (Mesha)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♉</span>
              <span className="text-sm text-gray-700">Taurus (Vrishabha)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♊</span>
              <span className="text-sm text-gray-700">Gemini (Mithuna)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♋</span>
              <span className="text-sm text-gray-700">Cancer (Karka)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♌</span>
              <span className="text-sm text-gray-700">Leo (Simha)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♍</span>
              <span className="text-sm text-gray-700">Virgo (Kanya)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♎</span>
              <span className="text-sm text-gray-700">Libra (Tula)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♏</span>
              <span className="text-sm text-gray-700">Scorpio (Vrishchika)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♐</span>
              <span className="text-sm text-gray-700">Sagittarius (Dhanu)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♑</span>
              <span className="text-sm text-gray-700">Capricorn (Makara)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♒</span>
              <span className="text-sm text-gray-700">Aquarius (Kumbha)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♓</span>
              <span className="text-sm text-gray-700">Pisces (Meena)</span>
            </div>
          </div>
        </div>

        {/* Chart Details */}
        {kundaliData && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border border-amber-200 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Chart Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Birth Details</h3>
                <p className="text-sm text-gray-600">Name: {birthDetails.name}</p>
                <p className="text-sm text-gray-600">Date: {birthDetails.day}/{birthDetails.month}/{birthDetails.year}</p>
                <p className="text-sm text-gray-600">Time: {birthDetails.hour}:{birthDetails.minute.toString().padStart(2, '0')}</p>
                <p className="text-sm text-gray-600">Place: {birthDetails.city}</p>
                <p className="text-sm text-gray-600">Ascendant: {kundaliData.ascendant}</p>
                <p className="text-sm text-gray-600">Sun Sign: {kundaliData.sunSign}</p>
                <p className="text-sm text-gray-600">Moon Sign: {kundaliData.moonSign}</p>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Planetary Positions</h3>
                <ul className="text-sm text-gray-600 space-y-1 max-h-48 overflow-y-auto">
                  {kundaliData.planets.map((planet: any) => (
                    <li key={planet.name}>
                      {planet.name} in {planet.sign} ({planet.house}th House) - {planet.degree.toFixed(1)}°
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
