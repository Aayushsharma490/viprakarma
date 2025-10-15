'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Star, MapPin, Clock } from 'lucide-react';

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
  imageUrl?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  available: boolean;
}

export default function PanditsList() {
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPandits();
  }, []);

  const fetchPandits = async () => {
    try {
      const response = await fetch('/api/pandits');
      if (response.ok) {
        const data = await response.json();
        setPandits(data);
      }
    } catch (error) {
      console.error('Error fetching pandits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_blank');
  };

  const handleWhatsApp = (whatsappNumber: string) => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-8">Loading pandits...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pandits.map((pandit) => (
        <Card key={pandit.id} className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {pandit.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg">{pandit.name}</h3>
              <p className="text-primary text-sm">{pandit.specialization}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{pandit.experience} years experience</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{pandit.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{pandit.rating} • ₹{pandit.pricePerHour}/hr</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Languages: {pandit.languages}
          </p>

          {pandit.description && (
            <p className="text-sm mb-4">{pandit.description}</p>
          )}

          <div className="flex gap-2">
            {pandit.phoneNumber && (
              <Button
                size="sm"
                onClick={() => handleCall(pandit.phoneNumber!)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            )}
            {pandit.whatsappNumber && (
              <Button
                size="sm"
                onClick={() => handleWhatsApp(pandit.whatsappNumber!)}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}