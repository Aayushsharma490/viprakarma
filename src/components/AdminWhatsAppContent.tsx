'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Users, Loader2, QrCode, Wifi, WifiOff, RefreshCw, Languages } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { translateToHindi } from '@/lib/translation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminWhatsAppContent() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [whatsappStatus, setWhatsappStatus] = useState<any>(null);
    const [formData, setFormData] = useState({
        senderName: '',
        senderPhone: '',
        message: '',
        messageLanguage: 'en' as 'en' | 'hi'
    });
    const [stats, setStats] = useState<{ success: number; failed: number } | null>(null);

    // Poll WhatsApp status every 3 seconds
    useEffect(() => {
        fetchWhatsAppStatus();
        const interval = setInterval(fetchWhatsAppStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchWhatsAppStatus = async () => {
        try {
            const response = await fetch('/api/whatsapp/status');
            if (response.ok) {
                const data = await response.json();
                setWhatsappStatus(data);
            }
        } catch (error) {
            console.error('Failed to fetch WhatsApp status:', error);
        }
    };

    const handleAutoTranslate = async () => {
        if (!formData.message.trim()) {
            toast.error('Please enter a message first');
            return;
        }

        setTranslating(true);
        try {
            const translated = await translateToHindi(formData.message);
            setFormData({ ...formData, message: translated });
            toast.success('Message translated to Hindi!');
        } catch (error) {
            console.error('Translation error:', error);
            toast.error('Translation failed. Please try again.');
        } finally {
            setTranslating(false);
        }
    };

    const handleReconnect = async () => {
        console.log('[Admin WhatsApp] 🔄 Reconnecting WhatsApp...');
        try {
            const response = await fetch('/api/whatsapp/reconnect', {
                method: 'POST'
            });
            if (response.ok) {
                console.log('[Admin WhatsApp] ✓ Reconnect initiated');
                toast.success('Reconnecting WhatsApp... QR code will appear shortly.');
                setTimeout(() => {
                    console.log('[Admin WhatsApp] 🔍 Fetching status to display QR...');
                    fetchWhatsAppStatus();
                }, 2000);
            } else {
                console.error('[Admin WhatsApp] ❌ Reconnect failed');
                toast.error('Failed to reconnect');
            }
        } catch (error) {
            console.error('[Admin WhatsApp] ❌ Reconnect error:', error);
            toast.error('Failed to reconnect');
        }
    };

    const handleForgotLogin = async () => {
        console.log('[Admin WhatsApp] 🔄 Forgot Login clicked - Generating QR code...');
        toast.info('🔄 Disconnecting and generating new QR code...', { duration: 3000 });
        try {
            const response = await fetch('/api/whatsapp/disconnect', {
                method: 'POST'
            });
            if (response.ok) {
                console.log('[Admin WhatsApp] ✓ Disconnected successfully');
                toast.success('✓ Disconnected! Generating QR code...', { duration: 2000 });
                setTimeout(() => {
                    console.log('[Admin WhatsApp] 🔄 Reconnecting to show QR...');
                    handleReconnect();
                }, 500);
            } else {
                console.error('[Admin WhatsApp] ❌ Disconnect failed');
                toast.error('Failed to disconnect. Trying to reconnect...');
                handleReconnect();
            }
        } catch (error) {
            console.error('[Admin WhatsApp] ❌ Forgot login error:', error);
            toast.error('Error occurred. Attempting to show QR code...');
            handleReconnect();
        }
    };

    const handleSend = async () => {
        if (!formData.senderName.trim()) {
            toast.error('Please enter sender name');
            return;
        }

        if (!formData.senderPhone.trim()) {
            toast.error('Please enter sender phone number');
            return;
        }

        if (!formData.message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (whatsappStatus?.status !== 'CONNECTED') {
            toast.error('WhatsApp is not connected. Please scan QR code first.');
            return;
        }

        setLoading(true);
        setStats(null);

        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/admin/whatsapp/bulk-send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    senderName: formData.senderName,
                    senderPhone: formData.senderPhone,
                    message: formData.message,
                    messageLanguage: formData.messageLanguage
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStats({ success: data.sent, failed: data.failed });
                toast.success(`Messages sent! Success: ${data.sent}, Failed: ${data.failed}`);
                setFormData({ ...formData, message: '' });
            } else {
                toast.error(data.error || 'Failed to send messages');
            }
        } catch (error) {
            console.error('Bulk send error:', error);
            toast.error('Error sending messages');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = () => {
        switch (whatsappStatus?.status) {
            case 'CONNECTED':
                return <Wifi className="w-6 h-6 text-green-600" />;
            case 'SCAN_QR':
                return <QrCode className="w-6 h-6 text-blue-600" />;
            case 'CONNECTING':
                return <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />;
            default:
                return <WifiOff className="w-6 h-6 text-red-600" />;
        }
    };

    const getStatusText = () => {
        switch (whatsappStatus?.status) {
            case 'CONNECTED':
                return 'Connected';
            case 'SCAN_QR':
                return 'Scan QR Code';
            case 'CONNECTING':
                return 'Connecting...';
            default:
                return 'Disconnected';
        }
    };

    const getStatusDescription = () => {
        switch (whatsappStatus?.status) {
            case 'CONNECTED':
                return 'Ready to send messages';
            case 'SCAN_QR':
                return 'Scan the QR code below with WhatsApp';
            case 'CONNECTING':
                return 'Please wait...';
            default:
                return 'Click Reconnect to start';
        }
    };

    const getPreviewMessage = () => {
        const greeting = formData.messageLanguage === 'hi' ? 'नमस्ते' : 'Hello';
        const regards = formData.messageLanguage === 'hi' ? 'सादर' : 'Regards';
        const team = formData.messageLanguage === 'hi' ? '- विप्रकर्म टीम' : '- VipraKarma Team';
        const senderNamePlaceholder = formData.messageLanguage === 'hi' ? '[प्रेषक का नाम]' : '[Sender Name]';
        const senderPhonePlaceholder = formData.messageLanguage === 'hi' ? '[प्रेषक का फोन]' : '[Sender Phone]';

        return `${greeting},\n\n${formData.message}\n\n${regards},\n${formData.senderName || senderNamePlaceholder}\n${formData.senderPhone || senderPhonePlaceholder}\n${team}`;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-green-600" />
                    <div>
                        <h1 className="text-3xl font-bold">{t('admin.whatsapp.title')}</h1>
                        <p className="text-gray-600">{t('admin.whatsapp.subtitle')}</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleForgotLogin} variant="outline" className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                        <QrCode className="w-4 h-4" />
                        {t('admin.whatsapp.forgotLogin')}
                    </Button>

                    <Button onClick={handleReconnect} variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        {t('admin.whatsapp.reconnect')}
                    </Button>
                </div>
            </div>

            {/* WhatsApp Connection Status */}
            <Card className={`p-6 ${whatsappStatus?.status === 'CONNECTED' ? 'bg-green-50 border-green-200' : whatsappStatus?.status === 'SCAN_QR' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {getStatusIcon()}
                        <div>
                            <h3 className="font-semibold text-lg">{t('admin.whatsapp.status')}: {getStatusText()}</h3>
                            <p className="text-sm text-gray-600">{getStatusDescription()}</p>
                        </div>
                    </div>
                </div>

                {/* QR Code Display */}
                {whatsappStatus?.status === 'SCAN_QR' && whatsappStatus?.qr && (
                    <div className="mt-6 flex flex-col items-center gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                            <QRCode value={whatsappStatus.qr} size={256} />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-blue-600">{t('admin.whatsapp.scanQRWithWhatsApp')}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {t('admin.whatsapp.scanInstructions')}
                            </p>
                        </div>
                    </div>
                )}
            </Card>

            {/* Bulk Messaging Form */}
            <Card className="p-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="senderName">{t('admin.whatsapp.senderName')} *</Label>
                            <Input
                                id="senderName"
                                placeholder={t('admin.whatsapp.senderNamePlaceholder')}
                                value={formData.senderName}
                                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="senderPhone">{t('admin.whatsapp.senderPhone')} *</Label>
                            <Input
                                id="senderPhone"
                                type="tel"
                                placeholder={t('admin.whatsapp.senderPhonePlaceholder')}
                                value={formData.senderPhone}
                                onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="messageLanguage">{t('admin.whatsapp.messageLanguage')} *</Label>
                            <select
                                id="messageLanguage"
                                value={formData.messageLanguage}
                                onChange={(e) => setFormData({ ...formData, messageLanguage: e.target.value as 'en' | 'hi' })}
                                className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="en">{t('admin.whatsapp.english')}</option>
                                <option value="hi">{t('admin.whatsapp.hindi')}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="message">{t('admin.whatsapp.message')} *</Label>
                            {formData.messageLanguage === 'hi' && (
                                <Button
                                    type="button"
                                    onClick={handleAutoTranslate}
                                    disabled={translating || !formData.message.trim()}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    {translating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Languages className="w-4 h-4" />
                                    )}
                                    {t('admin.whatsapp.autoTranslate')}
                                </Button>
                            )}
                        </div>
                        <Textarea
                            id="message"
                            placeholder={t('admin.whatsapp.messagePlaceholder')}
                            rows={8}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {formData.messageLanguage === 'hi'
                                ? t('admin.whatsapp.tipHindi')
                                : t('admin.whatsapp.tipEnglish')}
                        </p>
                    </div>

                    {formData.message && (
                        <Card className="p-4 bg-gray-50 border-2 border-dashed">
                            <h3 className="font-semibold mb-2">{t('admin.whatsapp.messagePreview')} ({formData.messageLanguage === 'hi' ? t('admin.whatsapp.previewHindi') : t('admin.whatsapp.previewEnglish')}):</h3>
                            <div className="text-sm whitespace-pre-wrap">
                                {getPreviewMessage()}
                            </div>
                        </Card>
                    )}

                    <Button
                        onClick={handleSend}
                        disabled={loading || whatsappStatus?.status !== 'CONNECTED'}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t('admin.whatsapp.sending')}
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                {t('admin.whatsapp.sendToAll')}
                            </>
                        )}
                    </Button>

                    {stats && (
                        <Card className="p-4 bg-green-50 border-green-200">
                            <div className="flex items-center gap-4">
                                <Users className="w-8 h-8 text-green-600" />
                                <div>
                                    <h3 className="font-semibold text-lg">{t('admin.whatsapp.deliveryReport')}</h3>
                                    <p className="text-sm text-gray-600">
                                        ✅ {t('admin.whatsapp.successfullySent')} <span className="font-semibold text-green-600">{stats.success}</span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        ❌ {t('admin.whatsapp.failed')} <span className="font-semibold text-red-600">{stats.failed}</span>
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    How It Works
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Messages are sent from YOUR WhatsApp number (the one you scan)</li>
                    <li>Completely FREE - no per-message costs</li>
                    <li>Choose message language: English or Hindi</li>
                    <li>Auto-translate feature for Hindi messages</li>
                    <li>1-second delay between messages to avoid blocking</li>
                    <li>Only users with registered phone numbers receive messages</li>
                    <li>QR scan needed only once - stays connected</li>
                </ul>
            </Card>
        </div>
    );
}
