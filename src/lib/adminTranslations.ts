/**
 * Admin-specific translations for Hindi/English
 */

export const adminTranslations = {
    en: {
        // Navbar
        dashboard: 'Dashboard',
        pandits: 'Pandits',
        subscriptions: 'Subscriptions',
        whatsapp: 'WhatsApp',
        logout: 'Logout',

        // Dashboard
        adminPanel: 'Viprakarma Admin',
        managePlatform: 'Manage your astrology platform',
        home: 'Home',
        totalUsers: 'Total Users',
        astrologers: 'Astrologers',
        bookings: 'Bookings',
        payments: 'Payments',
        revenue: 'Revenue',
        overview: 'Overview',
        recentBookings: 'Recent Bookings',
        paymentVerifications: 'Payment Verifications',
        userManagement: 'User Management',
        managePandits: 'Manage Pandits',
        whatsappMessaging: 'WhatsApp Messaging',

        // Common
        loading: 'Loading...',
        success: 'Success',
        error: 'Error',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
    },
    hi: {
        // Navbar
        dashboard: 'डैशबोर्ड',
        pandits: 'पंडित',
        subscriptions: 'सदस्यता',
        whatsapp: 'व्हाट्सएप',
        logout: 'लॉगआउट',

        // Dashboard
        adminPanel: 'विप्रकर्म एडमिन',
        managePlatform: 'अपने ज्योतिष मंच का प्रबंधन करें',
        home: 'होम',
        totalUsers: 'कुल उपयोगकर्ता',
        astrologers: 'ज्योतिषी',
        bookings: 'बुकिंग',
        payments: 'भुगतान',
        revenue: 'राजस्व',
        overview: 'अवलोकन',
        recentBookings: 'हाल की बुकिंग',
        paymentVerifications: 'भुगतान सत्यापन',
        userManagement: 'उपयोगकर्ता प्रबंधन',
        managePandits: 'पंडित प्रबंधन',
        whatsappMessaging: 'व्हाट्सएप संदेश',

        // Common
        loading: 'लोड हो रहा है...',
        success: 'सफलता',
        error: 'त्रुटि',
        save: 'सहेजें',
        cancel: 'रद्द करें',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        add: 'जोड़ें',
        search: 'खोजें',
        filter: 'फ़िल्टर',
        export: 'निर्यात',
        import: 'आयात',
    }
};

export type AdminTranslationKey = keyof typeof adminTranslations.en;
