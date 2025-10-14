'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import KundaliChart from '@/components/KundaliChart';
import { Loader2, Star, Sun, Moon, Download, Calendar, TrendingUp, Award, Activity, Heart, BookOpen, Briefcase, Users } from 'lucide-react';
import { generateKundali, type BirthDetails, type KundaliData } from '@/lib/astrologyApi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
 
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const birthDetails: BirthDetails = {
        name: formData.name,
        day: parseInt(formData.day),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        hour: parseInt(formData.hour),
        minute: parseInt(formData.minute),
        latitude: parseFloat(formData.latitude) || 28.6139,
        longitude: parseFloat(formData.longitude) || 77.2090,
        timezone: 5.5,
        place: formData.place
      };

      const data = await generateKundali(birthDetails);
      setKundaliData(data);
    } catch (error) {
      console.error('Kundali generation error:', error);
      alert('Error generating kundali. Please check your birth details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!kundaliData) return;
    
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title
      pdf.setFontSize(22);
      pdf.setTextColor(217, 119, 6);
      pdf.text('Kundali Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Personal Details
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated for: ${formData.name || 'User'}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      pdf.text(`Date: ${formData.day}/${formData.month}/${formData.year} | Time: ${formData.hour}:${formData.minute}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      pdf.text(`Place: ${formData.place}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Panchang Section
      if (kundaliData.panchang) {
        pdf.setFontSize(14);
        pdf.setTextColor(217, 119, 6);
        pdf.text('Panchang Details', 15, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(9);
        pdf.setTextColor(50, 50, 50);
        pdf.text(`Date: ${kundaliData.panchang.date}`, 15, yPosition);
        yPosition += 5;
        pdf.text(`Tithi: ${kundaliData.panchang.tithi}`, 15, yPosition);
        yPosition += 5;
        pdf.text(`Nakshatra: ${kundaliData.panchang.nakshatra}`, 15, yPosition);
        yPosition += 5;
        pdf.text(`Yoga: ${kundaliData.panchang.yoga}`, 15, yPosition);
        yPosition += 5;
        pdf.text(`Karana: ${kundaliData.panchang.karana}`, 15, yPosition);
        yPosition += 5;
        pdf.text(`Vaar: ${kundaliData.panchang.vaar}`, 15, yPosition);
        yPosition += 5;
        pdf.text(`Paksha: ${kundaliData.panchang.paksha}`, 15, yPosition);
        yPosition += 5;
        pdf.text(`Ritu: ${kundaliData.panchang.ritu}`, 15, yPosition);
        yPosition += 10;
      }

      // Capture Kundali Chart
      const chartElement = document.getElementById('kundali-chart');
      if (chartElement) {
        const canvas = await html2canvas(chartElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 120;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      }

      // Basic Details
      pdf.setFontSize(14);
      pdf.setTextColor(217, 119, 6);
      pdf.text('Basic Details', 15, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      pdf.text(`Sun Sign: ${kundaliData.sunSign}`, 15, yPosition);
      pdf.text(`Moon Sign: ${kundaliData.moonSign}`, 70, yPosition);
      pdf.text(`Ascendant: ${kundaliData.ascendant}`, 125, yPosition);
      yPosition += 10;

      // Nakshatras
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setTextColor(217, 119, 6);
      pdf.text('Nakshatras', 15, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setTextColor(50, 50, 50);
      pdf.text(`Sun: ${kundaliData.nakshatras.sun.name} (${kundaliData.nakshatras.sun.lord}) - Pada ${kundaliData.nakshatras.sun.pada}`, 15, yPosition);
      yPosition += 5;
      pdf.text(`Moon: ${kundaliData.nakshatras.moon.name} (${kundaliData.nakshatras.moon.lord}) - Pada ${kundaliData.nakshatras.moon.pada}`, 15, yPosition);
      yPosition += 5;
      pdf.text(`Ascendant: ${kundaliData.nakshatras.ascendant.name} (${kundaliData.nakshatras.ascendant.lord})`, 15, yPosition);
      yPosition += 10;

      // Planetary Positions
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setTextColor(217, 119, 6);
      pdf.text('Planetary Positions', 15, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(8);
      pdf.setTextColor(50, 50, 50);
      kundaliData.planets.forEach((planet) => {
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${planet.name}: ${planet.sign} ${planet.degree.toFixed(2)}° (House ${planet.house}) - ${planet.nakshatra}${planet.isRetrograde ? ' (R)' : ''}`, 15, yPosition);
        yPosition += 5;
      });
      yPosition += 5;

      // Doshas
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFontSize(14);
      pdf.setTextColor(217, 119, 6);
      pdf.text('Doshas', 15, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      pdf.text(`Mangal Dosha: ${kundaliData.doshas.mangalDosha ? 'Present' : 'Absent'}`, 15, yPosition);
      yPosition += 6;
      pdf.text(`Kal Sarp Dosha: ${kundaliData.doshas.kalSarpDosha ? 'Present' : 'Absent'}`, 15, yPosition);
      yPosition += 6;
      pdf.text(`Pitru Dosha: ${kundaliData.doshas.pitruDosha ? 'Present' : 'Absent'}`, 15, yPosition);
      yPosition += 6;
      pdf.text(`Sadhe Sati: ${kundaliData.doshas.sadheSatiActive ? 'Active' : 'Not Active'}`, 15, yPosition);
      yPosition += 10;

      // Yogas
      pdf.setFontSize(14);
      pdf.setTextColor(217, 119, 6);
      pdf.text('Yogas (Planetary Combinations)', 15, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setTextColor(50, 50, 50);
      kundaliData.yogas.forEach((yoga) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${yoga.name} (${yoga.strength}):`, 15, yPosition);
        yPosition += 5;
        const splitDesc = pdf.splitTextToSize(yoga.description, pageWidth - 30);
        pdf.text(splitDesc, 15, yPosition);
        yPosition += (splitDesc.length * 4) + 3;
      });

      // Predictions
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFontSize(14);
      pdf.setTextColor(217, 119, 6);
      pdf.text('Detailed Predictions', 15, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      
      const predictionSections = [
        { title: 'Personality', content: kundaliData.predictions.personality },
        { title: 'Career', content: kundaliData.predictions.career },
        { title: 'Finance', content: kundaliData.predictions.finance },
        { title: 'Health', content: kundaliData.predictions.health },
        { title: 'Marriage', content: kundaliData.predictions.marriage },
        { title: 'Education', content: kundaliData.predictions.education },
      ];

      predictionSections.forEach((section) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(11);
        pdf.setTextColor(217, 119, 6);
        pdf.text(section.title, 15, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(9);
        pdf.setTextColor(50, 50, 50);
        const splitText = pdf.splitTextToSize(section.content, pageWidth - 30);
        pdf.text(splitText, 15, yPosition);
        yPosition += (splitText.length * 4) + 5;
      });

      // Remedies
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setTextColor(217, 119, 6);
      pdf.text('Remedies', 15, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setTextColor(50, 50, 50);
      kundaliData.remedies.forEach((remedy, index) => {
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${index + 1}. ${remedy}`, 15, yPosition);
        yPosition += 5;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Generated by Astro Genesis | www.astrogenesis.com', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save PDF
      pdf.save(`Kundali_${formData.name || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ChatBot />

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 golden-text">
            Kundali Generator
          </h1>
          <p className="text-xl text-gray-600">
            Generate your comprehensive birth chart with detailed astrological insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <Card className="classical-card p-6 lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Birth Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Input
                    id="day"
                    type="number"
                    placeholder="15"
                    min="1"
                    max="31"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="number"
                    placeholder="6"
                    min="1"
                    max="12"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="1995"
                    min="1900"
                    max="2024"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hour">Hour (24h)</Label>
                  <Input
                    id="hour"
                    type="number"
                    placeholder="10"
                    min="0"
                    max="23"
                    value={formData.hour}
                    onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minute">Minute</Label>
                  <Input
                    id="minute"
                    type="number"
                    placeholder="30"
                    min="0"
                    max="59"
                    value={formData.minute}
                    onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="place">Place of Birth</Label>
                <Input
                  id="place"
                  type="text"
                  placeholder="Mumbai, India"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude (optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    placeholder="28.6139"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude (optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    placeholder="77.2090"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Your Kundali...
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Generate Kundali
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Results */}
          {kundaliData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 lg:col-span-2"
            >
              {/* Export Button */}
              <div className="flex justify-end">
                <Button
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export as PDF
                    </>
                  )}
                </Button>
              </div>

              {/* Panchang Section */}
              {kundaliData.panchang && (
                <Card className="classical-card p-6">
                  <h2 className="text-2xl font-semibold mb-4 golden-text flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Panchang Details
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Date</p>
                      <p className="font-semibold text-amber-700">{kundaliData.panchang.date}</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Tithi</p>
                      <p className="font-semibold text-amber-700">{kundaliData.panchang.tithi}</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Nakshatra</p>
                      <p className="font-semibold text-amber-700">{kundaliData.panchang.nakshatra}</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Yoga</p>
                      <p className="font-semibold text-amber-700">{kundaliData.panchang.yoga}</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Karana</p>
                      <p className="font-semibold text-amber-700">{kundaliData.panchang.karana}</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Vaar</p>
                      <p className="font-semibold text-amber-700">{kundaliData.panchang.vaar}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Kundali Chart */}
              <div id="kundali-chart">
                <KundaliChart
                  planets={kundaliData.planets}
                  houses={kundaliData.houses}
                  ascendant={kundaliData.ascendant}
                />
              </div>

              {/* Basic Details */}
              <Card className="classical-card p-6">
                <h2 className="text-2xl font-semibold mb-4 golden-text flex items-center gap-2">
                  <Sun className="w-6 h-6" />
                  Basic Details
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Sun Sign</p>
                    <p className="text-xl font-bold text-amber-700">{kundaliData.sunSign}</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Moon Sign</p>
                    <p className="text-xl font-bold text-amber-700">{kundaliData.moonSign}</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Ascendant</p>
                    <p className="text-xl font-bold text-amber-700">{kundaliData.ascendant}</p>
                  </div>
                </div>
              </Card>

              {/* Nakshatras */}
              <Card className="classical-card p-6">
                <h2 className="text-2xl font-semibold mb-4 golden-text flex items-center gap-2">
                  <Moon className="w-6 h-6" />
                  Nakshatras (Lunar Mansions)
                </h2>
                <div className="space-y-4">
                  {[
                    { title: 'Sun Nakshatra', data: kundaliData.nakshatras.sun },
                    { title: 'Moon Nakshatra', data: kundaliData.nakshatras.moon },
                    { title: 'Ascendant Nakshatra', data: kundaliData.nakshatras.ascendant },
                  ].map((item) => (
                    <div key={item.title} className="border-l-4 border-amber-600 pl-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{item.data.name}</span> - Lord: {item.data.lord} | Pada: {item.data.pada} | {item.data.degree}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{item.data.characteristics}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Planetary Positions */}
              <Card className="classical-card p-6">
                <h2 className="text-2xl font-semibold mb-4 golden-text flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Planetary Positions
                </h2>
                <div className="space-y-2">
                  {kundaliData.planets.map((planet) => (
                    <div key={planet.name} className="flex justify-between items-center text-sm py-2 border-b border-gray-200">
                      <span className={`font-medium ${planet.benefic ? 'text-green-700' : 'text-red-700'}`}>
                        {planet.name}{planet.isRetrograde ? ' ®' : ''}
                      </span>
                      <span className="text-gray-700">
                        {planet.sign} {planet.degree.toFixed(2)}° (House {planet.house})
                      </span>
                      <span className="text-xs text-gray-600">{planet.nakshatra} - Pada {planet.nakshatraPada}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Planetary Strengths */}
              <Card className="classical-card p-6">
                <h2 className="text-2xl font-semibold mb-4 golden-text flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Planetary Strengths (Shadbala)
                </h2>
                <div className="space-y-3">
                  {kundaliData.planetaryStrengths.map((strength) => (
                    <div key={strength.planet}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900">{strength.planet}</span>
                        <span className="text-sm text-gray-600">{strength.status} ({strength.strengthPercent}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            strength.strengthPercent > 75 ? 'bg-green-600' :
                            strength.strengthPercent > 60 ? 'bg-amber-600' :
                            strength.strengthPercent > 40 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${strength.strengthPercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Dashas */}
              <Card className="classical-card p-6">
                <h2 className="text-2xl font-semibold mb-4 golden-text flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Vimshottari Dasha (Planetary Periods)
                </h2>
                <div className="space-y-4">
                  <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-600">
                    <h3 className="font-semibold text-gray-900 mb-2">Current Mahadasha</h3>
                    <p className="text-gray-700">
                      <span className="font-medium text-amber-700">{kundaliData.dashas.current.planet}</span> Mahadasha
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(kundaliData.dashas.current.startDate).toLocaleDateString()} - {new Date(kundaliData.dashas.current.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">All Mahadashas</h3>
                    <div className="space-y-2">
                      {kundaliData.dashas.mahadashas.map((dasha: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm py-2 border-b border-gray-200">
                          <span className="font-medium text-gray-900">{dasha.planet}</span>
                          <span className="text-gray-600">
                            {new Date(dasha.startDate).getFullYear()} - {new Date(dasha.endDate).getFullYear()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Yogas */}
              <Card className="classical-card p-6">
                <h2 className="text-2xl font-semibold mb-4 golden-text flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Yogas (Planetary Combinations)
                </h2>
                <div className="space-y-4">
                  {kundaliData.yogas.map((yoga, index) => (
                    <div key={index} className="border-l-4 border-amber-600 pl-4 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900">{yoga.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          yoga.strength === 'Strong' ? 'bg-green-100 text-green-700' :
                          yoga.strength === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {yoga.strength}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{yoga.description}</p>
                      <p className="text-xs text-gray-600">Planets: {yoga.planets.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Doshas */}
              <Card className="classical-card p-6">
                <h2 className="text-2xl font-semibold mb-4 golden-text">Doshas</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Mangal Dosha', value: kundaliData.doshas.mangalDosha },
                    { label: 'Kal Sarp Dosha', value: kundaliData.doshas.kalSarpDosha },
                    { label: 'Pitru Dosha', value: kundaliData.doshas.pitruDosha },
                    { label: 'Sadhe Sati', value: kundaliData.doshas.sadheSatiActive },
                  ].map((dosha) => (
                    <div key={dosha.label} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{dosha.label}</span>
                      <span className={`text-sm font-semibold ${dosha.value ? 'text-red-600' : 'text-green-600'}`}>
                        {dosha.value ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Predictions */}
              <Card className="classical-card p-6">
                <h2 className="text-2xl font-semibold mb-6 golden-text flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Detailed Predictions
                </h2>
                <div className="space-y-6">
                  {[
                    { icon: Star, title: 'Personality', content: kundaliData.predictions.personality },
                    { icon: Briefcase, title: 'Career', content: kundaliData.predictions.career },
                    { icon: TrendingUp, title: 'Finance', content: kundaliData.predictions.finance },
                    { icon: Heart, title: 'Health', content: kundaliData.predictions.health },
                    { icon: Users, title: 'Marriage', content: kundaliData.predictions.marriage },
                    { icon: BookOpen, title: 'Education', content: kundaliData.predictions.education },
                  ].map((prediction, index) => (
                    <div key={index} className="border-l-4 border-amber-600 pl-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <prediction.icon className="w-5 h-5 text-amber-600" />
                        {prediction.title}
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{prediction.content}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Remedies */}
              <Card className="classical-card p-6">
                <h2 className="text-2xl font-semibold mb-4 golden-text">Remedies & Recommendations</h2>
                <ul className="space-y-3">
                  {kundaliData.remedies.map((remedy, index) => (
                    <li key={index} className="text-gray-700 flex items-start gap-3">
                      <Star className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{remedy}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}