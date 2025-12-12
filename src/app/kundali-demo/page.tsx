'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import NorthIndianChart from '@/components/NorthIndianChart';
import { generateKundali, computeVimshottari } from '@/utils/kundaliCalc';

export default function KundaliDemoPage() {
  const [birthDetails, setBirthDetails] = useState({
    day: 29,
    month: 10,
    year: 2005,
    hour: 12,
    minute: 0,
    second: 0,
    latitude: 24.5854, // Udaipur
    longitude: 73.7125,
    timezone: 5.5,
    place: 'Udaipur, Rajasthan'
  });

  const [kundaliData, setKundaliData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create UTC date from birth details
      // Subtract timezone offset to get UTC
      const localDate = new Date(
        birthDetails.year,
        birthDetails.month - 1,
        birthDetails.day,
        birthDetails.hour,
        birthDetails.minute,
        birthDetails.second
      );

      // Convert to UTC by subtracting timezone offset
      const utcDate = new Date(localDate.getTime() - (birthDetails.timezone * 60 * 60 * 1000));

      console.log('Local Date:', localDate.toISOString());
      console.log('UTC Date:', utcDate.toISOString());

      // Generate Kundali
      const data = generateKundali(
        utcDate,
        birthDetails.latitude,
        birthDetails.longitude,
        birthDetails.timezone
      );

      console.log('Generated Kundali Data:', data);
      setKundaliData(data);
    } catch (err) {
      console.error('Error generating kundali:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate kundali');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setBirthDetails(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-amber-900 mb-4">
            🪔 Vedic Kundali Generator
          </h1>
          <p className="text-lg text-amber-700">
            Accurate planetary calculations using astronomia library
          </p>
          <p className="text-sm text-amber-600 mt-2">
            Free • Offline • No API Required • NASA/JPL Data
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 border-2 border-amber-200">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">Birth Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={birthDetails.day}
                onChange={(e) => handleInputChange('day', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={birthDetails.month}
                onChange={(e) => handleInputChange('month', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={birthDetails.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hour (24h format)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={birthDetails.hour}
                onChange={(e) => handleInputChange('hour', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minute
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={birthDetails.minute}
                onChange={(e) => handleInputChange('minute', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone (IST = 5.5)
              </label>
              <input
                type="number"
                step="0.5"
                value={birthDetails.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={birthDetails.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={birthDetails.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Place
              </label>
              <input
                type="text"
                value={birthDetails.place}
                onChange={(e) => setBirthDetails(prev => ({ ...prev, place: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Calculating...
                </span>
              ) : (
                '✨ Generate Kundali'
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {kundaliData && (
          <div className="space-y-8">
            {/* North Indian Chart */}
            <NorthIndianChart chartData={kundaliData} showDetails={true} />

            {/* Vimshottari Dasha */}
            <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-purple-900 mb-6">
                🕉️ Vimshottari Mahadasha
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-purple-900">Lord</th>
                      <th className="px-4 py-2 text-left text-purple-900">Years</th>
                      <th className="px-4 py-2 text-left text-purple-900">Start Date</th>
                      <th className="px-4 py-2 text-left text-purple-900">End Date</th>
                      <th className="px-4 py-2 text-left text-purple-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kundaliData.dashas.slice(0, 10).map((dasha: any, index: number) => {
                      const now = new Date();
                      const isCurrent = now >= dasha.start && now <= dasha.end;

                      return (
                        <tr
                          key={index}
                          className={`border-b border-purple-100 ${isCurrent ? 'bg-purple-50 font-bold' : ''}`}
                        >
                          <td className="px-4 py-2">{dasha.lord}</td>
                          <td className="px-4 py-2">{dasha.years.toFixed(2)}</td>
                          <td className="px-4 py-2">{dasha.start.toLocaleDateString()}</td>
                          <td className="px-4 py-2">{dasha.end.toLocaleDateString()}</td>
                          <td className="px-4 py-2">
                            {isCurrent && <span className="text-green-600">● Current</span>}
                            {dasha.partial && <span className="text-orange-600">Partial</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

