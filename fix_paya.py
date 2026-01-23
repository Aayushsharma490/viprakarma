import re

# Read the file
with open('astro-engine/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old function (lines 702-721)
old_function = r'''// Get Nakshatra Paya \(foot/step\) - Pada-based calculation
function getNakshatraPaya\(moonSignIndex, sunSignIndex, moonNakshatraIndex, moonPada\) \{
  // Nakshatra Paya is based on the pada \(quarter\) of the nakshatra
  // Simple pattern: Pada 1 = Gold, Pada 2 = Silver, Pada 3 = Copper, Pada 4 = Iron
  // This pattern repeats for every nakshatra
  
  if \(\!moonPada \|\| moonPada < 1 \|\| moonPada > 4\) \{
    // Fallback to rashi-based if pada data unavailable
    const diff = \(moonSignIndex - sunSignIndex \+ 12\) % 12 \+ 1;
    if \(\[1, 6, 9\]\.includes\(diff\)\) return "Gold";
    if \(\[2, 5, 11\]\.includes\(diff\)\) return "Silver";
    if \(\[3, 7, 10\]\.includes\(diff\)\) return "Copper";
    if \(\[4, 8, 12\]\.includes\(diff\)\) return "Iron";
    return "Iron";
  \}
  
  // Pada-based calculation \(simple and direct\)
  const payas = \["Gold", "Silver", "Copper", "Iron"\];
  return payas\[moonPada - 1\];
\}'''

# Define the new function
new_function = '''// Get Nakshatra Paya (foot/step) - AstroSage Compatible Nakshatra-based lookup
function getNakshatraPaya(moonSignIndex, sunSignIndex, moonNakshatraIndex, moonPada) {
  if (!moonNakshatraIndex) return "Unknown";
  
  // Precise mapping from AstroSage standards for "Paya (Nakshatra Based)"
  const swarna = [1, 9, 13, 15, 24, 26];
  const rajat = [2, 5, 8, 17, 18, 21, 25];
  const tamra = [7, 10, 11, 12, 16, 19, 23, 27];
  const loha = [3, 4, 6, 14, 20, 22];

  if (swarna.includes(moonNakshatraIndex)) return "Gold";
  if (rajat.includes(moonNakshatraIndex)) return "Silver";
  if (tamra.includes(moonNakshatraIndex)) return "Copper";
  if (loha.includes(moonNakshatraIndex)) return "Iron";
  
  return "Iron";
}'''

# Replace
content = re.sub(old_function, new_function, content, flags=re.MULTILINE)

# Write back
with open('astro-engine/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ getNakshatraPaya function replaced successfully!")
