'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Loader2, Search, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
  available: boolean;
  createdAt: string;
}

export default function AdminPanditsPage() {
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPandit, setEditingPandit] = useState<Pandit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience: 0,
    languages: '',
    rating: 4.5,
    pricePerHour: 1000,
    location: '',
    description: '',
    imageUrl: '',
    available: true,
  });

  useEffect(() => {
    fetchPandits();
  }, []);

  const fetchPandits = async () => {
    try {
      const response = await fetch('/api/pandits?limit=100');
      const data = await response.json();
      setPandits(data);
    } catch (error) {
      console.error('Error fetching pandits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingPandit 
        ? `/api/pandits?id=${editingPandit.id}`
        : '/api/pandits';
      
      const method = editingPandit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPandits();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving pandit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pandit: Pandit) => {
    setEditingPandit(pandit);
    setFormData({
      name: pandit.name,
      specialization: pandit.specialization,
      experience: pandit.experience,
      languages: pandit.languages,
      rating: pandit.rating,
      pricePerHour: pandit.pricePerHour,
      location: pandit.location,
      description: pandit.description || '',
      imageUrl: pandit.imageUrl || '',
      available: pandit.available,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pandit?')) return;

    try {
      await fetch(`/api/pandits?id=${id}`, { method: 'DELETE' });
      await fetchPandits();
    } catch (error) {
      console.error('Error deleting pandit:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      experience: 0,
      languages: '',
      rating: 4.5,
      pricePerHour: 1000,
      location: '',
      description: '',
      imageUrl: '',
      available: true,
    });
    setEditingPandit(null);
    setShowForm(false);
  };

  const filteredPandits = pandits.filter(pandit =>
    pandit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pandit.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pandit.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen cosmic-gradient">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-cosmic">Manage Pandits</h1>
          <p className="text-muted-foreground">Add, edit, or remove pandits from the platform</p>
        </motion.div>

        {/* Search and Add Button */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search pandits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 glow-purple"
          >
            {showForm ? (
              <>
                <X className="mr-2 w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="mr-2 w-4 h-4" />
                Add Pandit
              </>
            )}
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="glass-effect p-6">
              <h2 className="text-2xl font-semibold mb-6 text-cosmic">
                {editingPandit ? 'Edit Pandit' : 'Add New Pandit'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience (years) *</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="languages">Languages *</Label>
                    <Input
                      id="languages"
                      placeholder="Hindi, English, Sanskrit"
                      value={formData.languages}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricePerHour">Price Per Hour (₹) *</Label>
                    <Input
                      id="pricePerHour"
                      type="number"
                      min="1"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData({ ...formData, pricePerHour: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="available">Available for booking</Label>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                    {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
                    {editingPandit ? 'Update' : 'Create'} Pandit
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Pandits List */}
        {loading && !showForm ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPandits.map((pandit) => (
              <motion.div
                key={pandit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-effect p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">{pandit.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${pandit.available ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {pandit.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <p className="text-primary mb-1">{pandit.specialization}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {pandit.experience} years exp • {pandit.languages} • {pandit.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Rating: {pandit.rating}⭐</span>
                        <span className="text-muted-foreground">₹{pandit.pricePerHour}/hr</span>
                      </div>
                      {pandit.description && (
                        <p className="text-sm text-muted-foreground mt-2">{pandit.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(pandit)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(pandit.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredPandits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No pandits found</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}