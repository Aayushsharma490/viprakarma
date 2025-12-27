'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react';
import NorthIndianKundali from '@/components/NorthIndianKundali';

interface ChatUserAstroSidebarProps {
    sessionId: number;
    kundaliData: any;
    numerologyData: any;
    birthDetails: {
        birthDate: string;
        birthTime: string;
        birthPlace: string;
    } | null;
}

export default function ChatUserAstroSidebar({
    sessionId,
    kundaliData,
    numerologyData,
    birthDetails,
}: ChatUserAstroSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (!kundaliData && !numerologyData) {
        return null;
    }

    // Prepare Kundali chart data
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

    // Current Dasha
    const currentDasha = kundaliData?.dashas?.current;

    return (
        <div className={`relative transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80'}`}>
            {/* Collapse/Expand Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -left-3 top-4 z-10 rounded-full w-6 h-6 p-0 bg-white shadow-md"
            >
                {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>

            {!isCollapsed && (
                <Card className="h-full overflow-y-auto p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">User Details</h3>

                    {/* Birth Details Summary */}
                    {birthDetails && (
                        <div className="mb-4 p-3 bg-amber-50 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-amber-600" />
                                <span className="text-gray-700">{new Date(birthDetails.birthDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span className="text-gray-700">{birthDetails.birthTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-amber-600" />
                                <span className="text-gray-700">{birthDetails.birthPlace}</span>
                            </div>
                        </div>
                    )}

                    {/* Tabs for Kundali, Dasha, Numerology */}
                    <Tabs defaultValue="kundali" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="kundali">Kundali</TabsTrigger>
                            <TabsTrigger value="dasha">Dasha</TabsTrigger>
                            <TabsTrigger value="numerology">Numbers</TabsTrigger>
                        </TabsList>

                        {/* Kundali Tab */}
                        <TabsContent value="kundali" className="space-y-4">
                            {kundaliData ? (
                                <>
                                    <div className="text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Sun Sign:</span>
                                            <span className="font-medium">{kundaliData.sunSign}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Moon Sign:</span>
                                            <span className="font-medium">{kundaliData.moonSign}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ascendant:</span>
                                            <span className="font-medium">{kundaliData.ascendant?.sign}</span>
                                        </div>
                                    </div>

                                    {/* Mini Kundali Chart */}
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold mb-2">Birth Chart (D1)</h4>
                                        <div className="scale-75 origin-top-left">
                                            <NorthIndianKundali
                                                planets={d1Planets}
                                                houses={d1Houses}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">No Kundali data available</p>
                            )}
                        </TabsContent>

                        {/* Dasha Tab */}
                        <TabsContent value="dasha" className="space-y-4">
                            {currentDasha ? (
                                <div className="space-y-3">
                                    <div className="p-3 bg-amber-50 rounded-lg">
                                        <h4 className="text-sm font-semibold text-amber-900 mb-2">Current Mahadasha</h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Planet:</span>
                                                <span className="font-medium">{currentDasha.planet}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Start:</span>
                                                <span className="text-gray-700">{new Date(currentDasha.startDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">End:</span>
                                                <span className="text-gray-700">{new Date(currentDasha.endDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Duration:</span>
                                                <span className="text-gray-700">{currentDasha.years} years</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upcoming Dashas */}
                                    {kundaliData?.dashas?.mahadashas && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Upcoming Dashas</h4>
                                            <div className="space-y-2">
                                                {kundaliData.dashas.mahadashas.slice(0, 3).map((dasha: any, index: number) => (
                                                    <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                                                        <div className="font-medium">{dasha.planet}</div>
                                                        <div className="text-gray-600">
                                                            {new Date(dasha.startDate).getFullYear()} - {new Date(dasha.endDate).getFullYear()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No Dasha data available</p>
                            )}
                        </TabsContent>

                        {/* Numerology Tab */}
                        <TabsContent value="numerology" className="space-y-4">
                            {numerologyData ? (
                                <div className="space-y-3">
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <h4 className="text-sm font-semibold text-purple-900 mb-2">Life Path Number</h4>
                                        <div className="text-3xl font-bold text-purple-600 text-center">
                                            {numerologyData.lifePathNumber}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-gray-600">Destiny Number:</span>
                                            <span className="font-bold text-purple-600">{numerologyData.destinyNumber}</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-gray-600">Soul Urge Number:</span>
                                            <span className="font-bold text-purple-600">{numerologyData.soulUrgeNumber}</span>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500 mt-4">
                                        <p><strong>Life Path:</strong> Your life's purpose and journey</p>
                                        <p><strong>Destiny:</strong> What you're meant to accomplish</p>
                                        <p><strong>Soul Urge:</strong> Your inner desires and motivations</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No Numerology data available</p>
                            )}
                        </TabsContent>
                    </Tabs>
                </Card>
            )}
        </div>
    );
}
