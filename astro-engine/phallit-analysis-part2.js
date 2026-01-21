// PHALLIT ANALYSIS - PART 2: Career, Education, Wealth, Marriage, Health

// 3. EDUCATION ANALYSIS
function analyzeEducation(kundali, language = 'en') {
    const mercury = getPlanetByName(kundali.planets, 'Mercury');
    const jupiter = getPlanetByName(kundali.planets, 'Jupiter');
    const house4Lord = getHouseLord(4, kundali.ascendant.sign);
    const house5Lord = getHouseLord(5, kundali.ascendant.sign);

    let analysis = '';

    if (language === 'en') {
        analysis = `Education prospects: `;
        if (mercury && mercury.house === 4) {
            analysis += `Strong analytical abilities. Suitable for technical/scientific subjects. `;
        }
        if (jupiter && (jupiter.house === 4 || jupiter.house === 5 || jupiter.house === 9)) {
            analysis += `Higher education strongly indicated. ${jupiter.house === 9 ? 'Foreign education possible. ' : ''}`;
        }
        if (mercury && mercury.isRetrograde) {
            analysis += `May face delays in 18-22 age due to Mercury retrograde. Focus on practical learning. `;
        }
        analysis += `Best subjects: ${mercury && mercury.house <= 6 ? 'Mathematics, Science, Technology' : 'Arts, Philosophy, Business'}. `;
        analysis += `Peak learning years: 16-24, with major decisions around age 20-21.`;
    } else {
        analysis = `शिक्षा संभावनाएं: `;
        if (mercury && mercury.house === 4) {
            analysis += `मजबूत विश्लेषणात्मक क्षमताएं। तकनीकी/वैज्ञानिक विषयों के लिए उपयुक्त। `;
        }
        if (jupiter && (jupiter.house === 4 || jupiter.house === 5 || jupiter.house === 9)) {
            analysis += `उच्च शिक्षा दृढ़ता से संकेतित। ${jupiter.house === 9 ? 'विदेश शिक्षा संभव। ' : ''}`;
        }
        if (mercury && mercury.isRetrograde) {
            analysis += `बुध वक्री के कारण 18-22 आयु में देरी हो सकती है। व्यावहारिक सीखने पर ध्यान दें। `;
        }
        analysis += `सर्वोत्तम विषय: ${mercury && mercury.house <= 6 ? 'गणित, विज्ञान, प्रौद्योगिकी' : 'कला, दर्शन, व्यवसाय'}। `;
        analysis += `चरम सीखने के वर्ष: 16-24, 20-21 आयु के आसपास प्रमुख निर्णय।`;
    }

    return analysis;
}

