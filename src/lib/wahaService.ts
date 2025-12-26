// Baileys WhatsApp Service - Updated to use astro-engine endpoints
const ASTRO_ENGINE_URL = process.env.NEXT_PUBLIC_ASTRO_ENGINE_URL || 'https://astro-engine-production.up.railway.app';

interface WhatsAppStatus {
    status: 'DISCONNECTED' | 'CONNECTING' | 'SCAN_QR' | 'CONNECTED';
    qr?: string;
    connected: boolean;
}

/**
 * Format phone number for WhatsApp (ensure country code)
 */
export function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If number starts with 0, remove it (Indian numbers)
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }

    // If number doesn't start with country code, add 91 for India
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }

    console.log('[formatPhoneNumber] Original:', phone, '-> Formatted:', cleaned);
    return cleaned;
}

/**
 * Get WhatsApp connection status and QR code
 */
export async function getWhatsAppStatus(): Promise<WhatsAppStatus | null> {
    try {
        const response = await fetch('/api/whatsapp/status');
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('WhatsApp status check error:', error);
        return null;
    }
}

/**
 * Send WhatsApp message via Baileys
 */
export async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
        // Format phone number to ensure proper format
        const formattedPhone = formatPhoneNumber(phoneNumber);

        console.log('[wahaService] ═══════════════════════════════════════');
        console.log('[wahaService] Sending WhatsApp message');
        console.log('[wahaService] Original phone:', phoneNumber);
        console.log('[wahaService] Formatted phone:', formattedPhone);
        console.log('[wahaService] Message length:', message.length);
        console.log('[wahaService] Message preview:', message.substring(0, 150) + '...');
        console.log('[wahaService] Target URL:', `${ASTRO_ENGINE_URL}/whatsapp/send`);

        const response = await fetch(`${ASTRO_ENGINE_URL}/whatsapp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: formattedPhone, message })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[wahaService] ❌ Send failed with status:', response.status);
            console.error('[wahaService] Error response:', errorText);
            return false;
        }

        console.log('[wahaService] ✅ Message sent successfully to:', formattedPhone);
        console.log('[wahaService] ═══════════════════════════════════════');
        return true;
    } catch (error) {
        console.error('[wahaService] ❌ WhatsApp send error:', error);
        console.error('[wahaService] Error details:', error instanceof Error ? error.message : 'Unknown error');
        console.error('[wahaService] ═══════════════════════════════════════');
        return false;
    }
}

/**
 * Disconnect WhatsApp
 */
export async function disconnectWhatsApp(): Promise<boolean> {
    try {
        const response = await fetch(`${ASTRO_ENGINE_URL}/whatsapp/disconnect`, {
            method: 'POST'
        });
        return response.ok;
    } catch (error) {
        console.error('WhatsApp disconnect error:', error);
        return false;
    }
}

/**
 * Reconnect WhatsApp
 */
export async function reconnectWhatsApp(): Promise<boolean> {
    try {
        const response = await fetch(`${ASTRO_ENGINE_URL}/whatsapp/reconnect`, {
            method: 'POST'
        });
        return response.ok;
    } catch (error) {
        console.error('WhatsApp reconnect error:', error);
        return false;
    }
}

/**
 * Format Mahurat message for WhatsApp - handles multiple mahurats
 */
export function formatMahuratMessage(mahurats: any[], purpose: string, rashi: string): string {
    // Hindi translations for purpose
    const purposeTranslations: Record<string, string> = {
        'marriage': 'विवाह',
        'business': 'व्यापार',
        'housewarming': 'गृह प्रवेश',
        'travel': 'यात्रा',
        'education': 'शिक्षा',
        'naming': 'नामकरण',
        'vehicle': 'वाहन खरीद',
        'investment': 'निवेश'
    };

    // Hindi translations for rashi
    const rashiTranslations: Record<string, string> = {
        'aries': 'मेष',
        'taurus': 'वृषभ',
        'gemini': 'मिथुन',
        'cancer': 'कर्क',
        'leo': 'सिंह',
        'virgo': 'कन्या',
        'libra': 'तुला',
        'scorpio': 'वृश्चिक',
        'sagittarius': 'धनु',
        'capricorn': 'मकर',
        'aquarius': 'कुंभ',
        'pisces': 'मीन'
    };

    const purposeHindi = purposeTranslations[purpose?.toLowerCase()] || purpose;
    const rashiHindi = rashiTranslations[rashi?.toLowerCase()] || rashi;

    // Format all mahurats in Hindi
    const hindiMahurats = mahurats.map((m, index) => {
        const auspiciousnessHindi = m.auspiciousness === 'highly_auspicious' ? 'अत्यंत शुभ' :
            m.auspiciousness === 'auspicious' ? 'शुभ' : 'सामान्य';

        return `${index + 1}. 📅 तिथि: ${m.date || 'N/A'}
   ⏰ समय: ${m.time || 'N/A'}
   ✨ शुभता: ${auspiciousnessHindi}
   📝 सिफारिश: ${m.recommendation || 'कोई विशेष सिफारिश नहीं'}`;
    }).join('\n\n');

    // Complete Hindi Section
    const hindiSection = `🕉️ *मुहूर्त विवरण* 🕉️

🎯 *उद्देश्य:* ${purposeHindi}
♈ *राशि:* ${rashiHindi}

*शुभ मुहूर्त:*

${hindiMahurats}

🙏 शुभकामनाएं!
- विप्रकर्म टीम`;

    // Format all mahurats in English
    const englishMahurats = mahurats.map((m, index) => {
        const auspiciousnessEng = m.auspiciousness === 'highly_auspicious' ? 'Highly Auspicious' :
            m.auspiciousness === 'auspicious' ? 'Auspicious' : 'Moderate';

        return `${index + 1}. 📅 Date: ${m.date || 'N/A'}
   ⏰ Time: ${m.time || 'N/A'}
   ✨ Auspiciousness: ${auspiciousnessEng}
   📝 Recommendation: ${m.recommendation || 'No specific recommendation'}`;
    }).join('\n\n');

    // Complete English Section
    const englishSection = `🕉️ *Mahurat Details* 🕉️

🎯 *Purpose:* ${purpose}
♈ *Rashi:* ${rashi}

*Auspicious Times:*

${englishMahurats}

🙏 Best Wishes!
- VipraKarma Team`;

    // Combine with separator
    return `${hindiSection}\n\n${'═'.repeat(30)}\n\n${englishSection}`;
}



/**
 * Send bulk WhatsApp messages
 */
export async function sendBulkWhatsApp(
    users: Array<{ phone: string; name: string }>,
    message: string,
    senderInfo: { name: string; phone: string },
    messageLanguage: 'en' | 'hi' = 'en'
): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    // Format message based on language
    let fullMessage: string;
    if (messageLanguage === 'hi') {
        fullMessage = `नमस्ते,\n\n${message}\n\nसादर,\n${senderInfo.name}\n${senderInfo.phone}\n\n- विप्रकर्म टीम`;
    } else {
        fullMessage = `Hello,\n\n${message}\n\nRegards,\n${senderInfo.name}\n${senderInfo.phone}\n\n- VipraKarma Team`;
    }

    console.log(`[sendBulkWhatsApp] Sending to ${users.length} users in ${messageLanguage === 'hi' ? 'Hindi' : 'English'}`);

    for (const user of users) {
        if (!user.phone) {
            failed++;
            continue;
        }

        const sent = await sendWhatsAppMessage(user.phone, fullMessage);
        if (sent) {
            success++;
            console.log(`[sendBulkWhatsApp] ✓ Sent to ${user.name} (${user.phone})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
            failed++;
            console.log(`[sendBulkWhatsApp] ✗ Failed to send to ${user.name} (${user.phone})`);
        }
    }

    console.log(`[sendBulkWhatsApp] Complete: ${success} sent, ${failed} failed`);
    return { success, failed };
}
