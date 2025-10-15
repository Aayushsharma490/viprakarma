'use client';

import { useState, useEffect } from 'react';

interface Pandit {
  id: number;
  name: string;
  specialization: string;
  experience: number;
  languages: string;
  rating: number;
  pricePerHour: number;
  location: string;
  description?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  available: boolean;
}

export default function PanditsPage() {
  const [pandits, setPandits] = useState<Pandit[]>([]);

  useEffect(() => {
    fetchPandits();
  }, []);

  const fetchPandits = async () => {
    try {
      const response = await fetch('/api/pandits');
      const data = await response.json();
      setPandits(data);
    } catch (error) {
      console.error('Error fetching pandits:', error);
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_blank');
  };

  const handleWhatsApp = (whatsappNumber: string) => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Our Expert Pandits</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pandits.map((pandit) => (
            <div key={pandit.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {pandit.name.charAt(0)}
                </div>
                <h3 className="font-bold text-xl">{pandit.name}</h3>
                <p className="text-blue-600">{pandit.specialization}</p>
              </div>

              <div className="space-y-2 mb-4">
                <p className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span>{pandit.experience} years</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Languages:</span>
                  <span>{pandit.languages}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span>{pandit.location}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span>{pandit.rating} ⭐</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold">₹{pandit.pricePerHour}/hour</span>
                </p>
              </div>

              {pandit.description && (
                <p className="text-sm text-gray-700 mb-4">{pandit.description}</p>
              )}

              <div className="flex gap-2">
                {pandit.phoneNumber && (
                  <button
                    onClick={() => handleCall(pandit.phoneNumber!)}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
                  >
                    📞 Call
                  </button>
                )}
                {pandit.whatsappNumber && (
                  <button
                    onClick={() => handleWhatsApp(pandit.whatsappNumber!)}
                    className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 text-sm"
                  >
                    💬 WhatsApp
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {pandits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No pandits available at the moment.</p>
            <p className="text-sm text-gray-400">
              Check back later or contact us directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}