'use client';
import React from 'react';
import NorthIndianKundali from './NorthIndianKundali';

type ChartData = {
  planets?: Array<{
    planet?: string;
    name?: string;
    house?: number;
    rashi?: string;
    degree?: number;
    degreeInSign?: number;
  }>;
  houses?: any[];
};

export default function NorthIndianChart({
  chartData,
  showDetails,
}: {
  chartData: ChartData;
  showDetails?: boolean;
}) {
  const planets = (chartData?.planets || []).map((p: any) => ({
    name: p.name || p.planet,
    house: p.house,
    sign: p.rashi,
    degreeInSign: p.degreeInSign || p.degree, // Use degreeInSign for chart display
  }));

  const houses = chartData?.houses || [];

  return <NorthIndianKundali planets={planets} houses={houses} />;
}
