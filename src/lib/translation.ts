/**
 * Translation utility for WhatsApp messages
 * Uses Google Translate's free endpoint for English to Hindi translation
 */

interface TranslationMap {
    [key: string]: string;
}

// Common phrases translation map (fallback)
const commonPhrases: TranslationMap = {
    // Greetings
    'hello': 'नमस्ते',
    'hi': 'नमस्कार',
    'good morning': 'सुप्रभात',
    'good afternoon': 'शुभ दोपहर',
    'good evening': 'शुभ संध्या',
    'good night': 'शुभ रात्रि',

    // Common words
    'thank you': 'धन्यवाद',
    'thanks': 'धन्यवाद',
    'please': 'कृपया',
    'welcome': 'स्वागत है',
    'you': 'आप',
    'your': 'आपका',
    'we': 'हम',
    'our': 'हमारा',
    'and': 'और',
    'or': 'या',

    // Business terms
    'subscription': 'सदस्यता',
    'offer': 'प्रस्ताव',
    'discount': 'छूट',
    'free': 'मुफ्त',
    'new': 'नया',
    'update': 'अपडेट',
    'service': 'सेवा',
    'customer': 'ग्राहक',
    'user': 'उपयोगकर्ता',
    'team': 'टीम',

    // Astrology terms
    'kundali': 'कुंडली',
    'horoscope': 'राशिफल',
    'astrology': 'ज्योतिष',
    'prediction': 'भविष्यवाणी',
    'consultation': 'परामर्श',
    'astrologer': 'ज्योतिषी',
    'pandit': 'पंडित',
};

/**
 * Translate text using Google Translate's free endpoint
 */
export async function translateToHindi(text: string): Promise<string> {
    if (!text || text.trim() === '') return text;

    try {
        // Use Google Translate's free endpoint
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url);
        const data = await response.json();

        // Extract translated text from response
        if (data && data[0] && Array.isArray(data[0])) {
            const translatedParts = data[0].map((part: any) => part[0]).filter(Boolean);
            return translatedParts.join('');
        }

        // Fallback to phrase replacement if API fails
        return translateWithPhrases(text);
    } catch (error) {
        console.error('Translation error:', error);
        // Fallback to phrase replacement
        return translateWithPhrases(text);
    }
}

/**
 * Fallback translation using phrase replacement
 */
function translateWithPhrases(text: string): string {
    let translated = text;

    // Replace common phrases (case insensitive)
    Object.entries(commonPhrases).forEach(([english, hindi]) => {
        if (english) {
            const regex = new RegExp(`\\b${english}\\b`, 'gi');
            translated = translated.replace(regex, hindi);
        }
    });

    return translated;
}

/**
 * Synchronous translation (uses phrase replacement only)
 */
export function translateToHindiSync(text: string): string {
    if (!text || text.trim() === '') return text;
    return translateWithPhrases(text);
}
