// Helper: Get planet by name
function getPlanetByName(planets, name) {
    if (!planets || !Array.isArray(planets)) return null;
    return planets.find(p => p && p.name && p.name.toLowerCase() === name.toLowerCase());
}

// Helper: Get house lord
function getHouseLord(houseNumber, ascendantSign) {
    const ascIndex = RASHIS.indexOf(ascendantSign);
    if (ascIndex === -1) return null;
    const houseSignIndex = (ascIndex + houseNumber - 1) % 12;
    const houseSign = RASHIS[houseSignIndex];
    return RASHI_LORDS[houseSign];
}

// 3. EDUCATION
function analyzeEducation(planets, ascSign, language) {
    const mercury = getPlanetByName(planets, 'Mercury');
    const jupiter = getPlanetByName(planets, 'Jupiter');

    if (language === 'en') {
        let analysis = 'Education: ';
        if (mercury && mercury.house === 4) analysis += 'Strong analytical abilities, suitable for technical/scientific subjects. ';
        if (jupiter && (jupiter.house === 4 || jupiter.house === 5 || jupiter.house === 9)) analysis += `Higher education indicated. ${jupiter.house === 9 ? 'Foreign education possible. ' : ''}`;
        if (mercury && mercury.isRetrograde) analysis += 'May face delays 18-22 age. ';
        analysis += `Best subjects: ${mercury && mercury.house <= 6 ? 'Math, Science, Tech' : 'Arts, Business'}. Peak years: 16-24.`;
        return analysis;
    } else {
        let analysis = 'शिक्षा: ';
        if (mercury && mercury.house === 4) analysis += 'मजबूत विश्लेषणात्मक क्षमताएं, तकनीकी/वैज्ञानिक विषय उपयुक्त। ';
        if (jupiter && (jupiter.house === 4 || jupiter.house === 5 || jupiter.house === 9)) analysis += `उच्च शिक्षा संकेतित। ${jupiter.house === 9 ? 'विदेश शिक्षा संभव। ' : ''}`;
        if (mercury && mercury.isRetrograde) analysis += '18-22 आयु में देरी संभव। ';
        analysis += `सर्वोत्तम विषय: ${mercury && mercury.house <= 6 ? 'गणित, विज्ञान, तकनीक' : 'कला, व्यवसाय'}। चरम वर्ष: 16-24।`;
        return analysis;
    }
}

// 4. CAREER (MOST IMPORTANT)
function analyzeCareer(planets, ascSign, language) {
    const saturn = getPlanetByName(planets, 'Saturn');
    const sun = getPlanetByName(planets, 'Sun');
    const mercury = getPlanetByName(planets, 'Mercury');
    const jupiter = getPlanetByName(planets, 'Jupiter');

    let careerField = '';
    let jobVsBusiness = '';
    let timeline = '';

    if (language === 'en') {
        if (mercury && (mercury.house === 10 || mercury.house === 1)) careerField = 'Technology, Research, Analysis, Communication';
        else if (jupiter && (jupiter.house === 10 || jupiter.house === 9)) careerField = 'Teaching, Consulting, Finance, Law';
        else if (saturn && saturn.house === 10) careerField = 'Government, Administration, Engineering';
        else if (sun && (sun.house === 10 || sun.house === 1)) careerField = 'Leadership, Management, Politics';
        else careerField = 'Business, Creative fields';

        jobVsBusiness = saturn && saturn.house === 10 ? 'Job/Service more suitable' : sun && sun.house === 10 ? 'Business/Self-employment favorable' : 'Both possible';

        timeline = `18-22: Foundation, initial struggles. 23-27: ${saturn && saturn.house === 10 ? 'Slow steady growth' : 'Rapid progress possible'}. 28-32: Major decisions, ${jupiter && jupiter.house === 10 ? 'significant growth' : 'stabilization'}. 33+: ${sun && sun.house === 10 ? 'Leadership roles' : 'Established position'}.`;

        return `Career: ${careerField}. ${jobVsBusiness}. Timeline: ${timeline}`;
    } else {
        if (mercury && (mercury.house === 10 || mercury.house === 1)) careerField = 'प्रौद्योगिकी, अनुसंधान, विश्लेषण, संचार';
        else if (jupiter && (jupiter.house === 10 || jupiter.house === 9)) careerField = 'शिक्षण, परामर्श, वित्त, कानून';
        else if (saturn && saturn.house === 10) careerField = 'सरकार, प्रशासन, इंजीनियरिंग';
        else if (sun && (sun.house === 10 || sun.house === 1)) careerField = 'नेतृत्व, प्रबंधन, राजनीति';
        else careerField = 'व्यवसाय, रचनात्मक क्षेत्र';

        jobVsBusiness = saturn && saturn.house === 10 ? 'नौकरी/सेवा अधिक उपयुक्त' : sun && sun.house === 10 ? 'व्यवसाय/स्व-रोजगार अनुकूल' : 'दोनों संभव';

        timeline = `18-22: नींव, प्रारंभिक संघर्ष। 23-27: ${saturn && saturn.house === 10 ? 'धीमी स्थिर वृद्धि' : 'तेजी से प्रगति संभव'}। 28-32: प्रमुख निर्णय, ${jupiter && jupiter.house === 10 ? 'महत्वपूर्ण वृद्धि' : 'स्थिरीकरण'}। 33+: ${sun && sun.house === 10 ? 'नेतृत्व भूमिकाएं' : 'स्थापित स्थिति'}।`;

        return `करियर: ${careerField}। ${jobVsBusiness}। समयरेखा: ${timeline}`;
    }
}

