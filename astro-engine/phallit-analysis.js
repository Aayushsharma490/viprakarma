// ============================================
// PHALLIT (PREDICTIONS) ANALYSIS FUNCTIONS
// ============================================

// Helper: Get planet by name
function getPlanetByName(planets, name) {
    return planets.find(p => p.name.toLowerCase() === name.toLowerCase());
}

// Helper: Get house lord
function getHouseLord(houseNumber, ascendantSign) {
    const ascIndex = RASHIS.indexOf(ascendantSign);
    const houseSignIndex = (ascIndex + houseNumber - 1) % 12;
    const houseSign = RASHIS[houseSignIndex];
    return RASHI_LORDS[houseSign];
}

// Helper: Check if planet is in house
function isPlanetInHouse(planet, houseNumber) {
    return planet.house === houseNumber;
}

// 1. LAGNA-BASED PERSONALITY ANALYSIS
function analyzeLagnaPersonality(kundali, language = 'en') {
    const ascSign = kundali.ascendant.sign;
    const ascLord = RASHI_LORDS[ascSign];
    const ascLordPlanet = getPlanetByName(kundali.planets, ascLord);

    const personalities = {
        'Aries': {
            en: `Bold and action-oriented personality. Quick decision-maker with high energy. ${ascLordPlanet ? `Mars in ${ascLordPlanet.house}th house gives ${ascLordPlanet.house <= 4 ? 'strong confidence' : 'ambitious drive'}.` : ''} Natural leadership qualities with competitive spirit.`,
            hi: `साहसी और क्रियाशील व्यक्तित्व। त्वरित निर्णय लेने वाले, उच्च ऊर्जा। ${ascLordPlanet ? `मंगल ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house <= 4 ? 'मजबूत आत्मविश्वास' : 'महत्वाकांक्षी ड्राइव'} देता है।` : ''} प्राकृतिक नेतृत्व गुण।`
        },
        'Taurus': {
            en: `Stable and practical mindset. Patient decision-maker focused on security. ${ascLordPlanet ? `Venus in ${ascLordPlanet.house}th house brings ${ascLordPlanet.house === 2 || ascLordPlanet.house === 7 ? 'strong material focus' : 'artistic inclinations'}.` : ''} Values comfort and consistency.`,
            hi: `स्थिर और व्यावहारिक मानसिकता। धैर्यवान निर्णय निर्माता। ${ascLordPlanet ? `शुक्र ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 2 || ascLordPlanet.house === 7 ? 'मजबूत भौतिक फोकस' : 'कलात्मक झुकाव'} लाता है।` : ''} आराम और निरंतरता को महत्व देते हैं।`
        },
        'Gemini': {
            en: `Intellectual and communicative nature. Quick-thinking with versatile interests. ${ascLordPlanet ? `Mercury in ${ascLordPlanet.house}th house enhances ${ascLordPlanet.house === 3 || ascLordPlanet.house === 9 ? 'communication skills' : 'analytical abilities'}.` : ''} Adaptable personality.`,
            hi: `बौद्धिक और संवादी स्वभाव। तेज सोच, बहुमुखी रुचियां। ${ascLordPlanet ? `बुध ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 3 || ascLordPlanet.house === 9 ? 'संचार कौशल' : 'विश्लेषणात्मक क्षमता'} बढ़ाता है।` : ''} अनुकूलनीय व्यक्तित्व।`
        },
        'Cancer': {
            en: `Emotional and nurturing personality. Intuitive decision-maker. ${ascLordPlanet ? `Moon in ${ascLordPlanet.house}th house creates ${ascLordPlanet.house === 4 ? 'deep emotional security needs' : 'caring nature'}.` : ''} Strong family orientation.`,
            hi: `भावुक और पोषण करने वाला व्यक्तित्व। सहज निर्णय निर्माता। ${ascLordPlanet ? `चंद्र ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 4 ? 'गहरी भावनात्मक सुरक्षा की आवश्यकता' : 'देखभाल करने वाला स्वभाव'} बनाता है।` : ''} मजबूत पारिवारिक अभिविन्यास।`
        },
        'Leo': {
            en: `Confident and authoritative presence. Natural leader with creative flair. ${ascLordPlanet ? `Sun in ${ascLordPlanet.house}th house gives ${ascLordPlanet.house === 1 || ascLordPlanet.house === 10 ? 'strong leadership drive' : 'self-expression needs'}.` : ''} Dignified personality.`,
            hi: `आत्मविश्वासी और आधिकारिक उपस्थिति। रचनात्मक स्वभाव के साथ प्राकृतिक नेता। ${ascLordPlanet ? `सूर्य ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 1 || ascLordPlanet.house === 10 ? 'मजबूत नेतृत्व ड्राइव' : 'आत्म-अभिव्यक्ति की आवश्यकता'} देता है।` : ''} गरिमामय व्यक्तित्व।`
        },
        'Virgo': {
            en: `Analytical and detail-oriented mind. Methodical decision-maker. ${ascLordPlanet ? `Mercury in ${ascLordPlanet.house}th house enhances ${ascLordPlanet.house === 6 ? 'service orientation' : 'perfectionist tendencies'}.` : ''} Practical and organized.`,
            hi: `विश्लेषणात्मक और विस्तार-उन्मुख मन। व्यवस्थित निर्णय निर्माता। ${ascLordPlanet ? `बुध ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 6 ? 'सेवा अभिविन्यास' : 'पूर्णतावादी प्रवृत्तियां'} बढ़ाता है।` : ''} व्यावहारिक और संगठित।`
        },
        'Libra': {
            en: `Diplomatic and balanced approach. Relationship-focused personality. ${ascLordPlanet ? `Venus in ${ascLordPlanet.house}th house brings ${ascLordPlanet.house === 7 ? 'strong partnership needs' : 'harmonious nature'}.` : ''} Values fairness and beauty.`,
            hi: `कूटनीतिक और संतुलित दृष्टिकोण। संबंध-केंद्रित व्यक्तित्व। ${ascLordPlanet ? `शुक्र ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 7 ? 'मजबूत साझेदारी की आवश्यकता' : 'सामंजस्यपूर्ण स्वभाव'} लाता है।` : ''} निष्पक्षता और सुंदरता को महत्व देते हैं।`
        },
        'Scorpio': {
            en: `Intense and transformative nature. Deep thinker with strong willpower. ${ascLordPlanet ? `Mars in ${ascLordPlanet.house}th house creates ${ascLordPlanet.house === 8 ? 'investigative mindset' : 'passionate drive'}.` : ''} Mysterious personality.`,
            hi: `तीव्र और परिवर्तनकारी स्वभाव। मजबूत इच्छाशक्ति के साथ गहरा विचारक। ${ascLordPlanet ? `मंगल ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 8 ? 'खोजी मानसिकता' : 'भावुक ड्राइव'} बनाता है।` : ''} रहस्यमय व्यक्तित्व।`
        },
        'Sagittarius': {
            en: `Optimistic and philosophical mindset. Adventurous decision-maker. ${ascLordPlanet ? `Jupiter in ${ascLordPlanet.house}th house enhances ${ascLordPlanet.house === 9 ? 'wisdom and higher learning' : 'expansive thinking'}.` : ''} Freedom-loving nature.`,
            hi: `आशावादी और दार्शनिक मानसिकता। साहसिक निर्णय निर्माता। ${ascLordPlanet ? `गुरु ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 9 ? 'ज्ञान और उच्च शिक्षा' : 'विस्तृत सोच'} बढ़ाता है।` : ''} स्वतंत्रता-प्रेमी स्वभाव।`
        },
        'Capricorn': {
            en: `Disciplined and ambitious personality. Strategic long-term planner. ${ascLordPlanet ? `Saturn in ${ascLordPlanet.house}th house brings ${ascLordPlanet.house === 10 ? 'strong career focus' : 'responsible nature'}.` : ''} Patient and persistent.`,
            hi: `अनुशासित और महत्वाकांक्षी व्यक्तित्व। रणनीतिक दीर्घकालिक योजनाकार। ${ascLordPlanet ? `शनि ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 10 ? 'मजबूत करियर फोकस' : 'जिम्मेदार स्वभाव'} लाता है।` : ''} धैर्यवान और दृढ़।`
        },
        'Aquarius': {
            en: `Innovative and humanitarian thinking. Independent decision-maker. ${ascLordPlanet ? `Saturn in ${ascLordPlanet.house}th house creates ${ascLordPlanet.house === 11 ? 'social consciousness' : 'unique perspectives'}.` : ''} Progressive mindset.`,
            hi: `नवीन और मानवतावादी सोच। स्वतंत्र निर्णय निर्माता। ${ascLordPlanet ? `शनि ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 11 ? 'सामाजिक चेतना' : 'अनूठा दृष्टिकोण'} बनाता है।` : ''} प्रगतिशील मानसिकता।`
        },
        'Pisces': {
            en: `Intuitive and compassionate nature. Imaginative thinker. ${ascLordPlanet ? `Jupiter in ${ascLordPlanet.house}th house enhances ${ascLordPlanet.house === 12 ? 'spiritual inclinations' : 'creative abilities'}.` : ''} Empathetic personality.`,
            hi: `सहज और दयालु स्वभाव। कल्पनाशील विचारक। ${ascLordPlanet ? `गुरु ${ascLordPlanet.house}वें भाव में ${ascLordPlanet.house === 12 ? 'आध्यात्मिक झुकाव' : 'रचनात्मक क्षमताएं'} बढ़ाता है।` : ''} सहानुभूतिपूर्ण व्यक्तित्व।`
        }
    };

    return personalities[ascSign] ? personalities[ascSign][language] : 'Analysis not available';
}

