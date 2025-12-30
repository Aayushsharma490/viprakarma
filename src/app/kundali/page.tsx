"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Star,
  Sun,
  Moon,
  Compass,
  MapPin,
  Clock,
  Calendar,
  Target,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { indianCities } from "@/lib/locations";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import NorthIndianKundali from "@/components/NorthIndianKundali";
import ChandraKundaliChart from "@/components/ChandraKundaliChart";
import NavmaanshKundaliChart from "@/components/NavmaanshKundaliChart";
import { useLanguage } from "@/contexts/LanguageContext";

type ChartPlacement = {
  house: number;
  sign: string;
  planets: Array<{ name: string; label: string; retrograde: boolean }>;
};

type PlacementMap = Record<string, ChartPlacement>;

interface AstroEngineResponse {
  basicDetails: {
    name: string;
    gender: string;
    timezone: string;
    birthDate: string;
    localTime: string;
    utc: string;
    location: {
      city: string;
      latitude: number;
      longitude: number;
    };
  };
  ayanamsa: number;
  ascendant: {
    degree: number;
    sign: string;
    nakshatra: {
      name: string;
      lord: string;
      pada: number;
    };
  };
  sunSign: string;
  moonSign: string;
  planets: Array<{
    name: string;
    longitude: number;
    degreeInSign: number;
    sign: string;
    house: number;
    isRetrograde: boolean;
    nakshatra: { name: string; lord: string; pada: number };
    navamsaSign: string;
    dashamsaSign: string;
    benefic: boolean;
  }>;
  houses: Array<{ house: number; cusp: number; sign: string }>;
  charts: {
    d1: PlacementMap;
    chandra: PlacementMap;
    d9: PlacementMap;
    d10: PlacementMap;
  };
  nakshatras: {
    sun: { name: string; lord: string; pada: number } | null;
    moon: { name: string; lord: string; pada: number } | null;
    ascendant: { name: string; lord: string; pada: number };
  };
  dashas: {
    current: {
      planet: string;
      startDate: string;
      endDate: string;
      years: number;
    };
    mahadashas: Array<{
      planet: string;
      startDate: string;
      endDate: string;
      years: number;
      antardashas?: Array<{
        planet: string;
        startDate: string;
        endDate: string;
        years: number;
      }>;
    }>;
  };
}

interface FormState {
  name: string;
  gender: string;
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  second: string;
  place: string;
  latitude: string;
  longitude: string;
  timezone: string;
}

const initialFormState: FormState = {
  name: "",
  gender: "male",
  day: "",
  month: "",
  year: "",
  hour: "",
  minute: "",
  second: "",
  place: "",
  latitude: "",
  longitude: "",
  timezone: "+05:30",
};

const mapPlacementsToPlanets = (
  placements?: PlacementMap,
  allPlanets?: AstroEngineResponse["planets"]
) => {
  if (!placements) return [];
  return Object.values(placements)
    .sort((a, b) => a.house - b.house)
    .flatMap((house) =>
      house.planets.map((planet) => ({
        name: planet.name,
        planet: planet.name,
        house: house.house,
        rashi: house.sign,
        isRetrograde: planet.retrograde,
        // Attach exact degree within sign from master planet list (if available)
        degree:
          allPlanets?.find(
            (p) => p.name === planet.name && p.sign === house.sign
          )?.degreeInSign ?? undefined,
      }))
    );
};