// 4. CAREER ANALYSIS (MOST IMPORTANT)
function analyzeCareer(kundali, language = 'en') {
    const house10Lord = getHouseLord(10, kundali.ascendant.sign);
    const saturn = getPlanetByName(kundali.planets, 'Saturn');
    const sun = getPlanetByName(kundali.planets, 'Sun');
    const mercury = getPlanetByName(kundali.planets, 'Mercury');
    const jupiter = getPlanetByName(kundali.planets, 'Jupiter');

    let analysis = '';
    let careerField = '';
    let jobVsBusiness = '';
    let timeline = '';

    // Determine career field
    if (mercury && (mercury.house === 10 || mercury.house === 1)) {
        careerField = language === 'en' ? 'Technology, Research, Analysis, Communication' : 'प्रौद्योगिकी, अनुसंधान, विश्लेषण, संचार';
    } else if (jupiter && (jupiter.house === 10 || jupiter.house === 9)) {
        careerField = language === 'en' ? 'Teaching, Consulting, Finance, Law' : 'शिक्षण, परामर्श, वित्त, कानून';
    } else if (saturn && saturn.house === 10) {
        careerField = language === 'en' ? 'Government, Administration, Engineering' : 'सरकार, प्रशासन, इंजीनियरिंग';
    } else if (sun && (sun.house === 10 || sun.house === 1)) {
        careerField = language === 'en' ? 'Leadership, Management, Politics' : 'नेतृत्व, प्रबंधन, राजनीति';
    } else {
        careerField = language === 'en' ? 'Business, Creative fields' : 'व्यवसाय, रचनात्मक क्षेत्र';
    }

    // Job vs Business
    if (saturn && saturn.house === 10) {
        jobVsBusiness = language === 'en' ? 'Job/Service more suitable' : 'नौकरी/सेवा अधिक उपयुक्त';
    } else if (sun && sun.house === 10) {
        jobVsBusiness = language === 'en' ? 'Business/Self-employment favorable' : 'व्यवसाय/स्व-रोजगार अनुकूल';
    } else {
        jobVsBusiness = language === 'en' ? 'Both job and business possible' : 'नौकरी और व्यवसाय दोनों संभव';
    }

    // Timeline based on current age and dasha
    if (language === 'en') {
        timeline = `Career Timeline: `;
        timeline += `18-22: Foundation building, initial struggles. `;
        timeline += `23-27: ${saturn && saturn.house === 10 ? 'Slow but steady growth' : 'Rapid progress possible'}. `;
        timeline += `28-32: Major career decisions, ${jupiter && jupiter.house === 10 ? 'significant growth' : 'stabilization period'}. `;
        timeline += `33+: ${sun && sun.house === 10 ? 'Leadership roles' : 'Established position'}.`;
    } else {
        timeline = `करियर समयरेखा: `;
        timeline += `18-22: नींव निर्माण, प्रारंभिक संघर्ष। `;
        timeline += `23-27: ${saturn && saturn.house === 10 ? 'धीमी लेकिन स्थिर वृद्धि' : 'तेजी से प्रगति संभव'}। `;
        timeline += `28-32: प्रमुख करियर निर्णय, ${jupiter && jupiter.house === 10 ? 'महत्वपूर्ण वृद्धि' : 'स्थिरीकरण अवधि'}। `;
        timeline += `33+: ${sun && sun.house === 10 ? 'नेतृत्व भूमिकाएं' : 'स्थापित स्थिति'}.`;
    }

    if (language === 'en') {
        analysis = `Career Field: ${careerField}. ${jobVsBusiness}. ${timeline} 10th house analysis shows ${house10Lord} influence creating ${mercury && mercury.house === 10 ? 'intellectual career path' : 'practical work environment'}.`;
    } else {
        analysis = `करियर क्षेत्र: ${careerField}। ${jobVsBusiness}। ${timeline} 10वें भाव का विश्लेषण ${house10Lord} प्रभाव दिखाता है जो ${mercury && mercury.house === 10 ? 'बौद्धिक करियर पथ' : 'व्यावहारिक कार्य वातावरण'} बनाता है।`;
    }

    return analysis;
}

// 5. WEALTH ANALYSIS
function analyzeWealth(kundali, language = 'en') {
    const house2Lord = getHouseLord(2, kundali.ascendant.sign);
    const house11Lord = getHouseLord(11, kundali.ascendant.sign);
    const jupiter = getPlanetByName(kundali.planets, 'Jupiter');
    const venus = getPlanetByName(kundali.planets, 'Venus');

    let analysis = '';

    if (language === 'en') {
        analysis = `Wealth patterns: `;
        if (jupiter && (jupiter.house === 2 || jupiter.house === 11)) {
            analysis += `Good earning potential. Wealth accumulation after 30. `;
        }
        if (venus && venus.house === 2) {
            analysis += `Spending on luxury and comfort. Need to focus on savings. `;
        }
        analysis += `Money comes through ${jupiter && jupiter.house === 10 ? 'career and profession' : 'multiple sources'}. `;
        analysis += `Financial stability: ${jupiter && jupiter.house === 2 ? 'Strong after 28-30' : 'Gradual improvement with age'}.`;
    } else {
        analysis = `धन पैटर्न: `;
        if (jupiter && (jupiter.house === 2 || jupiter.house === 11)) {
            analysis += `अच्छी कमाई क्षमता। 30 के बाद धन संचय। `;
        }
        if (venus && venus.house === 2) {
            analysis += `विलासिता और आराम पर खर्च। बचत पर ध्यान देने की आवश्यकता। `;
        }
        analysis += `पैसा ${jupiter && jupiter.house === 10 ? 'करियर और पेशे' : 'कई स्रोतों'} के माध्यम से आता है। `;
        analysis += `वित्तीय स्थिरता: ${jupiter && jupiter.house === 2 ? '28-30 के बाद मजबूत' : 'उम्र के साथ क्रमिक सुधार'}.`;
    }

    return analysis;
}