// 2. MOON SIGN - EMOTIONS ANALYSIS
function analyzeMoonEmotions(kundali, language = 'en') {
    const moonSign = kundali.moonSign;
    const moon = getPlanetByName(kundali.planets, 'Moon');

    const emotions = {
        'Aries': {
            en: `Quick emotional responses, passionate feelings. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 4 ? 'emotional independence needs' : 'active emotional expression'}.` : ''} Handles stress through action.`,
            hi: `त्वरित भावनात्मक प्रतिक्रियाएं, भावुक भावनाएं। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 4 ? 'भावनात्मक स्वतंत्रता की आवश्यकता' : 'सक्रिय भावनात्मक अभिव्यक्ति'} बनाता है।` : ''} कार्रवाई के माध्यम से तनाव संभालते हैं।`
        },
        'Taurus': {
            en: `Stable emotions, seeks comfort. ${moon ? `Moon in ${moon.house}th house brings ${moon.house === 2 ? 'emotional security through resources' : 'steady feelings'}.` : ''} Handles stress through routine and stability.`,
            hi: `स्थिर भावनाएं, आराम की तलाश। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 2 ? 'संसाधनों के माध्यम से भावनात्मक सुरक्षा' : 'स्थिर भावनाएं'} लाता है।` : ''} दिनचर्या और स्थिरता के माध्यम से तनाव संभालते हैं।`
        },
        'Gemini': {
            en: `Variable moods, intellectualizes feelings. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 3 ? 'emotional expression through communication' : 'mental emotional processing'}.` : ''} Handles stress through talking and learning.`,
            hi: `परिवर्तनशील मूड, भावनाओं को बौद्धिक बनाते हैं। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 3 ? 'संचार के माध्यम से भावनात्मक अभिव्यक्ति' : 'मानसिक भावनात्मक प्रसंस्करण'} बनाता है।` : ''} बात करने और सीखने के माध्यम से तनाव संभालते हैं।`
        },
        'Cancer': {
            en: `Deep emotional sensitivity, nurturing nature. ${moon ? `Moon in ${moon.house}th house (own sign strength) brings ${moon.house === 4 ? 'very strong emotional foundation' : 'caring instincts'}.` : ''} Handles stress through family and home.`,
            hi: `गहरी भावनात्मक संवेदनशीलता, पोषण करने वाला स्वभाव। ${moon ? `चंद्र ${moon.house}वें भाव में (स्वराशि शक्ति) ${moon.house === 4 ? 'बहुत मजबूत भावनात्मक नींव' : 'देखभाल की प्रवृत्ति'} लाता है।` : ''} परिवार और घर के माध्यम से तनाव संभालते हैं।`
        },
        'Leo': {
            en: `Proud emotions, needs recognition. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 5 ? 'creative emotional expression' : 'dignified feelings'}.` : ''} Handles stress through self-expression and creativity.`,
            hi: `गर्व की भावनाएं, मान्यता की आवश्यकता। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 5 ? 'रचनात्मक भावनात्मक अभिव्यक्ति' : 'गरिमामय भावनाएं'} बनाता है।` : ''} आत्म-अभिव्यक्ति और रचनात्मकता के माध्यम से तनाव संभालते हैं।`
        },
        'Virgo': {
            en: `Analytical emotions, practical feelings. ${moon ? `Moon in ${moon.house}th house brings ${moon.house === 6 ? 'service-oriented emotional fulfillment' : 'organized emotional responses'}.` : ''} Handles stress through organization and service.`,
            hi: `विश्लेषणात्मक भावनाएं, व्यावहारिक भावनाएं। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 6 ? 'सेवा-उन्मुख भावनात्मक संतुष्टि' : 'संगठित भावनात्मक प्रतिक्रियाएं'} लाता है।` : ''} संगठन और सेवा के माध्यम से तनाव संभालते हैं।`
        },
        'Libra': {
            en: `Balanced emotions, seeks harmony. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 7 ? 'emotional fulfillment through partnerships' : 'diplomatic feelings'}.` : ''} Handles stress through relationships and beauty.`,
            hi: `संतुलित भावनाएं, सामंजस्य की तलाश। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 7 ? 'साझेदारी के माध्यम से भावनात्मक संतुष्टि' : 'कूटनीतिक भावनाएं'} बनाता है।` : ''} संबंधों और सुंदरता के माध्यम से तनाव संभालते हैं।`
        },
        'Scorpio': {
            en: `Intense emotions, deep feelings. ${moon ? `Moon in ${moon.house}th house brings ${moon.house === 8 ? 'transformative emotional experiences' : 'passionate emotional depth'}.` : ''} Handles stress through transformation and introspection.`,
            hi: `तीव्र भावनाएं, गहरी भावनाएं। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 8 ? 'परिवर्तनकारी भावनात्मक अनुभव' : 'भावुक भावनात्मक गहराई'} लाता है।` : ''} परिवर्तन और आत्मनिरीक्षण के माध्यम से तनाव संभालते हैं।`
        },
        'Sagittarius': {
            en: `Optimistic emotions, philosophical feelings. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 9 ? 'emotional growth through wisdom' : 'adventurous emotional nature'}.` : ''} Handles stress through learning and travel.`,
            hi: `आशावादी भावनाएं, दार्शनिक भावनाएं। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 9 ? 'ज्ञान के माध्यम से भावनात्मक विकास' : 'साहसिक भावनात्मक स्वभाव'} बनाता है।` : ''} सीखने और यात्रा के माध्यम से तनाव संभालते हैं।`
        },
        'Capricorn': {
            en: `Controlled emotions, practical feelings. ${moon ? `Moon in ${moon.house}th house brings ${moon.house === 10 ? 'emotional fulfillment through achievement' : 'disciplined emotional responses'}.` : ''} Handles stress through work and responsibility.`,
            hi: `नियंत्रित भावनाएं, व्यावहारिक भावनाएं। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 10 ? 'उपलब्धि के माध्यम से भावनात्मक संतुष्टि' : 'अनुशासित भावनात्मक प्रतिक्रियाएं'} लाता है।` : ''} काम और जिम्मेदारी के माध्यम से तनाव संभालते हैं।`
        },
        'Aquarius': {
            en: `Detached emotions, unique feelings. ${moon ? `Moon in ${moon.house}th house creates ${moon.house === 11 ? 'emotional fulfillment through social causes' : 'independent emotional nature'}.` : ''} Handles stress through innovation and friendship.`,
            hi: `अलग भावनाएं, अनूठी भावनाएं। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 11 ? 'सामाजिक कारणों के माध्यम से भावनात्मक संतुष्टि' : 'स्वतंत्र भावनात्मक स्वभाव'} बनाता है।` : ''} नवाचार और दोस्ती के माध्यम से तनाव संभालते हैं।`
        },
        'Pisces': {
            en: `Compassionate emotions, intuitive feelings. ${moon ? `Moon in ${moon.house}th house brings ${moon.house === 12 ? 'spiritual emotional depth' : 'empathetic emotional nature'}.` : ''} Handles stress through spirituality and creativity.`,
            hi: `दयालु भावनाएं, सहज भावनाएं। ${moon ? `चंद्र ${moon.house}वें भाव में ${moon.house === 12 ? 'आध्यात्मिक भावनात्मक गहराई' : 'सहानुभूतिपूर्ण भावनात्मक स्वभाव'} लाता है।` : ''} आध्यात्मिकता और रचनात्मकता के माध्यम से तनाव संभालते हैं।`
        }
    };

    return emotions[moonSign] ? emotions[moonSign][language] : 'Analysis not available';
}

// Continue in next file part...
