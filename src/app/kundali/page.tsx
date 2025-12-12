"use client";
export const dynamic = 'force-dynamic';

import { useRef, useState } from "react";
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
import { indianCities } from "@/lib/locations";
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
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [selectedChart, setSelectedChart] = useState<
    "d1" | "chandra" | "d9" | "d10"
  >("d1");

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

  // Removed duplicate declarations of d1Planets and d1Houses
  // Use backend data directly for all charts
  const d1Planets = kundaliData?.charts?.d1
    ? Object.values(kundaliData.charts.d1)
      .sort((a: any, b: any) => a.house - b.house)
      .flatMap((house: any) =>
        house.planets.map((planet: any) => ({
          planet: planet.name,
          name: planet.name,
          house: house.house,
          rashi: house.sign,
          sign: house.sign,
          isRetrograde: planet.retrograde,
        }))
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
        house.planets.map((planet: any) => ({
          planet: planet.name,
          name: planet.name,
          house: house.house,
          rashi: house.sign,
          sign: house.sign,
          isRetrograde: planet.retrograde,
        }))
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
        house.planets.map((planet: any) => ({
          planet: planet.name,
          name: planet.name,
          house: house.house,
          rashi: house.sign,
          sign: house.sign,
          isRetrograde: planet.retrograde,
        }))
      )
    : [];
  const d10Planets = kundaliData?.charts?.d10
    ? Object.values(kundaliData.charts.d10)
      .sort((a: any, b: any) => a.house - b.house)
      .flatMap((house: any) =>
        house.planets.map((planet: any) => ({
          planet: planet.name,
          name: planet.name,
          house: house.house,
          rashi: house.sign,
          sign: house.sign,
          isRetrograde: planet.retrograde,
        }))
      )
    : [];

  return (
    <>
      <div className="min-h-screen bg-white">
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
                  <Label className="font-semibold text-gray-900">
                    {t("kundali.placeOfBirth")}
                  </Label>
                  <Select
                    onValueChange={handleLocationChange}
                    value={formData.place}
                    disabled={isManualLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("kundali.selectCity")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {indianCities.map((city) => (
                        <SelectItem key={city.city} value={city.city}>
                          {city.city}, {city.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                            Ayanamsa (Lahiri)
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
                          Timezone {kundaliData.basicDetails.timezone}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button
                        variant={selectedChart === "d1" ? "default" : "outline"}
                        className={
                          selectedChart === "d1"
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "border-amber-200 text-amber-800"
                        }
                        onClick={() => setSelectedChart("d1")}
                      >
                        {t("kundali.lagnaChart")}
                      </Button>
                      <Button
                        variant={
                          selectedChart === "chandra" ? "default" : "outline"
                        }
                        className={
                          selectedChart === "chandra"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "border-blue-200 text-blue-800"
                        }
                        onClick={() => setSelectedChart("chandra")}
                      >
                        {t("kundali.chandraChart")}
                      </Button>
                      <Button
                        variant={selectedChart === "d9" ? "default" : "outline"}
                        className={
                          selectedChart === "d9"
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "border-purple-200 text-purple-800"
                        }
                        onClick={() => setSelectedChart("d9")}
                      >
                        {t("kundali.navamsaChart")}
                      </Button>
                      <Button
                        variant={
                          selectedChart === "d10" ? "default" : "outline"
                        }
                        className={
                          selectedChart === "d10"
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                            : "border-indigo-200 text-indigo-800"
                        }
                        onClick={() => setSelectedChart("d10")}
                      >
                        {t("kundali.dashamsaChart")}
                      </Button>
                    </div>

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
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card className="p-6 shadow-sm border border-gray-100 overflow-x-auto">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {t("kundali.planetaryPositions")}
                      </h3>
                      <table className="min-w-full text-sm text-left">
                        <thead>
                          <tr className="text-gray-600 uppercase tracking-widest text-xs">
                            <th className="pb-2">{t("kundali.planet")}</th>
                            <th className="pb-2">{t("kundali.sign")}</th>
                            <th className="pb-2">{t("kundali.house")}</th>
                            <th className="pb-2">{t("kundali.degree")}</th>
                            <th className="pb-2">{t("kundali.nakshatra")}</th>
                            <th className="pb-2">{t("kundali.status")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kundaliData.planets.map((planet) => (
                            <tr
                              key={planet.name}
                              className="border-t border-dashed border-gray-100 text-gray-800"
                            >
                              <td className="py-2 font-semibold">
                                {t(`planet.${planet.name}`) || planet.name}
                              </td>
                              <td className="py-2">
                                {t(`sign.${planet.sign}`) || planet.sign}
                              </td>
                              <td className="py-2">{planet.house}</td>
                              <td className="py-2">
                                {planet.degreeInSign.toFixed(2)}°
                              </td>
                              <td className="py-2">
                                {planet.nakshatra.name} ({t("kundali.pada")}{" "}
                                {planet.nakshatra.pada})
                              </td>
                              <td className="py-2 text-sm">
                                {planet.isRetrograde
                                  ? t("kundali.retrograde")
                                  : t("kundali.direct")}{" "}
                                ·{" "}
                                {planet.benefic
                                  ? t("kundali.benefic")
                                  : t("kundali.malefic")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>

                    <div className="space-y-6">
                      <Card className="p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {t("kundali.houseCusps")}
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {kundaliData.houses.map((house) => (
                            <div
                              key={house.house}
                              className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2"
                            >
                              <span className="text-gray-600">
                                {t("kundali.houseLabel")} {house.house}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {t(`sign.${house.sign}`) || house.sign} — {formatDegree(house.cusp)}
                              </span>
                            </div>
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
                                ? `${kundaliData.nakshatras.sun.name} ({t("kundali.pada")} ${kundaliData.nakshatras.sun.pada
                                })`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">
                              {t("kundali.moon")}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {kundaliData.nakshatras.moon
                                ? `${kundaliData.nakshatras.moon.name} ({t("kundali.pada")} ${kundaliData.nakshatras.moon.pada
                                })`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">
                              {t("kundali.ascendant")}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {kundaliData.nakshatras.ascendant.name} (
                              {t("kundali.pada")}{" "}
                              {kundaliData.nakshatras.ascendant.pada})
                            </span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <Card className="p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t("kundali.dashaTimeline")}
                    </h3>
                    <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-sm font-semibold text-emerald-800">
                        {t("kundali.currentMahadasha")} —{" "}
                        {kundaliData.dashas.current.planet}
                      </p>
                      <p className="text-xs text-emerald-700">
                        {kundaliData.dashas.current.startDate} {t("kundali.to")}{" "}
                        {kundaliData.dashas.current.endDate} (
                        {kundaliData.dashas.current.years.toFixed(2)}{" "}
                        {t("kundali.years")})
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {kundaliData.dashas.mahadashas.map((dasha) => (
                        <div
                          key={`${dasha.planet}-${dasha.startDate}`}
                          className="border border-gray-100 rounded-lg px-4 py-3 text-sm"
                        >
                          <p className="font-semibold text-gray-900">
                            {dasha.planet}
                          </p>
                          <p className="text-gray-600">
                            {dasha.startDate} → {dasha.endDate}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t("kundali.duration")}: {dasha.years.toFixed(2)}{" "}
                            {t("kundali.years")}
                          </p>
                        </div>
                      ))}
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
