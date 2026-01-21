// Phallit Analysis Functions for Kundali Predictions
// These functions generate bilingual predictions based on planetary positions

function analyzeLagnaPersonality(lagna, planets, lang) {
    const traits = {
        "Aries": { en: "Dynamic, energetic, and pioneering. Natural leader with courage and initiative.", hi: "गतिशील, ऊर्जावान और अग्रणी। साहस और पहल के साथ स्वाभाविक नेता।" },
        "Taurus": { en: "Stable, practical, and determined. Values security and material comforts.", hi: "स्थिर, व्यावहारिक और दृढ़। सुरक्षा और भौतिक सुख-सुविधाओं को महत्व देते हैं।" },
        "Gemini": { en: "Communicative, versatile, and intellectual. Quick-witted with diverse interests.", hi: "संवादी, बहुमुखी और बुद्धिमान। विविध रुचियों के साथ तेज-तर्रार।" },
        "Cancer": { en: "Emotional, nurturing, and intuitive. Strong family bonds and protective nature.", hi: "भावुक, पालन-पोषण करने वाले और सहज। मजबूत पारिवारिक बंधन और सुरक्षात्मक स्वभाव।" },
        "Leo": { en: "Confident, charismatic, and creative. Natural performer with strong leadership.", hi: "आत्मविश्वासी, करिश्माई और रचनात्मक। मजबूत नेतृत्व के साथ स्वाभाविक कलाकार।" },
        "Virgo": { en: "Analytical, detail-oriented, and service-minded. Perfectionist with practical approach.", hi: "विश्लेषणात्मक, विस्तार-उन्मुख और सेवा-भावी। व्यावहारिक दृष्टिकोण के साथ पूर्णतावादी।" },
        "Libra": { en: "Diplomatic, balanced, and artistic. Values harmony and relationships.", hi: "कूटनीतिक, संतुलित और कलात्मक। सद्भाव और रिश्तों को महत्व देते हैं।" },
        "Scorpio": { en: "Intense, passionate, and transformative. Deep emotional nature with strong willpower.", hi: "तीव्र, भावुक और परिवर्तनकारी। मजबूत इच्छाशक्ति के साथ गहरी भावनात्मक प्रकृति।" },
        "Sagittarius": { en: "Optimistic, philosophical, and adventurous. Love for freedom and higher knowledge.", hi: "आशावादी, दार्शनिक और साहसी। स्वतंत्रता और उच्च ज्ञान के लिए प्रेम।" },
        "Capricorn": { en: "Ambitious, disciplined, and responsible. Goal-oriented with strong work ethic.", hi: "महत्वाकांक्षी, अनुशासित और जिम्मेदार। मजबूत कार्य नैतिकता के साथ लक्ष्य-उन्मुख।" },
        "Aquarius": { en: "Innovative, humanitarian, and independent. Progressive thinker with unique ideas.", hi: "नवीन, मानवतावादी और स्वतंत्र। अनोखे विचारों के साथ प्रगतिशील विचारक।" },
        "Pisces": { en: "Compassionate, intuitive, and artistic. Spiritual nature with deep empathy.", hi: "दयालु, सहज और कलात्मक। गहरी सहानुभूति के साथ आध्यात्मिक प्रकृति।" }
    };
    return traits[lagna]?.[lang] || (lang === 'en' ? 'Personality analysis based on your ascendant sign.' : 'आपके लग्न राशि के आधार पर व्यक्तित्व विश्लेषण।');
}

