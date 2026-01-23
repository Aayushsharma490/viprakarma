// Get Nakshatra Paya (foot/step) - AstroSage Compatible Nakshatra-based lookup
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
}
