'use client';

import React from 'react';
import NorthIndianKundali from './NorthIndianKundali';

interface ChandraKundaliChartProps {
  planets: any[];
  houses: any[];
}

export default function ChandraKundaliChart({
  planets,
  houses,
}: ChandraKundaliChartProps) {
  // Placements for Chandra chart are already computed on the server
  // (kundaliData.charts.chandra). We simply render them using the same
  // North Indian SVG logic as Lagna, keeping data exactly as provided.
  return <NorthIndianKundali planets={planets} houses={houses} />;
}