// 5. WEALTH
function analyzeWealth(planets, ascSign, language) {
    const jupiter = getPlanetByName(planets, 'Jupiter');
    const venus = getPlanetByName(planets, 'Venus');

    if (language === 'en') {
        let analysis = 'Wealth: ';
        if (jupiter && (jupiter.house === 2 || jupiter.house === 11)) analysis += 'Good earning potential. Wealth after 30. ';
        if (venus && venus.house === 2) analysis += 'Spending on luxury. Focus on savings. ';
        analysis += `Money through ${jupiter && jupiter.house === 10 ? 'career' : 'multiple sources'}. Stability: ${jupiter && jupiter.house === 2 ? 'Strong after 28-30' : 'Gradual improvement'}.`;
        return analysis;
    } else {
        let analysis = 'धन: ';
        if (jupiter && (jupiter.house === 2 || jupiter.house === 11)) analysis += 'अच्छी कमाई क्षमता। 30 के बाद धन। ';
        if (venus && venus.house === 2) analysis += 'विलासिता पर खर्च। बचत पर ध्यान। ';
        analysis += `पैसा ${jupiter && jupiter.house === 10 ? 'करियर' : 'कई स्रोतों'} से। स्थिरता: ${jupiter && jupiter.house === 2 ? '28-30 के बाद मजबूत' : 'क्रमिक सुधार'}।`;
        return analysis;
    }
}

// 6. RELATIONSHIPS
function analyzeRelationships(planets, ascSign, mangalDosha, language) {
    const saturn = getPlanetByName(planets, 'Saturn');
    const venus = getPlanetByName(planets, 'Venus');
    const isMangalDosha = mangalDosha === 'Yes';

    if (language === 'en') {
        let analysis = 'Marriage: ';
        if (saturn && (saturn.house === 7 || saturn.house === 1)) analysis += 'Possible delay, likely after 28-30. ';
        else analysis += 'Timing: 24-28 years. ';
        if (isMangalDosha) analysis += 'Mangal Dosha present - choose partner carefully. ';
        if (venus && venus.house === 7) analysis += 'Harmonious relationship. Loving partner. ';
        analysis += `${saturn && saturn.house === 7 ? 'Arranged more likely' : 'Love/arranged both possible'}. Success through ${venus ? 'understanding' : 'patience'}.`;
        return analysis;
    } else {
        let analysis = 'विवाह: ';
        if (saturn && (saturn.house === 7 || saturn.house === 1)) analysis += 'संभावित देरी, 28-30 के बाद। ';
        else analysis += 'समय: 24-28 वर्ष। ';
        if (isMangalDosha) analysis += 'मंगल दोष उपस्थित - साथी सावधानी से चुनें। ';
        if (venus && venus.house === 7) analysis += 'सामंजस्यपूर्ण संबंध। प्रेमपूर्ण साथी। ';
        analysis += `${saturn && saturn.house === 7 ? 'व्यवस्थित अधिक संभावित' : 'प्रेम/व्यवस्थित दोनों संभव'}। सफलता ${venus ? 'समझ' : 'धैर्य'} से।`;
        return analysis;
    }
}

