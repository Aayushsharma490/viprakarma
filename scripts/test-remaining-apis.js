const BASE_URL = 'http://localhost:3000';

async function testAPI(name, url, options = {}) {
    console.log(`\n[TEST] ${name}`);
    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok) {
            console.log(`✅ SUCCESS (${response.status})`);
        } else {
            console.log(`❌ FAILED (${response.status})`);
            console.log('Error:', JSON.stringify(data, null, 2));
        }
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        console.log(`❌ ERROR:`, error.message);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('TESTING REMAINING APIS');
    console.log('='.repeat(60));

    // Test 1: Admin Subscriptions
    await testAPI(
        'Admin Subscriptions (GET)',
        `${BASE_URL}/api/admin/subscriptions`
    );

    // Test 2: Create Astrologer
    await testAPI(
        'Create Astrologer (POST)',
        `${BASE_URL}/api/astrologers`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Astrologer',
                email: 'test.astrologer@example.com',
                password: 'password123',
                phone: '+919999999999',
                specializations: ['Vedic', 'Tarot'],
                experience: 5,
                hourlyRate: 1000,
                languages: 'Hindi, English',
                location: 'Delhi',
                bio: 'Test bio',
                photo: '' // Optional
            })
        }
    );

    console.log('\n' + '='.repeat(60));
    console.log('TESTING COMPLETE');
    console.log('='.repeat(60));
}

runTests().catch(console.error);