function analyzeMoonEmotions(moonSign, moonData, lang) {
    const emotions = {
        "Aries": { en: "Quick emotional responses, passionate feelings. Need for action and independence.", hi: "त्वरित भावनात्मक प्रतिक्रियाएं, भावुक भावनाएं। कार्रवाई और स्वतंत्रता की आवश्यकता।" },
        "Taurus": { en: "Stable emotions, need for security. Comfort-seeking and loyal in relationships.", hi: "स्थिर भावनाएं, सुरक्षा की आवश्यकता। आराम की तलाश और रिश्तों में वफादार।" },
        "Gemini": { en: "Changeable moods, intellectual emotions. Need for communication and variety.", hi: "परिवर्तनशील मनोदशा, बौद्धिक भावनाएं। संचार और विविधता की आवश्यकता।" },
        "Cancer": { en: "Deep emotions, nurturing instincts. Strong attachment to home and family.", hi: "गहरी भावनाएं, पालन-पोषण की प्रवृत्ति। घर और परिवार से मजबूत लगाव।" },
        "Leo": { en: "Warm-hearted, generous emotions. Need for recognition and appreciation.", hi: "गर्मजोशी, उदार भावनाएं। मान्यता और प्रशंसा की आवश्यकता।" },
        "Virgo": { en: "Analytical emotions, practical care. Service-oriented with attention to detail.", hi: "विश्लेषणात्मक भावनाएं, व्यावहारिक देखभाल। विस्तार पर ध्यान के साथ सेवा-उन्मुख।" },
        "Libra": { en: "Balanced emotions, need for harmony. Relationship-focused and diplomatic.", hi: "संतुलित भावनाएं, सद्भाव की आवश्यकता। रिश्ते-केंद्रित और कूटनीतिक।" },
        "Scorpio": { en: "Intense emotions, deep feelings. Transformative experiences and strong intuition.", hi: "तीव्र भावनाएं, गहरी भावनाएं। परिवर्तनकारी अनुभव और मजबूत अंतर्ज्ञान।" },
        "Sagittarius": { en: "Optimistic emotions, philosophical outlook. Need for freedom and adventure.", hi: "आशावादी भावनाएं, दार्शनिक दृष्टिकोण। स्वतंत्रता और रोमांच की आवश्यकता।" },
        "Capricorn": { en: "Controlled emotions, practical approach. Responsible and goal-oriented feelings.", hi: "नियंत्रित भावनाएं, व्यावहारिक दृष्टिकोण। जिम्मेदार और लक्ष्य-उन्मुख भावनाएं।" },
        "Aquarius": { en: "Detached emotions, humanitarian feelings. Independent and progressive mindset.", hi: "अलग भावनाएं, मानवतावादी भावनाएं। स्वतंत्र और प्रगतिशील मानसिकता।" },
        "Pisces": { en: "Empathetic emotions, spiritual feelings. Compassionate and imaginative nature.", hi: "सहानुभूतिपूर्ण भावनाएं, आध्यात्मिक भावनाएं। दयालु और कल्पनाशील प्रकृति।" }
    };
    return emotions[moonSign]?.[lang] || (lang === 'en' ? 'Emotional nature based on Moon sign.' : 'चंद्र राशि के आधार पर भावनात्मक प्रकृति।');
}

function analyzeEducation(planets, lagna, lang) {
    if (lang === 'en') {
        return "Education prospects are favorable. Focus on subjects that interest you. Jupiter and Mercury influence learning abilities. Higher education recommended for career growth.";
    } else {
        return "शिक्षा की संभावनाएं अनुकूल हैं। उन विषयों पर ध्यान दें जो आपको रुचिकर लगते हैं। बृहस्पति और बुध सीखने की क्षमताओं को प्रभावित करते हैं। करियर विकास के लिए उच्च शिक्षा की सिफारिश की जाती है।";
    }
}

function analyzeCareer(planets, lagna, lang) {
    if (lang === 'en') {
        return "Career success through hard work and dedication. Leadership roles suit you. Business or service sector both favorable. Mid-career growth expected. Saturn and Sun influence professional life.";
    } else {
        return "कड़ी मेहनत और समर्पण के माध्यम से करियर में सफलता। नेतृत्व की भूमिकाएं आपके अनुकूल हैं। व्यवसाय या सेवा क्षेत्र दोनों अनुकूल हैं। मध्य-करियर विकास की उम्मीद है। शनि और सूर्य पेशेवर जीवन को प्रभावित करते हैं।";
    }
}

function analyzeWealth(planets, lagna, lang) {
    if (lang === 'en') {
        return "Financial stability through consistent efforts. Multiple income sources possible. Property and investments bring gains. Venus and Jupiter influence wealth. Save for long-term security.";
    } else {
        return "निरंतर प्रयासों के माध्यम से वित्तीय स्थिरता। कई आय स्रोत संभव हैं। संपत्ति और निवेश लाभ लाते हैं। शुक्र और बृहस्पति धन को प्रभावित करते हैं। दीर्घकालिक सुरक्षा के लिए बचत करें।";
    }
}