// 7. HEALTH
function analyzeHealth(planets, ascSign, language) {
    const saturn = getPlanetByName(planets, 'Saturn');
    const mars = getPlanetByName(planets, 'Mars');
    const moon = getPlanetByName(planets, 'Moon');

    if (language === 'en') {
        let analysis = 'Health: ';
        if (saturn && (saturn.house === 1 || saturn.house === 6)) analysis += 'Watch chronic issues, joint/bone problems. Regular exercise important. ';
        if (mars && mars.house === 6) analysis += 'Prone to accidents/injuries. Avoid risky activities. ';
        if (moon && moon.isRetrograde) analysis += 'Mental stress possible. Practice meditation. ';
        analysis += `Weak areas: ${saturn ? 'Bones, joints' : 'Digestive system'}. Health improves after 35.`;
        return analysis;
    } else {
        let analysis = 'स्वास्थ्य: ';
        if (saturn && (saturn.house === 1 || saturn.house === 6)) analysis += 'पुरानी समस्याओं, जोड़ों/हड्डियों के लिए सावधान। नियमित व्यायाम महत्वपूर्ण। ';
        if (mars && mars.house === 6) analysis += 'दुर्घटनाओं/चोटों की संभावना। जोखिम से बचें। ';
        if (moon && moon.isRetrograde) analysis += 'मानसिक तनाव संभव। ध्यान का अभ्यास करें। ';
        analysis += `कमजोर क्षेत्र: ${saturn ? 'हड्डियां, जोड़' : 'पाचन तंत्र'}। 35 के बाद स्वास्थ्य में सुधार।`;
        return analysis;
    }
}

// 8. DOSHAS & YOGAS
function analyzeDoshasYogas(planets, mangalDosha, language) {
    const isMangalDosha = mangalDosha === 'Yes';
    const jupiter = getPlanetByName(planets, 'Jupiter');
    const venus = getPlanetByName(planets, 'Venus');
    const mars = getPlanetByName(planets, 'Mars');

    if (language === 'en') {
        let analysis = 'Doshas & Yogas: ';
        if (isMangalDosha) analysis += `Mangal Dosha present. ${mars && mars.house === 7 ? 'Strong dosha' : 'Mild dosha'}. Remedies: Marry after 28 or find partner with same dosha. `;
        else analysis += 'No Mangal Dosha. ';
        if (jupiter && jupiter.house === 10) analysis += 'Raj Yoga - Success in career. ';
        if (venus && jupiter && Math.abs(venus.house - jupiter.house) <= 1) analysis += 'Dhan Yoga - Wealth accumulation. ';
        analysis += `Overall: ${isMangalDosha ? 'Remedies recommended' : 'Favorable combinations'}.`;
        return analysis;
    } else {
        let analysis = 'दोष और योग: ';
        if (isMangalDosha) analysis += `मंगल दोष उपस्थित। ${mars && mars.house === 7 ? 'मजबूत दोष' : 'हल्का दोष'}। उपाय: 28 के बाद शादी या समान दोष वाले साथी। `;
        else analysis += 'कोई मंगल दोष नहीं। ';
        if (jupiter && jupiter.house === 10) analysis += 'राजयोग - करियर में सफलता। ';
        if (venus && jupiter && Math.abs(venus.house - jupiter.house) <= 1) analysis += 'धन योग - धन संचय। ';
        analysis += `कुल मिलाकर: ${isMangalDosha ? 'उपाय अनुशंसित' : 'अनुकूल संयोजन'}।`;
        return analysis;
    }
}