// 6. MARRIAGE/RELATIONSHIPS ANALYSIS
function analyzeRelationships(kundali, language = 'en') {
    const house7Lord = getHouseLord(7, kundali.ascendant.sign);
    const venus = getPlanetByName(kundali.planets, 'Venus');
    const mars = getPlanetByName(kundali.planets, 'Mars');
    const saturn = getPlanetByName(kundali.planets, 'Saturn');
    const mangalDosha = kundali.enhancedDetails?.mangalDosha === 'Yes';

    let analysis = '';

    if (language === 'en') {
        analysis = `Marriage prospects: `;
        if (saturn && (saturn.house === 7 || saturn.house === 1)) {
            analysis += `Possible delay in marriage, likely after 28-30. `;
        } else {
            analysis += `Marriage timing: 24-28 years. `;
        }
        if (mangalDosha) {
            analysis += `Mangal Dosha present - choose partner carefully, compatibility important. `;
        }
        if (venus && venus.house === 7) {
            analysis += `Harmonious relationship indicated. Partner will be loving and supportive. `;
        }
        analysis += `${saturn && saturn.house === 7 ? 'Arranged marriage more likely' : 'Love or arranged both possible'}. `;
        analysis += `Relationship success through ${venus ? 'understanding and romance' : 'patience and commitment'}.`;
    } else {
        analysis = `विवाह संभावनाएं: `;
        if (saturn && (saturn.house === 7 || saturn.house === 1)) {
            analysis += `विवाह में संभावित देरी, संभवतः 28-30 के बाद। `;
        } else {
            analysis += `विवाह समय: 24-28 वर्ष। `;
        }
        if (mangalDosha) {
            analysis += `मंगल दोष उपस्थित - साथी को सावधानी से चुनें, अनुकूलता महत्वपूर्ण। `;
        }
        if (venus && venus.house === 7) {
            analysis += `सामंजस्यपूर्ण संबंध संकेतित। साथी प्रेमपूर्ण और सहायक होगा। `;
        }
        analysis += `${saturn && saturn.house === 7 ? 'व्यवस्थित विवाह अधिक संभावित' : 'प्रेम या व्यवस्थित दोनों संभव'}। `;
        analysis += `संबंध सफलता ${venus ? 'समझ और रोमांस' : 'धैर्य और प्रतिबद्धता'} के माध्यम से।`;
    }

    return analysis;
}

// 7. HEALTH ANALYSIS
function analyzeHealth(kundali, language = 'en') {
    const house6Lord = getHouseLord(6, kundali.ascendant.sign);
    const mars = getPlanetByName(kundali.planets, 'Mars');
    const saturn = getPlanetByName(kundali.planets, 'Saturn');
    const moon = getPlanetByName(kundali.planets, 'Moon');

    let analysis = '';

    if (language === 'en') {
        analysis = `Health indicators: `;
        if (saturn && (saturn.house === 1 || saturn.house === 6)) {
            analysis += `Watch for chronic issues, joint/bone problems. Regular exercise important. `;
        }
        if (mars && mars.house === 6) {
            analysis += `Prone to accidents/injuries. Avoid risky activities. `;
        }
        if (moon && moon.isRetrograde) {
            analysis += `Mental stress possible. Practice meditation and relaxation. `;
        }
        analysis += `Weak areas: ${saturn ? 'Bones, joints, teeth' : 'Digestive system'}. `;
        analysis += `Health improves with age, especially after 35.`;
    } else {
        analysis = `स्वास्थ्य संकेतक: `;
        if (saturn && (saturn.house === 1 || saturn.house === 6)) {
            analysis += `पुरानी समस्याओं, जोड़ों/हड्डियों की समस्याओं के लिए सावधान रहें। नियमित व्यायाम महत्वपूर्ण। `;
        }
        if (mars && mars.house === 6) {
            analysis += `दुर्घटनाओं/चोटों की संभावना। जोखिम भरी गतिविधियों से बचें। `;
        }
        if (moon && moon.isRetrograde) {
            analysis += `मानसिक तनाव संभव। ध्यान और विश्राम का अभ्यास करें। `;
        }
        analysis += `कमजोर क्षेत्र: ${saturn ? 'हड्डियां, जोड़, दांत' : 'पाचन तंत्र'}। `;
        analysis += `उम्र के साथ स्वास्थ्य में सुधार, विशेष रूप से 35 के बाद।`;
    }

    return analysis;
}