function analyzeRelationships(planets, lagna, mangalDosha, lang) {
    if (lang === 'en') {
        return `Marriage prospects are ${mangalDosha === 'No' ? 'favorable' : 'moderate'}. ${mangalDosha !== 'No' ? 'Mangal Dosha present - consult astrologer for remedies. ' : ''}Partner compatibility important. Venus influences love life. Family support strong. Communication key to harmony.`;
    } else {
        return `विवाह की संभावनाएं ${mangalDosha === 'No' ? 'अनुकूल' : 'मध्यम'} हैं। ${mangalDosha !== 'No' ? 'मंगल दोष उपस्थित - उपायों के लिए ज्योतिषी से परामर्श करें। ' : ''}साथी अनुकूलता महत्वपूर्ण है। शुक्र प्रेम जीवन को प्रभावित करता है। पारिवारिक समर्थन मजबूत है। सद्भाव की कुंजी संचार है।`;
    }
}

function analyzeHealth(planets, lagna, lang) {
    if (lang === 'en') {
        return "Overall health good with proper care. Watch for stress-related issues. Regular exercise recommended. Digestive system needs attention. Moon and Mars influence vitality. Maintain work-life balance.";
    } else {
        return "उचित देखभाल के साथ समग्र स्वास्थ्य अच्छा है। तनाव से संबंधित मुद्दों पर ध्यान दें। नियमित व्यायाम की सिफारिश की जाती है। पाचन तंत्र पर ध्यान देने की आवश्यकता है। चंद्रमा और मंगल जीवन शक्ति को प्रभावित करते हैं। कार्य-जीवन संतुलन बनाए रखें।";
    }
}

function analyzeDoshasYogas(planets, mangalDosha, lang) {
    if (lang === 'en') {
        return `Mangal Dosha: ${mangalDosha}. ${mangalDosha !== 'No' ? 'Remedies recommended for harmonious married life. ' : ''}Beneficial yogas present for success. Planetary combinations favor growth. Consult expert for detailed yoga analysis.`;
    } else {
        return `मंगल दोष: ${mangalDosha}। ${mangalDosha !== 'No' ? 'सुखी वैवाहिक जीवन के लिए उपायों की सिफारिश की जाती है। ' : ''}सफलता के लिए लाभकारी योग उपस्थित हैं। ग्रह संयोजन विकास के पक्ष में हैं। विस्तृत योग विश्लेषण के लिए विशेषज्ञ से परामर्श करें।`;
    }
}

function analyzeDashaPredictions(vimshottariDasha, planets, lang) {
    const currentDasha = vimshottariDasha.currentDasha.planet;
    if (lang === 'en') {
        return `Currently running ${currentDasha} Mahadasha. This period brings ${currentDasha}-related experiences. Focus on ${currentDasha}'s significations for best results. Next 5-10 years show progressive growth. Plan major decisions according to dasha periods.`;
    } else {
        return `वर्तमान में ${currentDasha} महादशा चल रही है। यह अवधि ${currentDasha} से संबंधित अनुभव लाती है। सर्वोत्तम परिणामों के लिए ${currentDasha} के संकेतों पर ध्यान दें। अगले 5-10 वर्ष प्रगतिशील विकास दिखाते हैं। दशा अवधि के अनुसार प्रमुख निर्णयों की योजना बनाएं।`;
    }
}

function generateRemedies(planets, mangalDosha, lang) {
    if (lang === 'en') {
        return `Recommended remedies: ${mangalDosha !== 'No' ? 'For Mangal Dosha - worship Lord Hanuman on Tuesdays. ' : ''}Chant mantras of weak planets. Donate to charity on auspicious days. Wear recommended gemstones after consultation. Practice meditation and yoga for balance.`;
    } else {
        return `अनुशंसित उपाय: ${mangalDosha !== 'No' ? 'मंगल दोष के लिए - मंगलवार को हनुमान जी की पूजा करें। ' : ''}कमजोर ग्रहों के मंत्रों का जाप करें। शुभ दिनों पर दान करें। परामर्श के बाद अनुशंसित रत्न पहनें। संतुलन के लिए ध्यान और योग का अभ्यास करें।`;
    }
}

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
    generateRemedies
};
