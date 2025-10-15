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

export default function SimplePanditsPage() {
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience: '',
    languages: '',
    rating: '4.5',
    pricePerHour: '',
    location: '',
    description: '',
    phoneNumber: '',
    whatsappNumber: '',
    available: true
  });

  // Load all pandits
  const loadPandits = async () => {
    try {
      console.log('Loading pandits...');
      const response = await fetch('/api/simple-pandits');
      const data = await response.json();
      console.log('Loaded pandits:', data);
      setPandits(data);
    } catch (error) {
      console.error('Error loading pandits:', error);
    }
  };

  useEffect(() => {
    loadPandits();
  }, []);

  // Add new pandit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Submitting form:', formData);

    try {
      const response = await fetch('/api/simple-pandits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok) {
        alert('✅ Pandit added successfully!');
        // Reset form
        setFormData({
          name: '',
          specialization: '',
          experience: '',
          languages: '',
          rating: '4.5',
          pricePerHour: '',
          location: '',
          description: '',
          phoneNumber: '',
          whatsappNumber: '',
          available: true
        });
        loadPandits(); // Refresh list
      } else {
        alert(`❌ Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('❌ Network error. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Simple Pandits Management</h1>
      
      <div className="mb-4">
        <button
          onClick={loadPandits}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          🔄 Refresh List
        </button>
      </div>

      {/* Add Pandit Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Pandit</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border p-2 rounded w-full"
              required
              placeholder="Pandit Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specialization *</label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="border p-2 rounded w-full"
              required
              placeholder="Vedic Pujas, Marriage, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Experience (years) *</label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="border p-2 rounded w-full"
              required
              placeholder="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Languages *</label>
            <input
              type="text"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              className="border p-2 rounded w-full"
              required
              placeholder="Hindi, English, Sanskrit"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price per hour *</label>
            <input
              type="number"
              value={formData.pricePerHour}
              onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
              className="border p-2 rounded w-full"
              required
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="border p-2 rounded w-full"
              required
              placeholder="Delhi, Mumbai, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="border p-2 rounded w-full"
              placeholder="+919876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="border p-2 rounded w-full"
              placeholder="+919876543210"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border p-2 rounded w-full"
              rows={3}
              placeholder="About the pandit..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="mr-2"
              />
              Available for bookings
            </label>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 w-full text-lg font-semibold"
            >
              {loading ? 'Adding Pandit...' : '➕ Add Pandit'}
            </button>
          </div>
        </form>
      </div>

      {/* Pandits List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          All Pandits ({pandits.length})
        </h2>
        
        {pandits.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 text-lg">📭 No pandits found</p>
            <p className="text-sm text-gray-400 mt-2">
              Add your first pandit using the form above
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pandits.map((pandit) => (
              <div key={pandit.id} className="border p-4 rounded-lg bg-white shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{pandit.name}</h3>
                    <p className="text-blue-600 font-medium">{pandit.specialization}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <p>📍 {pandit.location}</p>
                      <p>⭐ {pandit.rating} rating</p>
                      <p>📅 {pandit.experience} years</p>
                      <p>💰 ₹{pandit.pricePerHour}/hour</p>
                      <p>🗣️ {pandit.languages}</p>
                      <p>📞 {pandit.phoneNumber || 'Not provided'}</p>
                    </div>
                    {pandit.description && (
                      <p className="text-gray-700 mt-2">{pandit.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      pandit.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {pandit.available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}