// 8. DOSHAS & YOGAS ANALYSIS
function analyzeDoshasYogas(kundali, language = 'en') {
    const mangalDosha = kundali.enhancedDetails?.mangalDosha === 'Yes';
    const mars = getPlanetByName(kundali.planets, 'Mars');
    const jupiter = getPlanetByName(kundali.planets, 'Jupiter');
    const venus = getPlanetByName(kundali.planets, 'Venus');

    // Check for Kaal Sarp Yoga (simplified)
    const rahu = getPlanetByName(kundali.planets, 'Rahu');
    const ketu = getPlanetByName(kundali.planets, 'Ketu');

    let analysis = '';

    if (language === 'en') {
        analysis = `Doshas & Yogas: `;
        if (mangalDosha) {
            analysis += `Mangal Dosha present in chart. ${mars && mars.house === 7 ? 'Strong dosha' : 'Mild dosha'}. Remedies: Marry after 28 or find partner with same dosha. `;
        } else {
            analysis += `No Mangal Dosha. `;
        }

        // Raj Yoga check (simplified)
        if (jupiter && jupiter.house === 10) {
            analysis += `Raj Yoga present - Success in career and authority. `;
        }
        if (venus && jupiter && Math.abs(venus.house - jupiter.house) <= 1) {
            analysis += `Dhan Yoga indicated - Wealth accumulation. `;
        }

        analysis += `Overall: ${mangalDosha ? 'Remedies recommended for marriage' : 'Favorable planetary combinations'}.`;
    } else {
        analysis = `दोष और योग: `;
        if (mangalDosha) {
            analysis += `कुंडली में मंगल दोष उपस्थित। ${mars && mars.house === 7 ? 'मजबूत दोष' : 'हल्का दोष'}। उपाय: 28 के बाद शादी करें या समान दोष वाले साथी खोजें। `;
        } else {
            analysis += `कोई मंगल दोष नहीं। `;
        }

        if (jupiter && jupiter.house === 10) {
            analysis += `राजयोग उपस्थित - करियर और अधिकार में सफलता। `;
        }
        if (venus && jupiter && Math.abs(venus.house - jupiter.house) <= 1) {
            analysis += `धन योग संकेतित - धन संचय। `;
        }

        analysis += `कुल मिलाकर: ${mangalDosha ? 'विवाह के लिए उपाय अनुशंसित' : 'अनुकूल ग्रह संयोजन'}.`;
    }

    return analysis;
}

// 9. DASHA PREDICTIONS (MOST REAL PART)
function analyzeDashaPredictions(kundali, language = 'en') {
    const currentDasha = kundali.dashas?.current;
    const mahadashas = kundali.dashas?.mahadashas || [];

    if (!currentDasha) {
        return language === 'en' ? 'Dasha information not available' : 'दशा जानकारी उपलब्ध नहीं';
    }

    const currentPlanet = currentDasha.planet;
    const planetObj = getPlanetByName(kundali.planets, currentPlanet);

    let analysis = '';

    if (language === 'en') {
        analysis = `Current Mahadasha: ${currentPlanet} (${currentDasha.years} years). `;

        if (planetObj) {
            analysis += `${currentPlanet} in ${planetObj.house}th house brings `;
            if (planetObj.house === 10) {
                analysis += `career growth and recognition. `;
            } else if (planetObj.house === 2 || planetObj.house === 11) {
                analysis += `financial gains and wealth accumulation. `;
            } else if (planetObj.house === 4) {
                analysis += `property gains and domestic happiness. `;
            } else if (planetObj.house === 7) {
                analysis += `relationship focus and partnerships. `;
            } else {
                analysis += `mixed results based on house position. `;
            }
        }

        // Next 5 years prediction
        const nextDashas = mahadashas.slice(0, 2);
        if (nextDashas.length > 0) {
            analysis += `Next 5-10 years: `;
            nextDashas.forEach((dasha, index) => {
                analysis += `${dasha.planet} dasha ${index === 0 ? 'brings' : 'will bring'} ${dasha.planet === 'Jupiter' ? 'expansion and growth' : dasha.planet === 'Saturn' ? 'discipline and hard work' : dasha.planet === 'Venus' ? 'comfort and relationships' : 'changes'}. `;
            });
        }
    } else {
        analysis = `वर्तमान महादशा: ${currentPlanet} (${currentDasha.years} वर्ष)। `;

        if (planetObj) {
            analysis += `${currentPlanet} ${planetObj.house}वें भाव में `;
            if (planetObj.house === 10) {
                analysis += `करियर वृद्धि और मान्यता लाता है। `;
            } else if (planetObj.house === 2 || planetObj.house === 11) {
                analysis += `वित्तीय लाभ और धन संचय लाता है। `;
            } else if (planetObj.house === 4) {
                analysis += `संपत्ति लाभ और घरेलू खुशी लाता है। `;
            } else if (planetObj.house === 7) {
                analysis += `संबंध फोकस और साझेदारी लाता है। `;
            } else {
                analysis += `भाव स्थिति के आधार पर मिश्रित परिणाम लाता है। `;
            }
        }

        const nextDashas = mahadashas.slice(0, 2);
        if (nextDashas.length > 0) {
            analysis += `अगले 5-10 वर्ष: `;
            nextDashas.forEach((dasha, index) => {
                analysis += `${dasha.planet} दशा ${index === 0 ? 'लाती है' : 'लाएगी'} ${dasha.planet === 'Jupiter' ? 'विस्तार और वृद्धि' : dasha.planet === 'Saturn' ? 'अनुशासन और कड़ी मेहनत' : dasha.planet === 'Venus' ? 'आराम और संबंध' : 'परिवर्तन'}। `;
            });
        }
    }

    return analysis;
}

