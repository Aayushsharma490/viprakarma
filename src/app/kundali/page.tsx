'use client';
import { useState, useRef, useEffect, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming you use shadcn/ui Select
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import KundaliChart from '@/components/KundaliChart';
import { Loader2, Star, Sun, Moon, Download, Calendar, TrendingUp, Award, Activity, Heart, BookOpen, Briefcase, Users } from 'lucide-react';
import { generateKundali, type BirthDetails, type KundaliData } from '@/lib/astrologyApi';
import { indianCities, type IndianCity } from '@/lib/locations'; // Import the city data
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

gsap.registerPlugin(useGSAP);

export default function KundaliPage() {
  const [formData, setFormData] = useState({
    name: '',
    day: '',
    month: '',
    year: '',
    hour: '',
    minute: '',
    place: '',
    latitude: '',
    longitude: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [kundaliData, setKundaliData] = useState<KundaliData | null>(null);
  const [isManualLocation, setIsManualLocation] = useState(false);

  const container = useRef(null);
  const resultsRef = useRef(null);

  // GSAP Animations
  useGSAP(() => {
    const targets = gsap.utils.toArray<HTMLElement>('.form-field');
    if (!targets.length) return;
    gsap.from(targets, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
      immediateRender: false,
      onComplete: () => {
        // Remove inline styles so elements keep their natural styles
        targets.forEach((el) => gsap.set(el, { clearProps: 'opacity,transform' }));
      },
    });
  }, { scope: container });

  useEffect(() => {
    if (kundaliData) {
      gsap.from('.result-card', {
        opacity: 0,
        y: 40,
        scale: 0.98,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power4.out',
      });
    }
  }, [kundaliData]);

  const handleLocationChange = (cityName: string) => {
    const city = indianCities.find((c) => c.city === cityName);
    if (city) {
      setFormData({
        ...formData,
        place: city.city,
        latitude: city.latitude.toString(),
        longitude: city.longitude.toString(),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setKundaliData(null); // Clear previous results

    try {
      const lat = parseFloat(formData.latitude);
      const lon = parseFloat(formData.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        toast.error('Please select a location or enter valid latitude and longitude.');
        setIsLoading(false);
        return;
      }
      const birthDetails: BirthDetails = {
        day: parseInt(formData.day),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        hour: parseInt(formData.hour),
        minute: parseInt(formData.minute),
        latitude: lat,
        longitude: lon,
        timezone: 5.5, // Standard for India
      };
      const data = await generateKundali(birthDetails);
      setKundaliData(data);
    } catch (error) {
      console.error('Kundali generation error:', error);
      toast.error('Failed to generate kundali. Check inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!kundaliData) return;
    setIsExporting(true);

    try {
      const element = document.getElementById('kundali-results');
      if (!element) {
        console.error('Kundali results element not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`kundali-${formData.name || 'chart'}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" ref={container}>
      <Navbar />
      <ChatBot />

      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 golden-text">
            Kundali Generator
          </h1>
          <p className="text-xl text-gray-600">
            Generate your comprehensive birth chart with detailed astrological insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="classical-card p-6 lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Birth Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-field">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4 form-field">
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Input id="day" type="number" placeholder="DD" min="1" max="31" value={formData.day} onChange={(e) => setFormData({ ...formData, day: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Input id="month" type="number" placeholder="MM" min="1" max="12" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder="YYYY" min="1900" max={new Date().getFullYear()} value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 form-field">
                <div>
                  <Label htmlFor="hour">Hour (24h)</Label>
                  <Input id="hour" type="number" placeholder="HH" min="0" max="23" value={formData.hour} onChange={(e) => setFormData({ ...formData, hour: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="minute">Minute</Label>
                  <Input id="minute" type="number" placeholder="MM" min="0" max="59" value={formData.minute} onChange={(e) => setFormData({ ...formData, minute: e.target.value })} required />
                </div>
              </div>

              <div className="form-field">
                <Label htmlFor="place">Place of Birth</Label>
                {/* NOTE: Using shadcn/ui Select component. If not available, use a standard <select> tag. */}
                <Select onValueChange={handleLocationChange} value={formData.place} disabled={isManualLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianCities.map((city) => (
                      <SelectItem key={`${city.city}-${city.state}`} value={String(city.city)}>
                        {city.city}, {city.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 mt-3">
                  <input
                    id="manualLocation"
                    type="checkbox"
                    checked={isManualLocation}
                    onChange={(e) => setIsManualLocation(e.target.checked)}
                  />
                  <Label htmlFor="manualLocation" className="text-sm text-gray-700">Enter location manually</Label>
                </div>
                {isManualLocation && (
                  <div className="mt-3">
                    <Label htmlFor="manualCity">City/Town</Label>
                    <Input
                      id="manualCity"
                      type="text"
                      placeholder="Enter city or village name"
                      value={formData.place}
                      onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 form-field">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="text"
                    placeholder={isManualLocation ? 'Enter latitude (e.g., 26.9124)' : 'Auto-filled'}
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    readOnly={!isManualLocation}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="text"
                    placeholder={isManualLocation ? 'Enter longitude (e.g., 75.7873)' : 'Auto-filled'}
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    readOnly={!isManualLocation}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white form-field" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Star className="mr-2 h-4 w-4" /> Generate Kundali</>
                )}
              </Button>
            </form>
          </Card>

          {kundaliData && (
            <div id="kundali-results" className="space-y-6 lg:col-span-2" ref={resultsRef}>
              <div className="flex justify-end result-card">
                <Button onClick={exportToPDF} disabled={isExporting} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {isExporting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...</>
                  ) : (
                    <><Download className="mr-2 h-4 w-4" /> Export as PDF</>
                  )}
                </Button>
              </div>

              <div id="kundali-chart" className="result-card">
                <KundaliChart planets={kundaliData.planets} houses={kundaliData.houses} ascendant={kundaliData.ascendant} />
              </div>

              {/* Basic Details */}
              <Card className="classical-card p-6 result-card">
                <div className="flex items-center mb-4">
                  <Sun className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Basic Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <Sun className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Sun Sign</p>
                    <p className="font-semibold text-lg">{kundaliData.sunSign}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Moon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Moon Sign</p>
                    <p className="font-semibold text-lg">{kundaliData.moonSign}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Ascendant</p>
                    <p className="font-semibold text-lg">{kundaliData.ascendant}</p>
                  </div>
                </div>
              </Card>

              {/* Nakshatras */}
              <Card className="classical-card p-6 result-card">
                <div className="flex items-center mb-4">
                  <Star className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Nakshatras</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Sun className="h-5 w-5 text-amber-600 mr-2" />
                      <span className="font-semibold">Sun Nakshatra:</span>
                    </div>
                    <p className="text-gray-700">{kundaliData.nakshatras.sun.name} (Lord: {kundaliData.nakshatras.sun.lord})</p>
                    <p className="text-sm text-gray-600">Pada: {kundaliData.nakshatras.sun.pada} • {kundaliData.nakshatras.sun.characteristics}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Moon className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-semibold">Moon Nakshatra:</span>
                    </div>
                    <p className="text-gray-700">{kundaliData.nakshatras.moon.name} (Lord: {kundaliData.nakshatras.moon.lord})</p>
                    <p className="text-sm text-gray-600">Pada: {kundaliData.nakshatras.moon.pada} • {kundaliData.nakshatras.moon.characteristics}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="font-semibold">Ascendant Nakshatra:</span>
                    </div>
                    <p className="text-gray-700">{kundaliData.nakshatras.ascendant.name} (Lord: {kundaliData.nakshatras.ascendant.lord})</p>
                    <p className="text-sm text-gray-600">Pada: {kundaliData.nakshatras.ascendant.pada} • {kundaliData.nakshatras.ascendant.characteristics}</p>
                  </div>
                </div>
              </Card>

              {/* Planetary Positions */}
              <Card className="classical-card p-6 result-card">
                <div className="flex items-center mb-4">
                  <Activity className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Planetary Positions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kundaliData.planets.map((planet) => (
                    <div key={planet.name} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{planet.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${planet.benefic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {planet.benefic ? 'Benefic' : 'Malefic'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Sign: {planet.sign}</p>
                      <p className="text-sm text-gray-600">House: {planet.house}</p>
                      <p className="text-sm text-gray-600">Degree: {planet.degree.toFixed(2)}°</p>
                      <p className="text-sm text-gray-600">Nakshatra: {planet.nakshatra}</p>
                      {planet.isRetrograde && <p className="text-xs text-orange-600">Retrograde</p>}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Planetary Strengths */}
              <Card className="classical-card p-6 result-card">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Planetary Strengths</h3>
                </div>
                <div className="space-y-3">
                  {kundaliData.planetaryStrengths.map((strength) => (
                    <div key={strength.planet} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="font-semibold mr-3">{strength.planet}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          strength.status === 'Very Strong' ? 'bg-green-100 text-green-800' :
                          strength.status === 'Strong' ? 'bg-blue-100 text-blue-800' :
                          strength.status === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {strength.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{strength.strengthPercent}%</div>
                        <div className="text-xs text-gray-600">Shadbala: {strength.shadbala}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Dashas */}
              <Card className="classical-card p-6 result-card">
                <div className="flex items-center mb-4">
                  <Calendar className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Current Dasha Period</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                    <h4 className="font-semibold text-lg mb-2">{kundaliData.dashas.current.planet} Mahadasha</h4>
                    <p className="text-gray-700 mb-2">{kundaliData.dashas.current.level}</p>
                    <p className="text-sm text-gray-600">Period: {kundaliData.dashas.current.startDate} to {kundaliData.dashas.current.endDate}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Upcoming Mahadashas</h4>
                    <div className="space-y-2">
                      {kundaliData.dashas.mahadashas.slice(1).map((dasha, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{dasha.planet}</span>
                          <span className="text-sm text-gray-600">{dasha.startDate} - {dasha.endDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Yogas */}
              <Card className="classical-card p-6 result-card">
                <div className="flex items-center mb-4">
                  <Award className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Auspicious Yogas</h3>
                </div>
                <div className="space-y-3">
                  {kundaliData.yogas.map((yoga, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg">{yoga.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          yoga.strength === 'Strong' ? 'bg-green-100 text-green-800' :
                          yoga.strength === 'Moderate' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {yoga.strength}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{yoga.description}</p>
                      <p className="text-sm text-gray-600">Planets: {yoga.planets.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Doshas */}
              <Card className="classical-card p-6 result-card">
                <div className="flex items-center mb-4">
                  <Activity className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Doshas & Malefic Influences</h3>
                </div>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${kundaliData.doshas.mangalDosha ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Mangal Dosha</span>
                      <span className={`text-xs px-2 py-1 rounded ${kundaliData.doshas.mangalDosha ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {kundaliData.doshas.mangalDosha ? 'Present' : 'Absent'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {kundaliData.doshas.mangalDosha
                        ? 'Mars is placed in 1st, 4th, 7th, 8th, or 12th house. Special remedies recommended.'
                        : 'No Mangal Dosha present in your chart.'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${kundaliData.doshas.kalSarpDosha ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Kal Sarp Dosha</span>
                      <span className={`text-xs px-2 py-1 rounded ${kundaliData.doshas.kalSarpDosha ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {kundaliData.doshas.kalSarpDosha ? 'Present' : 'Absent'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {kundaliData.doshas.kalSarpDosha
                        ? 'All planets are hemmed between Rahu and Ketu. Special poojas recommended.'
                        : 'No Kal Sarp Dosha present in your chart.'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${kundaliData.doshas.pitruDosha ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Pitru Dosha</span>
                      <span className={`text-xs px-2 py-1 rounded ${kundaliData.doshas.pitruDosha ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {kundaliData.doshas.pitruDosha ? 'Present' : 'Absent'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {kundaliData.doshas.pitruDosha
                        ? 'Ancestral issues may affect current life. Regular tarpan recommended.'
                        : 'No Pitru Dosha present in your chart.'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${kundaliData.doshas.sadheSatiActive ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Sade Sati</span>
                      <span className={`text-xs px-2 py-1 rounded ${kundaliData.doshas.sadheSatiActive ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                        {kundaliData.doshas.sadheSatiActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {kundaliData.doshas.sadheSatiActive
                        ? 'Saturn is transiting through Moon sign. Period of testing and growth.'
                        : 'Sade Sati period is currently inactive.'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Predictions */}
              <Card className="classical-card p-6 result-card">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Life Predictions</h3>
                </div>
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Heart className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-lg">Personality</h4>
                    </div>
                    <p className="text-gray-700">{kundaliData.predictions.personality}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Briefcase className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-semibold text-lg">Career</h4>
                    </div>
                    <p className="text-gray-700">{kundaliData.predictions.career}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <TrendingUp className="h-5 w-5 text-yellow-600 mr-2" />
                      <h4 className="font-semibold text-lg">Finance</h4>
                    </div>
                    <p className="text-gray-700">{kundaliData.predictions.finance}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Activity className="h-5 w-5 text-red-600 mr-2" />
                      <h4 className="font-semibold text-lg">Health</h4>
                    </div>
                    <p className="text-gray-700">{kundaliData.predictions.health}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Users className="h-5 w-5 text-purple-600 mr-2" />
                      <h4 className="font-semibold text-lg">Marriage & Relationships</h4>
                    </div>
                    <p className="text-gray-700">{kundaliData.predictions.marriage}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
                      <h4 className="font-semibold text-lg">Education</h4>
                    </div>
                    <p className="text-gray-700">{kundaliData.predictions.education}</p>
                  </div>
                </div>
              </Card>

              {/* Remedies */}
              <Card className="classical-card p-6 result-card">
                <div className="flex items-center mb-4">
                  <Award className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Recommended Remedies</h3>
                </div>
                <div className="space-y-3">
                  {kundaliData.remedies.map((remedy, index) => (
                    <div key={index} className="flex items-start p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{remedy}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> These remedies are general suggestions based on your birth chart.
                    Consult a qualified astrologer for personalized guidance and proper implementation of these remedies.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