// 9. DASHA PREDICTIONS
function analyzeDashaPredictions(dashas, planets, language) {
    if (!dashas || !dashas.current) return language === 'en' ? 'Dasha information not available' : 'दशा जानकारी उपलब्ध नहीं';

    const currentDasha = dashas.current;
    const currentPlanet = currentDasha.planet;
    const planetObj = getPlanetByName(planets, currentPlanet);
    const mahadashas = dashas.mahadashas || [];

    if (language === 'en') {
        let analysis = `Current Mahadasha: ${currentPlanet} (${currentDasha.years} years). `;
        if (planetObj) {
            analysis += `${currentPlanet} in ${planetObj.house}th house brings `;
            if (planetObj.house === 10) analysis += 'career growth and recognition. ';
            else if (planetObj.house === 2 || planetObj.house === 11) analysis += 'financial gains. ';
            else if (planetObj.house === 4) analysis += 'property gains and domestic happiness. ';
            else if (planetObj.house === 7) analysis += 'relationship focus. ';
            else analysis += 'mixed results. ';
        }
        const nextDashas = mahadashas.slice(0, 2);
        if (nextDashas.length > 0) {
            analysis += 'Next 5-10 years: ';
            nextDashas.forEach((dasha, index) => {
                analysis += `${dasha.planet} dasha ${index === 0 ? 'brings' : 'will bring'} ${dasha.planet === 'Jupiter' ? 'expansion' : dasha.planet === 'Saturn' ? 'discipline' : dasha.planet === 'Venus' ? 'comfort' : 'changes'}. `;
            });
        }
        return analysis;
    } else {
        let analysis = `वर्तमान महादशा: ${currentPlanet} (${currentDasha.years} वर्ष)। `;
        if (planetObj) {
            analysis += `${currentPlanet} ${planetObj.house}वें भाव में `;
            if (planetObj.house === 10) analysis += 'करियर वृद्धि और मान्यता लाता है। ';
            else if (planetObj.house === 2 || planetObj.house === 11) analysis += 'वित्तीय लाभ लाता है। ';
            else if (planetObj.house === 4) analysis += 'संपत्ति लाभ और घरेलू खुशी लाता है। ';
            else if (planetObj.house === 7) analysis += 'संबंध फोकस लाता है। ';
            else analysis += 'मिश्रित परिणाम लाता है। ';
        }
        const nextDashas = mahadashas.slice(0, 2);
        if (nextDashas.length > 0) {
            analysis += 'अगले 5-10 वर्ष: ';
            nextDashas.forEach((dasha, index) => {
                analysis += `${dasha.planet} दशा ${index === 0 ? 'लाती है' : 'लाएगी'} ${dasha.planet === 'Jupiter' ? 'विस्तार' : dasha.planet === 'Saturn' ? 'अनुशासन' : dasha.planet === 'Venus' ? 'आराम' : 'परिवर्तन'}। `;
            });
        }
        return analysis;
    }
}

// 10. REMEDIES
function generateRemedies(planets, mangalDosha, language) {
    const saturn = getPlanetByName(planets, 'Saturn');
    const mars = getPlanetByName(planets, 'Mars');
    const mercury = getPlanetByName(planets, 'Mercury');
    const weakPlanets = [];

    if (language === 'en') {
        let analysis = 'Remedies: ';
        if (saturn && saturn.isRetrograde) {
            analysis += 'For Saturn: Donate black items on Saturdays. Respect elders. Practice discipline. ';
            weakPlanets.push('Saturn');
        }
        if (mangalDosha === 'Yes') {
            analysis += 'For Mars: Donate red items on Tuesdays. Practice patience. Avoid conflicts. ';
            weakPlanets.push('Mars');
        }
        if (mercury && mercury.isRetrograde) {
            analysis += 'For Mercury: Donate green items on Wednesdays. Improve communication. ';
            weakPlanets.push('Mercury');
        }
        if (weakPlanets.length === 0) analysis += 'No major weaknesses. General: Regular meditation, charity, positive thinking.';
        else analysis += `Focus on: ${weakPlanets.join(', ')}. Consult expert for mantras/gemstones.`;
        return analysis;
    } else {
        let analysis = 'उपाय: ';
        if (saturn && saturn.isRetrograde) {
            analysis += 'शनि के लिए: शनिवार को काली वस्तुओं का दान। बड़ों का सम्मान। अनुशासन। ';
            weakPlanets.push('शनि');
        }
        if (mangalDosha === 'Yes') {
            analysis += 'मंगल के लिए: मंगलवार को लाल वस्तुओं का दान। धैर्य। संघर्ष से बचें। ';
            weakPlanets.push('मंगल');
        }
        if (mercury && mercury.isRetrograde) {
            analysis += 'बुध के लिए: बुधवार को हरी वस्तुओं का दान। संचार सुधारें। ';
            weakPlanets.push('बुध');
        }
        if (weakPlanets.length === 0) analysis += 'कोई बड़ी कमजोरी नहीं। सामान्य: नियमित ध्यान, दान, सकारात्मक सोच।';
        else analysis += `ध्यान दें: ${weakPlanets.join(', ')}। मंत्र/रत्न के लिए विशेषज्ञ से परामर्श।`;
        return analysis;
    }
}

