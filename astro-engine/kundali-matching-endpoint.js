// Add this code after line 849 in server.js (after the health check endpoint)

// Kundali Matching Endpoint
if (req.method === "POST" && req.url === "/api/kundali-matching") {
    try {
        const body = await readJsonBody(req);
        const { person1, person2 } = body;

        if (!person1 || !person2) {
            respondJson(res, 400, { error: "Both person1 and person2 are required" });
            return;
        }

        console.log("[Kundali Matching] Received request for:", person1.name, "and", person2.name);

        // Generate Kundalis for both
        const kundali1 = computeKundali({
            name: person1.name,
            gender: person1.gender || "male",
            year: new Date(person1.dateOfBirth).getFullYear(),
            month: new Date(person1.dateOfBirth).getMonth() + 1,
            day: new Date(person1.dateOfBirth).getDate(),
            hour: parseInt(person1.timeOfBirth.split(":")[0]) || 12,
            minute: parseInt(person1.timeOfBirth.split(":")[1]) || 0,
            second: parseInt(person1.timeOfBirth.split(":")[2]) || 0,
            latitude: person1.placeOfBirth.latitude,
            longitude: person1.placeOfBirth.longitude,
            timezone: 5.5,
        });

        const kundali2 = computeKundali({
            name: person2.name,
            gender: person2.gender || "female",
            year: new Date(person2.dateOfBirth).getFullYear(),
            month: new Date(person2.dateOfBirth).getMonth() + 1,
            day: new Date(person2.dateOfBirth).getDate(),
            hour: parseInt(person2.timeOfBirth.split(":")[0]) || 12,
            minute: parseInt(person2.timeOfBirth.split(":")[1]) || 0,
            second: parseInt(person2.timeOfBirth.split(":")[2]) || 0,
            latitude: person2.placeOfBirth.latitude,
            longitude: person2.placeOfBirth.longitude,
            timezone: 5.5,
        });

        // Calculate Guna Milan (Ashtakoot)
        const moon1 = kundali1.planets.find(p => p.name === "Moon");
        const moon2 = kundali2.planets.find(p => p.name === "Moon");

        // Helper functions for Guna calculations
        const getVarna = (moonSign) => {
            const varnas = {
                "Cancer": "Brahmin", "Scorpio": "Brahmin", "Pisces": "Brahmin",
                "Aries": "Kshatriya", "Leo": "Kshatriya", "Sagittarius": "Kshatriya",
                "Taurus": "Vaisya", "Virgo": "Vaisya", "Capricorn": "Vaisya",
                "Gemini": "Shudra", "Libra": "Shudra", "Aquarius": "Shudra"
            };
            return varnas[moonSign] || "Unknown";
        };

        const getVashya = (moonSign) => {
            const vashyas = {
                "Aries": "Quadruped", "Taurus": "Quadruped", "Leo": "Quadruped",
                "Sagittarius": "Manav", "Gemini": "Manav", "Virgo": "Manav",
                "Libra": "Manav", "Aquarius": "Manav",
                "Cancer": "Jalchar", "Pisces": "Jalchar", "Capricorn": "Jalchar",
                "Scorpio": "Keeta"
            };
            return vashyas[moonSign] || "Unknown";
        };

        const getTara = (nakIndex1, nakIndex2) => {
            const diff = ((nakIndex2 - nakIndex1 + 27) % 27);
            const taraGroup = diff % 9;
            const taras = ["Janma", "Sampat", "Vipat", "Kshema", "Pratyak", "Sadhak", "Vadha", "Mitra", "Param Mitra"];
            return taras[taraGroup];
        };

        const getYoni = (nakIndex) => {
            const yonis = ["Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow",
                "Buffalo", "Tiger", "Hare", "Monkey", "Lion", "Mongoose"];
            const yoniMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            return yonis[yoniMap[nakIndex - 1]];
        };

        const getGana = (nakIndex) => {
            const ganaMap = [0, 0, 1, 1, 0, 2, 0, 2, 2, 2, 0, 0, 1, 1, 2, 0, 0, 2, 2, 0, 0, 1, 1, 2, 0, 0, 0];
            const ganas = ["Deva", "Manushya", "Rakshasa"];
            return ganas[ganaMap[nakIndex - 1]];
        };

        const getNadi = (nakIndex) => {
            const nadis = ["Adi", "Madhya", "Antya"];
            return nadis[(nakIndex - 1) % 3];
        };

        const getRasiLord = (moonSign) => {
            const lords = {
                "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury",
                "Cancer": "Moon", "Leo": "Sun", "Virgo": "Mercury",
                "Libra": "Venus", "Scorpio": "Mars", "Sagittarius": "Jupiter",
                "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
            };
            return lords[moonSign] || "Unknown";
        };

        // Calculate each Guna with AstroSage-compatible scoring
        const varna1 = getVarna(moon1.sign);
        const varna2 = getVarna(moon2.sign);
        const varnaOrder = { "Brahmin": 4, "Kshatriya": 3, "Vaisya": 2, "Shudra": 1 };
        const varnaScore = (varnaOrder[varna1] >= varnaOrder[varna2]) ? 1 : 0;

        const vashya1 = getVashya(moon1.sign);
        const vashya2 = getVashya(moon2.sign);
        let vashyaScore = 0;
        if (vashya1 === vashya2) vashyaScore = 2;
        else if ((vashya1 === "Manav" && vashya2 === "Jalchar") || (vashya1 === "Jalchar" && vashya2 === "Manav")) vashyaScore = 0.5;
        else if ((vashya1 === "Quadruped" && vashya2 === "Manav") || (vashya1 === "Manav" && vashya2 === "Quadruped")) vashyaScore = 1;
        else vashyaScore = 0;

        const tara1 = getTara(moon1.nakshatra.index, moon2.nakshatra.index);
        const tara2 = getTara(moon2.nakshatra.index, moon1.nakshatra.index);
        const goodTaras = ["Sadhak", "Mitra", "Param Mitra", "Sampat", "Kshema"];
        const taraScore = (goodTaras.includes(tara1) && goodTaras.includes(tara2)) ? 3 : 1.5;

        const yoni1 = getYoni(moon1.nakshatra.index);
        const yoni2 = getYoni(moon2.nakshatra.index);
        let yoniScore = 0;
        if (yoni1 === yoni2) yoniScore = 4;
        else if ((yoni1 === "Horse" && yoni2 === "Horse") || (yoni1 === "Elephant" && yoni2 === "Elephant")) yoniScore = 4;
        else if ((yoni1 === "Buffalo" && yoni2 === "Cow") || (yoni1 === "Cow" && yoni2 === "Buffalo")) yoniScore = 3;
        else yoniScore = 2;

        const lord1 = getRasiLord(moon1.sign);
        const lord2 = getRasiLord(moon2.sign);
        let grahaMaitriScore = 0;
        if (lord1 === lord2) grahaMaitriScore = 5;
        else {
            const friendships = {
                "Sun": ["Moon", "Mars", "Jupiter"],
                "Moon": ["Sun", "Mercury"],
                "Mars": ["Sun", "Moon", "Jupiter"],
                "Mercury": ["Sun", "Venus"],
                "Jupiter": ["Sun", "Moon", "Mars"],
                "Venus": ["Mercury", "Saturn"],
                "Saturn": ["Mercury", "Venus"]
            };
            if (friendships[lord1] && friendships[lord1].includes(lord2)) grahaMaitriScore = 4;
            else grahaMaitriScore = 0.5;
        }

        const gana1 = getGana(moon1.nakshatra.index);
        const gana2 = getGana(moon2.nakshatra.index);
        let ganaScore = 0;
        if (gana1 === gana2) ganaScore = 6;
        else if ((gana1 === "Deva" && gana2 === "Manushya") || (gana1 === "Manushya" && gana2 === "Deva")) ganaScore = 6;
        else if ((gana1 === "Manushya" && gana2 === "Rakshasa") || (gana1 === "Rakshasa" && gana2 === "Manushya")) ganaScore = 0;
        else ganaScore = 0;

        // Bhakoot - sign compatibility
        const getSignIndex = (sign) => RASHIS.indexOf(sign);
        const sign1Index = getSignIndex(moon1.sign);
        const sign2Index = getSignIndex(moon2.sign);
        const signDiff = Math.abs(sign1Index - sign2Index);
        const bhakootScore = (signDiff === 6 || signDiff === 8 || signDiff === 2 || signDiff === 12) ? 0 : 7;

        const nadi1 = getNadi(moon1.nakshatra.index);
        const nadi2 = getNadi(moon2.nakshatra.index);
        const nadiScore = nadi1 !== nadi2 ? 8 : 0;

        const totalScore = varnaScore + vashyaScore + taraScore + yoniScore + grahaMaitriScore + ganaScore + bhakootScore + nadiScore;

        // Mangal Dosha calculation
        const calculateMangalDosha = (kundali) => {
            const mars = kundali.planets.find(p => p.name === "Mars");
            if (!mars) return "No Mangal Dosha";
            const house = mars.house;
            if ([1, 4, 7, 8, 12].includes(house)) return "High Mangal Dosha";
            if ([2].includes(house)) return "Low Mangal Dosha";
            return "No Mangal Dosha";
        };

        const mangalDosha1 = calculateMangalDosha(kundali1);
        const mangalDosha2 = calculateMangalDosha(kundali2);

        console.log("[Kundali Matching] Total Score:", totalScore, "/36");

        const matchingResult = {
            totalScore: Math.round(totalScore * 10) / 10,
            maxScore: 36,
            percentage: Math.round((totalScore / 36) * 100),
            compatibility: totalScore >= 28 ? "Excellent" : totalScore >= 24 ? "Very Good" : totalScore >= 18 ? "Good" : "Average",
            details: [
                { name: "Varna (वर्ण)", boyValue: varna1, girlValue: varna2, score: varnaScore, maxScore: 1, areaOfLife: "Work", description: "Spiritual compatibility and ego levels" },
                { name: "Vashya (वश्य)", boyValue: vashya1, girlValue: vashya2, score: vashyaScore, maxScore: 2, areaOfLife: "Dominance", description: "Mutual attraction and control" },
                { name: "Tara (तारा)", boyValue: tara1, girlValue: tara2, score: taraScore, maxScore: 3, areaOfLife: "Destiny", description: "Birth star compatibility and health" },
                { name: "Yoni (योनि)", boyValue: yoni1, girlValue: yoni2, score: yoniScore, maxScore: 4, areaOfLife: "Mentality", description: "Sexual compatibility and intimacy" },
                { name: "Graha Maitri (ग्रह मैत्री)", boyValue: lord1, girlValue: lord2, score: grahaMaitriScore, maxScore: 5, areaOfLife: "Compatibility", description: "Mental compatibility and friendship" },
                { name: "Gana (गण)", boyValue: gana1, girlValue: gana2, score: ganaScore, maxScore: 6, areaOfLife: "Guna Level", description: "Temperament and behavior compatibility" },
                { name: "Bhakoot (भकूट)", boyValue: moon1.sign, girlValue: moon2.sign, score: bhakootScore, maxScore: 7, areaOfLife: "Love", description: "Love and prosperity" },
                { name: "Nadi (नाडी)", boyValue: nadi1, girlValue: nadi2, score: nadiScore, maxScore: 8, areaOfLife: "Health", description: "Health and progeny" }
            ],
            mangalDosha: {
                boy: mangalDosha1,
                girl: mangalDosha2,
                compatible: mangalDosha1 === mangalDosha2 || (mangalDosha1 === "No Mangal Dosha" && mangalDosha2 === "No Mangal Dosha")
            },
            boyDetails: {
                varna: varna1,
                vashya: vashya1,
                tara: tara1,
                yoni: yoni1,
                gana: gana1,
                nadi: nadi1,
                rasiLord: lord1,
                moonSign: moon1.sign
            },
            girlDetails: {
                varna: varna2,
                vashya: vashya2,
                tara: tara2,
                yoni: yoni2,
                gana: gana2,
                nadi: nadi2,
                rasiLord: lord2,
                moonSign: moon2.sign
            },
            recommendation: totalScore >= 28
                ? "Excellent match! This union is highly auspicious according to Vedic astrology. The couple is likely to have a harmonious and prosperous married life."
                : totalScore >= 24
                    ? "Very good compatibility! This match shows strong potential for a happy marriage. Minor differences can be resolved with understanding and mutual respect."
                    : totalScore >= 18
                        ? "Good compatibility. The match is favorable for marriage. Consult an astrologer for remedies to strengthen weaker areas."
                        : "Average compatibility. Marriage is possible but may require effort and understanding. Recommended to consult an expert astrologer for detailed analysis and remedies."
        };

        respondJson(res, 200, matchingResult);
    } catch (error) {
        console.error("[astro-engine] Kundali matching error:", error);
        respondJson(res, 400, { error: error.message || "Unable to match kundalis" });
    }
    return;
}