// 10. REMEDIES
function generateRemedies(kundali, language = 'en') {
    const weakPlanets = [];
    const saturn = getPlanetByName(kundali.planets, 'Saturn');
    const mars = getPlanetByName(kundali.planets, 'Mars');
    const mercury = getPlanetByName(kundali.planets, 'Mercury');

    let analysis = '';

    if (language === 'en') {
        analysis = `Recommended Remedies: `;

        if (saturn && saturn.isRetrograde) {
            analysis += `For Saturn: Donate black items on Saturdays. Respect elders. Practice discipline. `;
            weakPlanets.push('Saturn');
        }
        if (mars && kundali.enhancedDetails?.mangalDosha === 'Yes') {
            analysis += `For Mars: Donate red items on Tuesdays. Practice patience. Avoid conflicts. `;
            weakPlanets.push('Mars');
        }
        if (mercury && mercury.isRetrograde) {
            analysis += `For Mercury: Donate green items on Wednesdays. Improve communication skills. `;
            weakPlanets.push('Mercury');
        }

        if (weakPlanets.length === 0) {
            analysis += `No major planetary weaknesses. General remedies: Regular meditation, charity, and positive thinking.`;
        } else {
            analysis += `Focus on strengthening: ${weakPlanets.join(', ')}. Mantras and gemstones can be consulted with expert astrologer.`;
        }
    } else {
        analysis = `अनुशंसित उपाय: `;

        if (saturn && saturn.isRetrograde) {
            analysis += `शनि के लिए: शनिवार को काली वस्तुओं का दान करें। बड़ों का सम्मान करें। अनुशासन का अभ्यास करें। `;
            weakPlanets.push('शनि');
        }
        if (mars && kundali.enhancedDetails?.mangalDosha === 'Yes') {
            analysis += `मंगल के लिए: मंगलवार को लाल वस्तुओं का दान करें। धैर्य का अभ्यास करें। संघर्षों से बचें। `;
            weakPlanets.push('मंगल');
        }
        if (mercury && mercury.isRetrograde) {
            analysis += `बुध के लिए: बुधवार को हरी वस्तुओं का दान करें। संचार कौशल में सुधार करें। `;
            weakPlanets.push('बुध');
        }

        if (weakPlanets.length === 0) {
            analysis += `कोई बड़ी ग्रह कमजोरी नहीं। सामान्य उपाय: नियमित ध्यान, दान, और सकारात्मक सोच।`;
        } else {
            analysis += `मजबूत करने पर ध्यान दें: ${weakPlanets.join(', ')}। मंत्र और रत्न विशेषज्ञ ज्योतिषी से परामर्श किया जा सकता है।`;
        }
    }

    return analysis;
}

// Export all functions
module.exports = {
    analyzeLagnaPersonality,
    analyzeMoonEmotions,
    analyzeEducation,
    analyzeCareer,
    analyzeWealth,
    analyzeRelationships,
    analyzeHealth,
    analyzeDoshasYogas,
    analyzeDashaPredictions,
    generateRemedies,
    getPlanetByName,
    getHouseLord,
    isPlanetInHouse
};
