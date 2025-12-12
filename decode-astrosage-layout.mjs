/**
 * AstroSage Chart Layout Decoder
 * Analyzes the visual positions from AstroSage screenshots
 */

console.log("═".repeat(70));
console.log("ASTROSAGE CHART LAYOUT ANALYSIS");
console.log("═".repeat(70));

// From the AstroSage Lagna Chart screenshot, mapping visual positions to planets
const astrosageVisualLayout = {
  "TOP-LEFT (House 12)": ["Ne", "Ve", "Me", "Ju"], // Based on screenshot
  "TOP-CENTER (House 10)": ["Pl", "Su"],
  "TOP-RIGHT (House 7)": ["Mo", "Ke"],
  "MIDDLE-LEFT (House 1)": ["Ra", "Ma"],
  "MIDDLE-RIGHT (House 4)": ["Sa"],
  // Other positions appear empty in screenshot
};

// From AstroSage's planetary positions table
const astrosagePlanetData = {
  Asc: { sign: "Scorpio", house: 1, degree: "16-44-27" },
  Sun: { sign: "Scorpio", house: 1, degree: "10-59-23" },
  Moon: { sign: "Virgo", house: 11, degree: "15-46-41" },
  Mars: { sign: "Aries", house: 6, degree: "15-26-27" }, // R
  Mercury: { sign: "Scorpio", house: 1, degree: "05-19-44" }, // R
  Jupiter: { sign: "Libra", house: 12, degree: "12-54-09" },
  Venus: { sign: "Sagittarius", house: 2, degree: "25-28-21" },
  Saturn: { sign: "Cancer", house: 9, degree: "17-20-20" }, // R
  Rahu: { sign: "Pisces", house: 5, degree: "16-54-05" },
  Ketu: { sign: "Virgo", house: 11, degree: "16-54-05" },
  Uranus: { sign: "Aquarius", house: 4, degree: "13-04-29" },
  Neptune: { sign: "Capricorn", house: 3, degree: "21-06-14" },
  Pluto: { sign: "Scorpio", house: 1, degree: "29-34-47" },
};

console.log("\nASTROSAGE VISUAL LAYOUT (from screenshot):");
console.log("─".repeat(70));
for (const [position, planets] of Object.entries(astrosageVisualLayout)) {
  console.log(`${position}: ${planets.join(", ")}`);
}

console.log("\n\nASTROSAGE HOUSE ASSIGNMENTS (from table):");
console.log("─".repeat(70));

// Group by house
const byHouse = {};
for (let i = 1; i <= 12; i++) byHouse[i] = [];

for (const [planet, data] of Object.entries(astrosagePlanetData)) {
  if (data.house) {
    byHouse[data.house].push(`${planet} (${data.sign})`);
  }
}

for (let house = 1; house <= 12; house++) {
  if (byHouse[house].length > 0) {
    console.log(
      `House ${String(house).padStart(2)}: ${byHouse[house].join(", ")}`
    );
  }
}

console.log("\n\n" + "═".repeat(70));
console.log("DECODING ASTROSAGE VISUAL TO HOUSE MAPPING:");
console.log("═".repeat(70));

console.log("\nFrom screenshot, Mars (Ma) appears at MIDDLE-LEFT position");
console.log("From table, Mars is in House 6 (Aries)");
console.log(
  "\n❌ This means AstroSage is NOT using standard North Indian layout!"
);
console.log("   Standard layout: House 1 = Middle-Left");
console.log("   AstroSage shows: Mars (House 6) = Middle-Left");

console.log("\nFrom screenshot, Sun (Su) + Pluto (Pl) appear at TOP-CENTER");
console.log("From table, Sun is in House 1 (Scorpio)");
console.log("\n✓ So AstroSage places House 1 planets at TOP-CENTER position");

console.log("\nFrom screenshot, Moon (Mo) + Ketu (Ke) appear at TOP-RIGHT");
console.log("From table, Moon is in House 11 (Virgo)");

console.log("\n" + "═".repeat(70));
console.log("HYPOTHESIS: AstroSage uses DIFFERENT visual mapping!");
console.log("═".repeat(70));

// Try to decode their system
console.log("\nLet me map AstroSage visual positions to house numbers:");
console.log(
  "If House 1 planets (Sun, Mercury, Pluto, Asc) appear at TOP-CENTER..."
);
console.log("Then their mapping might be:");
console.log("  TOP-CENTER = House 1 (not standard!)");
console.log("  TOP-RIGHT = House 11 (?)");
console.log("  MIDDLE-LEFT = House 6 (?)");
console.log("  TOP-LEFT = Houses 12, 2, 3 mixed (?)");

console.log("\n⚠️  AstroSage appears to use a NON-STANDARD chart layout!");
console.log(
  "They might be rotating the diamond or using a different orientation."
);
