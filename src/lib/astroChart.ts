// AstroChart integration for rendering Vedic astrology charts
// Uses @astrodraw/astrochart for SVG chart generation

import { drawChart } from '@astrodraw/astrochart';

export interface ChartPlanet {
  name: string;
  longitude: number;
  sign?: string;
  house?: number;
  retrograde?: boolean;
}

export interface ChartData {
  planets: ChartPlanet[];
  houses: Array<{
    cusp: number;
    house: number;
  }>;
  ascendant: number;
  midheaven?: number;
}

export class AstroChartRenderer {
  /**
   * Convert our internal chart data to AstroChart format
   */
  private convertToAstroChartFormat(chartData: ChartData) {
    return {
      planets: chartData.planets.map(planet => ({
        name: planet.name,
        longitude: planet.longitude,
        retrograde: planet.retrograde || false,
      })),
      cusps: chartData.houses.map(house => house.cusp),
      ascendant: chartData.ascendant,
      midheaven: chartData.midheaven || (chartData.ascendant + 90) % 360,
    };
  }

  /**
   * Render chart as SVG string
   */
  async renderChart(chartData: ChartData, options: {
    width?: number;
    height?: number;
    style?: 'north' | 'south' | 'east';
    colors?: {
      background?: string;
      signs?: string[];
      planets?: { [key: string]: string };
    };
  } = {}): Promise<string> {
    try {
      const astroChartData = this.convertToAstroChartFormat(chartData);

      const defaultOptions = {
        width: 400,
        height: 400,
        style: 'north' as const,
        colors: {
          background: '#ffffff',
          signs: [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd',
            '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9', '#f8c471', '#82e0aa'
          ],
          planets: {
            Sun: '#ff6b35',
            Moon: '#f7f1e3',
            Mars: '#ff3838',
            Mercury: '#34ace0',
            Jupiter: '#ffb142',
            Venus: '#ff9ff3',
            Saturn: '#57606f',
            Rahu: '#2f3542',
            Ketu: '#57606f'
          }
        },
        ...options
      };

      // AstroChart expects specific format
      const chartConfig = {
        ...astroChartData,
        ...defaultOptions,
      };

      const svgString = await drawChart(chartConfig);
      return svgString;

    } catch (error) {
      console.error('Failed to render chart:', error);
      throw new Error(`Chart rendering failed: ${error}`);
    }
  }

  /**
   * Render North Indian style chart (square houses)
   */
  async renderNorthIndianChart(chartData: ChartData, size = 400): Promise<string> {
    return this.renderChart(chartData, {
      width: size,
      height: size,
      style: 'north',
    });
  }

  /**
   * Render South Indian style chart (diamond houses)
   */
  async renderSouthIndianChart(chartData: ChartData, size = 400): Promise<string> {
    return this.renderChart(chartData, {
      width: size,
      height: size,
      style: 'south',
    });
  }

  /**
   * Render East Indian style chart
   */
  async renderEastIndianChart(chartData: ChartData, size = 400): Promise<string> {
    return this.renderChart(chartData, {
      width: size,
      height: size,
      style: 'east',
    });
  }

  /**
   * Create a simple chart preview (text-based)
   */
  createTextChart(chartData: ChartData): string {
    const lines: string[] = [];

    lines.push('┌─────────────────────────────────────┐');
    lines.push('│           VEDIC CHART               │');
    lines.push('├─────────────────────────────────────┤');

    // Show ascendant
    const ascendantSign = this.getSignFromLongitude(chartData.ascendant);
    lines.push(`│ Ascendant: ${ascendantSign.padEnd(25)} │`);

    lines.push('├─────────────────────────────────────┤');

    // Show planets in houses
    for (let house = 1; house <= 12; house++) {
      const housePlanets = chartData.planets.filter(p => p.house === house);
      const planetStr = housePlanets.map(p => p.name).join(', ') || 'Empty';
      lines.push(`│ House ${house.toString().padStart(2)}: ${planetStr.padEnd(25)} │`);
    }

    lines.push('└─────────────────────────────────────┘');

    return lines.join('\n');
  }

  /**
   * Get zodiac sign from longitude
   */
  private getSignFromLongitude(longitude: number): string {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
  }
}

// Export singleton instance
export const astroChart = new AstroChartRenderer();
