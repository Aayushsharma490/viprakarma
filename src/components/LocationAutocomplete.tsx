'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationOption {
    name: string;
    state?: string;
    country?: string;
    latitude: number;
    longitude: number;
    displayName: string;
}

interface LocationAutocompleteProps {
    value: string;
    onChange: (location: { city: string; latitude: number; longitude: number }) => void;
    label?: string;
    placeholder?: string;
}

export default function LocationAutocomplete({ value, onChange, label, placeholder }: LocationAutocompleteProps) {
    const { language } = useLanguage();
    const [searchTerm, setSearchTerm] = useState(value);
    const [options, setOptions] = useState<LocationOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setOptions([]);
            setShowDropdown(false);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/cities/search?q=${encodeURIComponent(searchTerm)}`);
                if (response.ok) {
                    const data = await response.json();
                    setOptions(data.cities || []);
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error('Location search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSelect = (option: LocationOption) => {
        setSearchTerm(option.displayName);
        setShowDropdown(false);
        onChange({
            city: option.displayName,
            latitude: option.latitude,
            longitude: option.longitude
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 mb-2 block">
                    {label}
                </Label>
            )}
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder || (language === 'en' ? 'Type city name...' : 'शहर का नाम टाइप करें...')}
                    className="h-14 bg-background/50 border-border rounded-2xl pl-11 pr-11"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
                )}
            </div>

            {showDropdown && options.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelect(option)}
                            className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-border last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                        >
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-foreground text-sm truncate">
                                        {option.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {option.state && `${option.state}, `}{option.country}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                                        {option.latitude.toFixed(4)}°, {option.longitude.toFixed(4)}°
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {showDropdown && options.length === 0 && !loading && searchTerm.trim().length >= 2 && value.trim().length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        {language === 'en' ? 'No locations found' : 'कोई स्थान नहीं मिला'}
                    </p>
                </div>
            )}
        </div>
    );
}