const mapPlacementsToHouses = (placements?: PlacementMap) => {
  if (!placements) return [];
  return Object.values(placements)
    .sort((a, b) => a.house - b.house)
    .map((house) => ({ rashi: house.sign, sign: house.sign }));
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatDegree = (value: number) => `${value.toFixed(2)}°`;

export default function KundaliPage() {
  const { t, language, toggleLanguage } = useLanguage();
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [kundaliData, setKundaliData] = useState<AstroEngineResponse | null>(
    null
  );
  const [gocharData, setGocharData] = useState<AstroEngineResponse | null>(null);
  const [isLoadingGochar, setIsLoadingGochar] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [selectedChart, setSelectedChart] = useState<
    "d1" | "chandra" | "d9" | "d10" | "gochar"
  >("d1");
  const [expandedDasha, setExpandedDasha] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<'offline' | 'starting' | 'online'>('offline');

  // Pre-warm the astrology engine on mount
  useEffect(() => {
    const warmUp = async () => {
      try {
        const response = await fetch('/api/kundali/health');
        const data = await response.json();
        if (data.status === 'ok') {
          setEngineStatus('online');
        } else if (data.status === 'starting') {
          setEngineStatus('starting');
          // Poll again in 5 seconds if starting
          setTimeout(warmUp, 5000);
        }
      } catch (error) {
        console.error("Warm-up error:", error);
      }
    };
    warmUp();
  }, []);

  const handleLocationChange = (cityName: string) => {
    const city = indianCities.find((entry) => entry.city === cityName);
    if (city) {
      setFormData((prev) => ({
        ...prev,
        place: city.city,
        latitude: city.latitude.toString(),
        longitude: city.longitude.toString(),
        timezone: city.timezone || prev.timezone,
      }));
    }
  };

  const fetchCoordinates = async (cityName: string) => {
    if (!cityName.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          cityName
        )}&limit=1`
      );
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData((prev) => ({
          ...prev,
          latitude: Number.parseFloat(lat).toFixed(6),
          longitude: Number.parseFloat(lon).toFixed(6),
        }));
        toast.success("Coordinates detected from location");
      } else {
        toast.error("Coordinates not found. Please enter them manually.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Unable to fetch coordinates. Please enter them manually.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setKundaliData(null);

    try {
      const latitude = Number.parseFloat(formData.latitude);
      const longitude = Number.parseFloat(formData.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        toast.error("Please provide valid latitude and longitude values.");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        gender: formData.gender,
        year: Number(formData.year),
        month: Number(formData.month),
        day: Number(formData.day),
        hour: Number(formData.hour),
        minute: Number(formData.minute),
        second: Number(formData.second),
        latitude,
        longitude,
        timezone: formData.timezone.trim() || "+05:30",
        city: formData.place.trim() || "Unknown",
      };

      const response = await fetch("/api/kundali/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate kundali");
      }

      setKundaliData(data as AstroEngineResponse);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    } catch (error) {
      console.error("Kundali generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to generate kundali"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real-time Gochar (transit) data
  const fetchGocharData = async () => {
    if (!kundaliData) {
      toast.error("Please generate your Kundali first");
      return;
    }

    setIsLoadingGochar(true);
    try {
      const now = new Date();
      const payload = {
        name: "Current Transit",
        gender: "male",
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        timezone: formData.timezone.trim() || "+05:30",
        city: formData.place.trim() || "Current Location",
      };

      const response = await fetch("/api/kundali/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch Gochar data");
      }

      setGocharData(data as AstroEngineResponse);
      toast.success("Gochar data updated with current planetary positions!");
    } catch (error) {
      console.error("Gochar fetch error:", error);
      toast.error("Unable to fetch current transit data");
    } finally {
      setIsLoadingGochar(false);
    }
  };

  // Use backend data directly for all charts
  const d1Planets = kundaliData?.charts?.d1
    ? Object.values(kundaliData.charts.d1)
      .sort((a: any, b: any) => a.house - b.house)
      .flatMap((house: any) =>
        house.planets.map((planet: any) => {
          // Find the planet in the main planets array to get the degree
          const planetData = kundaliData.planets?.find(
            (p) => p.name === planet.name && p.sign === house.sign
          );
          return {
            planet: planet.name,
            name: planet.name,
            house: house.house,
            rashi: house.sign,
            sign: house.sign,
            isRetrograde: planet.retrograde,
            degree: planetData?.degreeInSign, // Add degree from planet data
          };
        })
      )
    : [];
  const d1Houses = kundaliData?.charts?.d1
    ? Object.values(kundaliData.charts.d1)
      .sort((a: any, b: any) => a.house - b.house)
      .map((house: any) => ({ rashi: house.sign, sign: house.sign }))
    : [];

  // Debug logging
  if (kundaliData?.charts?.d1 && d1Planets.length > 0) {
    console.log("[page.tsx] D1 data prepared:", {
      planetsCount: d1Planets.length,
      housesCount: d1Houses.length,
      samplePlanet: d1Planets[0],
      sampleHouse: d1Houses[0],
      allPlanets: d1Planets.map((p) => `${p.name} in H${p.house}`),
    });
  }
  const chandraPlanets = kundaliData?.charts?.chandra
    ? Object.values(kundaliData.charts.chandra)
      .sort((a: any, b: any) => a.house - b.house)
      .flatMap((house: any) =>
        house.planets.map((planet: any) => {
          const planetData = kundaliData.planets?.find(
            (p) => p.name === planet.name && p.sign === house.sign
          );
          return {
            planet: planet.name,
            name: planet.name,
            house: house.house,
            rashi: house.sign,
            sign: house.sign,
            isRetrograde: planet.retrograde,
            degree: planetData?.degreeInSign,
          };
        })
      )
    : [];
  const chandraHouses = kundaliData?.charts?.chandra
    ? Object.values(kundaliData.charts.chandra)
      .sort((a: any, b: any) => a.house - b.house)
      .map((house: any) => ({ rashi: house.sign, sign: house.sign }))
    : [];
  const d9Planets = kundaliData?.charts?.d9
    ? Object.values(kundaliData.charts.d9)
      .sort((a: any, b: any) => a.house - b.house)
      .flatMap((house: any) =>
        house.planets.map((planet: any) => {
          // Find planet in main planets array (only match by name, not sign)
          const mainPlanet = kundaliData.planets?.find(
            (p: any) => p.name === planet.name
          );

          // Debug: Log first planet to see structure
          if (planet.name === 'Sun') {
            console.log('[D9 Debug] Sun planet data:', {
              mainPlanet,
              degreeInSign: mainPlanet?.degreeInSign,
              allProps: Object.keys(mainPlanet || {})
            });
          }

          return {
            planet: planet.name,
            name: planet.name,
            house: house.house,
            rashi: house.sign,
            sign: house.sign,
            isRetrograde: planet.retrograde,
            degree: mainPlanet?.degreeInSign || 0,
          };
        })
      )
    : [];
  const d10Planets = kundaliData?.charts?.d10
    ? Object.values(kundaliData.charts.d10)
      .sort((a: any, b: any) => a.house - b.house)
      .flatMap((house: any) =>
        house.planets.map((planet: any) => {
          // Find planet in main planets array (only match by name, not sign)
          const mainPlanet = kundaliData.planets?.find(
            (p: any) => p.name === planet.name
          );
          return {
            planet: planet.name,
            name: planet.name,
            house: house.house,
            rashi: house.sign,
            sign: house.sign,
            isRetrograde: planet.retrograde,
            degree: mainPlanet?.degreeInSign || 0,
          };
        })
      )
    : [];

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        {/* Animated Cosmic Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

          {/* Animated Stars */}
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>

        <Navbar />
        <ChatBot />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12 relative">
            <div className="absolute top-0 right-0">
              <Button
                onClick={toggleLanguage}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                {language === "en" ? "हिंदी" : "EN"}
              </Button>
            </div>
            <p className="uppercase tracking-[0.3em] text-sm text-amber-600 mb-3">
              {t("kundali.subtitle") || "Precision Vedic Astrology"}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {t("kundali.title") || "Swiss Ephemeris Kundali"}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              {t("kundali.description")}
            </p>

            {/* Engine Status Indicator */}
            <div className="mt-6 flex justify-center">
              <AnimatePresence>
                {engineStatus !== 'online' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${engineStatus === 'starting' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${engineStatus === 'starting' ? 'bg-amber-500 animate-pulse' : 'bg-gray-400'}`} />
                    {engineStatus === 'starting' ? 'Waking up cosmic engine... (Almost ready)' : 'Initiating astrology engine...'}
                  </motion.div>
                )}
              </AnimatePresence>
              {engineStatus === 'online' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Cosmic engine ready
                </motion.div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-6 shadow-lg border border-amber-100">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="font-semibold text-gray-900">
                    {t("kundali.fullName")}
                  </Label>
                  <Input
                    placeholder={t("kundali.namePlaceholder")}
                    value={formData.name}
                    onChange={(event) =>
                      setFormData({ ...formData, name: event.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label className="font-semibold text-gray-900">
                    {t("kundali.gender") || "Gender"}
                  </Label>
                  <select
                    className="mt-2 w-full border rounded px-3 py-2 text-sm"
                    value={formData.gender}
                    onChange={(event) =>
                      setFormData({ ...formData, gender: event.target.value })
                    }
                  >
                    <option value="male">{t("kundali.male") || "Male"}</option>
                    <option value="female">
                      {t("kundali.female") || "Female"}
                    </option>
                  </select>
                </div>

                <div>
                  <Label className="font-semibold text-gray-900">
                    {t("kundali.dateOfBirth") || "Date of Birth"}
                  </Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <Input
                      placeholder={t("kundali.dayPlaceholder")}
                      type="number"
                      value={formData.day}
                      onChange={(event) =>
                        setFormData({ ...formData, day: event.target.value })
                      }
                      min={1}
                      max={31}
                      required
                    />
                    <Input
                      placeholder={t("kundali.monthPlaceholder")}
                      type="number"
                      value={formData.month}
                      onChange={(event) =>
                        setFormData({ ...formData, month: event.target.value })
                      }
                      min={1}
                      max={12}
                      required
                    />
                    <Input
                      placeholder={t("kundali.yearPlaceholder")}
                      type="number"
                      value={formData.year}
                      onChange={(event) =>
                        setFormData({ ...formData, year: event.target.value })
                      }
                      min={1900}
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="font-semibold text-gray-900">
                    {t("kundali.timeOfBirth") || "Time of Birth (24h)"}
                  </Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <Input
                      placeholder={t("kundali.hourPlaceholder")}
                      type="number"
                      value={formData.hour}
                      onChange={(event) =>
                        setFormData({ ...formData, hour: event.target.value })
                      }
                      min={0}
                      max={23}
                      required
                    />
                    <Input
                      placeholder={t("kundali.minutePlaceholder")}
                      type="number"
                      value={formData.minute}
                      onChange={(event) =>
                        setFormData({ ...formData, minute: event.target.value })
                      }
                      min={0}
                      max={59}
                      required
                    />
                    <Input
                      placeholder="SS"
                      type="number"
                      value={formData.second}
                      onChange={(event) =>
                        setFormData({ ...formData, second: event.target.value })
                      }
                      min={0}
                      max={59}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 notranslate" translate="no">
                  <LocationAutocomplete
                    value={formData.place}
                    onChange={(location) => {
                      setFormData({
                        ...formData,
                        place: location.city,
                        latitude: location.latitude.toString(),
                        longitude: location.longitude.toString(),
                      });
                    }}
                    label={t("kundali.placeOfBirth")}
                    placeholder={t("kundali.selectCity")}
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      id="manual-location-toggle"
                      type="checkbox"
                      checked={isManualLocation}
                      onChange={(event) =>
                        setIsManualLocation(event.target.checked)
                      }
                    />
                    <Label htmlFor="manual-location-toggle">
                      {t("kundali.manualLocation")}
                    </Label>
                  </div>
                </div>

                {isManualLocation && (
                  <div className="space-y-3 rounded-lg border border-dashed border-amber-300 p-3 bg-amber-50/30 notranslate" translate="no">
                    <Label className="text-sm font-semibold text-gray-900">
                      {t("kundali.cityTown")}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("kundali.manualCityPlaceholder")}
                        value={formData.place}
                        onChange={(event) => {
                          setFormData({ ...formData, place: event.target.value });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            fetchCoordinates(formData.place);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => fetchCoordinates(formData.place)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-800"
                      >
                        Find
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-semibold text-gray-900">
                          {t("kundali.latitude")}
                        </Label>
                        <Input
                          placeholder="e.g., 26.9124"
                          value={formData.latitude}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              latitude: event.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-900">
                          {t("kundali.longitude")}
                        </Label>
                        <Input
                          placeholder="e.g., 75.7873"
                          value={formData.longitude}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              longitude: event.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="font-semibold text-gray-900">
                    {t("kundali.timezoneOffset") || "Timezone Offset"}
                  </Label>
                  <Input
                    className="mt-2"
                    placeholder="+05:30"
                    value={formData.timezone}
                    onChange={(event) =>
                      setFormData({ ...formData, timezone: event.target.value })
                    }
                    required
                    suppressHydrationWarning
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white notranslate"
                  translate="no"
                  disabled={isLoading}
                  suppressHydrationWarning
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("kundali.generating")}
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      {t("kundali.generateKundali")}
                    </>
                  )}
                </Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-8" ref={resultsRef}>
              {!kundaliData && (
                <Card className="p-8 h-full flex flex-col justify-center border-dashed border-amber-300">
                  <div className="text-center space-y-3">
                    <Compass className="mx-auto h-12 w-12 text-amber-600" />
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {t("kundali.awaitingTitle")}
                    </h3>
                    <p className="text-gray-600">{t("kundali.awaitingDesc")}</p>
                  </div>
                </Card>
              )}

              {kundaliData && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-5 bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-3">
                        <Sun className="h-8 w-8 text-amber-600" />
                        <div>
                          <p className="text-xs uppercase tracking-widest text-amber-700">
                            {t("kundali.sunSign")}
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            {t(`sign.${kundaliData.sunSign}`)}
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-5 bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <Moon className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-xs uppercase tracking-widest text-blue-700">
                            {t("kundali.moonSign")}
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            {t(`sign.${kundaliData.moonSign}`) || kundaliData.moonSign}
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-5 bg-purple-50 border border-purple-200">
                      <div className="flex items-center gap-3">
                        <Star className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="text-xs uppercase tracking-widest text-purple-700">
                            {t("kundali.ascendant")}
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            {t(`sign.${kundaliData.ascendant.sign}`) || kundaliData.ascendant.sign}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Card className="p-6 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="text-xs uppercase tracking-widest text-gray-500">
                            {t("kundali.localBirthTime") || "Local Birth Time"}
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatDate(kundaliData.basicDetails.birthDate)} —{" "}
                            {kundaliData.basicDetails.localTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs uppercase tracking-widest text-gray-500">
                            {t("kundali.utcTime") || "UTC Time"}
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatTime(kundaliData.basicDetails.utc)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-xs uppercase tracking-widest text-gray-500">
                            {t("kundali.ayanamsa") || "Ayanamsa (Lahiri)"}
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {kundaliData.ayanamsa?.toFixed(6) ?? 'N/A'}°
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-rose-600" />
                        <div>
                          {kundaliData.basicDetails.location.city}{" "}
                          <span className="text-gray-500">
                            (
                            {kundaliData.basicDetails.location.latitude?.toFixed(
                              4
                            ) ?? '0.0000'}
                            °,{" "}
                            {kundaliData.basicDetails.location.longitude?.toFixed(
                              4
                            ) ?? '0.0000'}
                            °)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Compass className="h-4 w-4 text-emerald-600" />
                        <span>
                          {t("kundali.timezone") || "Timezone"} {kundaliData.basicDetails.timezone}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap gap-3 justify-center"
                    >
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={selectedChart === "d1" ? "default" : "outline"}
                          className={
                            selectedChart === "d1"
                              ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg"
                              : "border-2 border-amber-300 text-amber-800 hover:bg-amber-50"
                          }
                          onClick={() => setSelectedChart("d1")}
                        >
                          ✨ {t("kundali.lagnaChart")}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={
                            selectedChart === "chandra" ? "default" : "outline"
                          }
                          className={
                            selectedChart === "chandra"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg"
                              : "border-2 border-blue-300 text-blue-800 hover:bg-blue-50"
                          }
                          onClick={() => setSelectedChart("chandra")}
                        >
                          🌙 {t("kundali.chandraChart")}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={selectedChart === "d9" ? "default" : "outline"}
                          className={
                            selectedChart === "d9"
                              ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
                              : "border-2 border-purple-300 text-purple-800 hover:bg-purple-50"
                          }
                          onClick={() => setSelectedChart("d9")}
                        >
                          💫 {t("kundali.navamsaChart")}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={
                            selectedChart === "d10" ? "default" : "outline"
                          }
                          className={
                            selectedChart === "d10"
                              ? "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg"
                              : "border-2 border-indigo-300 text-indigo-800 hover:bg-indigo-50"
                          }
                          onClick={() => setSelectedChart("d10")}
                        >
                          ⭐ {t("kundali.dashamsaChart")}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={
                            selectedChart === "gochar" ? "default" : "outline"
                          }
                          className={
                            selectedChart === "gochar"
                              ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                              : "border-2 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                          }
                          onClick={() => setSelectedChart("gochar")}
                        >
                          🌍 {t("kundali.gocharChart") || "Gochar (Transit)"}
                        </Button>
                      </motion.div>
                    </motion.div>

                    {selectedChart === "d1" && (
                      <Card className="p-4 shadow-sm border border-amber-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                          {t("kundali.lagnaKundaliTitle")}
                        </h3>
                        <NorthIndianKundali
                          key={`d1-${kundaliData?.ascendant?.degree}-${Date.now()}`}
                          planets={d1Planets}
                          houses={d1Houses}
                        />
                      </Card>
                    )}

                    {selectedChart === "chandra" && (
                      <Card className="p-4 shadow-sm border border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                          {t("kundali.chandraKundaliTitle")}
                        </h3>
                        <ChandraKundaliChart
                          key={`chandra-${kundaliData?.moonSign}-${Date.now()}`}
                          planets={chandraPlanets}
                          houses={chandraHouses}
                        />
                      </Card>
                    )}

                    {selectedChart === "d9" && (
                      <Card className="p-4 shadow-sm border border-purple-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                          {t("kundali.navamsaTitle")}
                        </h3>
                        <NavmaanshKundaliChart
                          key={`d9-${kundaliData?.ayanamsa}-${Date.now()}`}
                          title="Navamsa (D9)"
                          planets={d9Planets}
                          placements={kundaliData.charts.d9}
                        />
                      </Card>
                    )}

                    {selectedChart === "d10" && (
                      <Card className="p-4 shadow-sm border border-indigo-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                          {t("kundali.dashamsaTitle")}
                        </h3>
                        <NavmaanshKundaliChart
                          key={`d10-${kundaliData?.sunSign}-${Date.now()}`}
                          title="Dashamsa (D10)"
                          planets={d10Planets}
                          placements={kundaliData.charts.d10}
                        />
                      </Card>
                    )}

                    {selectedChart === "gochar" && (
                      <Card className="p-6 shadow-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                        <div className="flex items-center justify-between mb-4">
                          <motion.h3
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600"
                          >
                            🌍 {t("kundali.gocharTitle") || "Gochar Kundali (Current Transits)"}
                          </motion.h3>
                          <Button
                            onClick={fetchGocharData}
                            disabled={isLoadingGochar || !kundaliData}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                          >
                            {isLoadingGochar ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {language === "hi" ? "लोड हो रहा है..." : "Loading..."}
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                {language === "hi" ? "ताज़ा करें" : "Refresh Transit"}
                              </>
                            )}
                          </Button>
                        </div>

                        {!gocharData ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white bg-opacity-60 rounded-xl p-8 text-center"
                          >
                            <Compass className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
                            <p className="text-lg font-semibold text-emerald-900 mb-2">
                              {language === "hi" ? "गोचर चार्ट देखने के लिए क्लिक करें" : "Click to View Current Transit Chart"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {language === "hi"
                                ? "वर्तमान ग्रह स्थिति और उनके प्रभाव देखें"
                                : "See current planetary positions and their effects"}
                            </p>
                          </motion.div>
                        ) : (
                          <>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 }}
                              className="bg-white bg-opacity-60 rounded-xl p-6 mb-4"
                            >
                              <div className="text-center space-y-2">
                                <p className="text-lg font-semibold text-emerald-900">
                                  {language === "hi" ? "वर्तमान ग्रह स्थिति" : "Current Planetary Positions"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date().toLocaleDateString(language === "hi" ? 'hi-IN' : 'en-IN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </motion.div>

                            {/* Gochar Chart */}
                            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 border-2 border-emerald-200 mb-4">
                              <NorthIndianKundali
                                key={`gochar-${gocharData.ayanamsa}`}
                                planets={gocharData.planets.map((planet) => ({
                                  planet: planet.name,
                                  name: planet.name,
                                  house: planet.house,
                                  rashi: planet.sign,
                                  sign: planet.sign,
                                  degree: planet.degreeInSign,
                                  isRetrograde: planet.isRetrograde,
                                }))}
                                houses={gocharData.houses.map((house) => ({
                                  rashi: house.sign,
                                  sign: house.sign
                                }))}
                              />
                            </div>

                            {/* Nakshatra Highlights */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-xl p-5 mb-4"
                            >
                              <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                <Star className="w-5 h-5" />
                                {language === "hi" ? "नक्षत्र स्थिति" : "Nakshatra Positions"}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {gocharData.planets?.slice(0, 9).map((planet, idx) => (
                                  <motion.div
                                    key={planet.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + idx * 0.05 }}
                                    className="bg-white bg-opacity-80 rounded-lg p-3 border border-amber-200"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold text-amber-900">
                                        {language === "hi" ? t(`planet.${planet.name}`) : planet.name}
                                      </span>
                                      <span className="text-sm text-amber-700 font-medium">
                                        {planet.nakshatra.name} ({language === "hi" ? "पद" : "Pada"} {planet.nakshatra.pada})
                                      </span>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>

                            {/* Information */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                              className="bg-emerald-100 border-2 border-emerald-300 rounded-xl p-5"
                            >
                              <div className="flex items-start gap-3">
                                <div className="text-3xl">ℹ️</div>
                                <div>
                                  <p className="font-bold text-emerald-900 mb-2">
                                    {language === "hi" ? "गोचर के बारे में" : "About Gochar (Transits)"}
                                  </p>
                                  <p className="text-sm text-emerald-800">
                                    {language === "hi"
                                      ? "गोचर आकाश में ग्रहों की वर्तमान स्थिति दिखाता है और वे आपके जन्म कुंडली के विभिन्न घरों से कैसे गुजरते हैं। ये गोचर आपके जीवन के विभिन्न पहलुओं को प्रभावित करते हैं और अनुकूल या चुनौतीपूर्ण अवधि का संकेत दे सकते हैं।"
                                      : "Gochar shows the current positions of planets in the sky and how they transit through different houses of your birth chart. These transits influence various aspects of your life and can indicate favorable or challenging periods."}
                                  </p>
                                  <p className="text-xs text-emerald-700 mt-2 italic">
                                    {language === "hi"
                                      ? "नोट: सटीक गोचर भविष्यवाणियों के लिए, हमारे विशेषज्ञ ज्योतिषियों से परामर्श करें जो आपके जन्म कुंडली और वर्तमान गोचर के संयुक्त प्रभावों का विश्लेषण कर सकते हैं।"
                                      : "Note: For accurate transit predictions, consult with our expert astrologers who can analyze the combined effects of your birth chart and current transits."}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </Card>
                    )}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card className="p-6 shadow-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 overflow-x-auto">
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-4"
                      >
                        🪐 {t("kundali.planetaryPositions")}
                      </motion.h3>
                      <table className="min-w-full text-sm text-left">
                        <thead>
                          <tr className="text-gray-600 uppercase tracking-widest text-xs bg-white bg-opacity-50">
                            <th className="pb-3 pt-2 px-2">{t("kundali.planet")}</th>
                            <th className="pb-3 pt-2 px-2">{t("kundali.sign")}</th>
                            <th className="pb-3 pt-2 px-2">{t("kundali.house")}</th>
                            <th className="pb-3 pt-2 px-2">{t("kundali.degree")}</th>
                            <th className="pb-3 pt-2 px-2">{t("kundali.nakshatra")}</th>
                            <th className="pb-3 pt-2 px-2">{t("kundali.status")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kundaliData.planets.map((planet, index) => (
                            <motion.tr
                              key={planet.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ backgroundColor: "rgba(255,255,255,0.8)", scale: 1.01 }}
                              className="border-t-2 border-dashed border-indigo-100 text-gray-800 transition-all"
                            >
                              <td className="py-3 px-2 font-bold text-indigo-900">
                                {t(`planet.${planet.name}`) || planet.name}
                              </td>
                              <td className="py-3 px-2 font-semibold text-blue-800">
                                {t(`sign.${planet.sign}`) || planet.sign}
                              </td>
                              <td className="py-3 px-2">
                                <span className="bg-indigo-100 px-2 py-1 rounded-full text-indigo-900 font-semibold">
                                  {planet.house}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-mono text-purple-700 font-semibold">
                                {planet.degreeInSign.toFixed(2)}°
                              </td>
                              <td className="py-3 px-2 text-gray-700">
                                {planet.nakshatra.name} ({t("kundali.pada")} {planet.nakshatra.pada})
                              </td>
                              <td className="py-3 px-2 text-xs">
                                <div className="flex flex-col gap-1">
                                  <span className={`px-2 py-0.5 rounded-full font-semibold ${planet.isRetrograde
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                    }`}>
                                    {planet.isRetrograde
                                      ? t("kundali.retrograde")
                                      : t("kundali.direct")}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full font-semibold ${planet.benefic
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {planet.benefic
                                      ? t("kundali.benefic")
                                      : t("kundali.malefic")}
                                  </span>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>

                    <div className="space-y-6">
                      <Card className="p-6 shadow-lg border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
                        <motion.h3
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mb-4"
                        >
                          🏠 {t("kundali.houseCusps")}
                        </motion.h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {kundaliData.houses.map((house, index) => (
                            <motion.div
                              key={house.house}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.03 }}
                              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.9)" }}
                              className="flex items-center justify-between border-2 border-teal-200 bg-white bg-opacity-60 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all"
                            >
                              <span className="font-bold text-teal-900">
                                {t("kundali.houseLabel")} {house.house}
                              </span>
                              <span className="font-semibold text-cyan-800">
                                {t(`sign.${house.sign}`) || house.sign} — {formatDegree(house.cusp)}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {t("kundali.nakshatraHighlights")}
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">
                              {t("kundali.sun")}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {kundaliData.nakshatras.sun
                                ? `${kundaliData.nakshatras.sun.name} (${t("kundali.pada")} ${kundaliData.nakshatras.sun.pada})`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">
                              {t("kundali.moon")}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {kundaliData.nakshatras.moon
                                ? `${kundaliData.nakshatras.moon.name} (${t("kundali.pada")} ${kundaliData.nakshatras.moon.pada})`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">
                              {t("kundali.ascendant")}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {kundaliData.nakshatras.ascendant.name} ({t("kundali.pada")} {kundaliData.nakshatras.ascendant.pada})
                            </span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <Card className="p-6 shadow-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                    <motion.h3
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6 text-center"
                    >
                      ✨ {t("kundali.dashaTimeline")} ✨
                    </motion.h3>

                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mb-6 rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-4 shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-md"
                        >
                          ✦
                        </motion.div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">
                            {t("kundali.currentMahadasha")}
                          </p>
                          <p className="text-xl font-bold text-emerald-900">
                            {t(`planet.${kundaliData.dashas.current.planet}`) || kundaliData.dashas.current.planet}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-emerald-800 font-medium flex items-center gap-2">
                        📅 {kundaliData.dashas.current.startDate} {t("kundali.to")} {kundaliData.dashas.current.endDate}
                        <span className="text-xs bg-emerald-200 px-2 py-1 rounded-full">
                          {kundaliData.dashas.current.years.toFixed(2)} {t("kundali.years")}
                        </span>
                      </p>
                    </motion.div>

                    <div className="space-y-3">
                      {kundaliData.dashas.mahadashas.map((dasha, index) => {
                        const planetColors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
                          'Sun': { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-900', gradient: 'from-orange-400 to-red-500' },
                          'Moon': { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-900', gradient: 'from-blue-400 to-cyan-500' },
                          'Mars': { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-900', gradient: 'from-red-500 to-pink-600' },
                          'Mercury': { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-900', gradient: 'from-green-400 to-emerald-500' },
                          'Jupiter': { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-900', gradient: 'from-yellow-400 to-amber-500' },
                          'Venus': { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-900', gradient: 'from-pink-400 to-rose-500' },
                          'Saturn': { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-900', gradient: 'from-indigo-500 to-purple-600' },
                          'Rahu': { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-900', gradient: 'from-purple-500 to-violet-600' },
                          'Ketu': { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-900', gradient: 'from-gray-500 to-slate-600' },
                        };
                        const colors = planetColors[dasha.planet] || { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-900', gradient: 'from-gray-400 to-gray-600' };
                        const isCurrent = dasha.planet === kundaliData.dashas.current.planet;

                        const isExpanded = expandedDasha === `${dasha.planet}-${dasha.startDate}` || (expandedDasha === null && isCurrent);

                        // Debug logging
                        if (index === 0) {
                          console.log('Dasha Debug:', {
                            planet: dasha.planet,
                            hasAntardashas: !!dasha.antardashas,
                            antardashasLength: dasha.antardashas?.length,
                            isExpanded,
                            expandedDasha
                          });
                        }

                        return (
                          <motion.div
                            key={`${dasha.planet}-${dasha.startDate}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
                            className={`border-2 ${colors.border} ${colors.bg} rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${isCurrent ? 'ring-4 ring-emerald-400 ring-opacity-50' : ''}`}
                            onClick={() => setExpandedDasha(isExpanded ? null : `${dasha.planet}-${dasha.startDate}`)}
                          >
                            <div className="px-5 py-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <motion.div
                                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                                  >
                                    {dasha.planet.charAt(0)}
                                  </motion.div>
                                  <div>
                                    <p className={`text-lg font-bold ${colors.text} flex items-center gap-2`}>
                                      {t(`planet.${dasha.planet}`) || dasha.planet}
                                      {isCurrent && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-pulse">{t("kundali.active") || "ACTIVE"}</span>}
                                    </p>
                                    <p className="text-sm text-gray-700 font-medium">
                                      {dasha.startDate} → {dasha.endDate}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xs font-semibold ${colors.text} bg-white px-3 py-1 rounded-full shadow-sm`}>
                                    {dasha.years.toFixed(2)} {t("kundali.years")}
                                  </p>
                                  <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-2 text-gray-600"
                                  >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                  </motion.div>
                                </div>
                              </div>

                              <AnimatePresence mode="wait">
                                {isExpanded && dasha.antardashas && Array.isArray(dasha.antardashas) && dasha.antardashas.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-4 pt-4 border-t-2 border-dashed border-gray-300"
                                  >
                                    <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                      <span className="text-lg">🔮</span> {t("kundali.antardashas") || "Antardasha Periods:"}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {dasha.antardashas.map((antardasha: any, idx: number) => (
                                        <motion.div
                                          key={idx}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className="bg-white bg-opacity-70 rounded-lg px-3 py-2 text-xs border border-gray-200 hover:shadow-md transition-shadow"
                                        >
                                          <p className="font-semibold text-gray-800">{t(`planet.${antardasha.planet}`) || antardasha.planet}</p>
                                          <p className="text-gray-600">{antardasha.startDate} → {antardasha.endDate}</p>
                                          <p className="text-gray-500">{antardasha.years.toFixed(2)} {t("kundali.yrs") || "yrs"}</p>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
