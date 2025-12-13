const BASE_URL = 'http://localhost:3000';

async function testAPI(name, url, options = {}) {
    console.log(`\n[TEST] ${name}`);
    console.log(`URL: ${url}`);
    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok) {
            console.log(`✅ SUCCESS (${response.status})`);
            console.log('Response:', JSON.stringify(data, null, 2));
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
    console.log('COMPREHENSIVE API TESTING');
    console.log('='.repeat(60));

    // Test 1: Consultation Request (POST)
    await testAPI(
        'Create Consultation Request',
        `${BASE_URL}/api/consultations`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 1,
                astrologerId: null,
                type: 'chat',
                formData: {
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '+919999999999',
                    dob: '1990-01-01',
                    timeOfBirth: '10:00',
                    placeOfBirth: 'Delhi',
                    concerns: 'Test consultation'
                }
            })
        }
    );

    // Test 2: Payment Verification (POST)
    await testAPI(
        'Submit Payment Verification',
        `${BASE_URL}/api/payment/verify`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 1,
                consultationId: 1,
                amount: 500,
                paymentDetails: {
                    paymentMethod: 'UPI',
                    payerName: 'Test User',
                    phoneNumber: '+919999999999',
                    transactionId: 'TEST123456'
                }
            })
        }
    );

    // Test 3: Astrologers List (GET)
    await testAPI(
        'Get Astrologers List',
        `${BASE_URL}/api/astrologers`
    );

    // Test 4: Pooja Booking (POST)
    await testAPI(
        'Create Pooja Booking',
        `${BASE_URL}/api/pooja-booking`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 1,
                poojaName: 'Satyanarayan Pooja',
                description: 'Test pooja booking',
                date: '2024-12-25',
                time: '10:00 AM',
                location: 'Test Location',
                purpose: 'Test Purpose',
                phone: '+919999999999',
                email: 'test@example.com',
                occasion: 'Test Occasion'
            })
        }
    );

    // Test 5: Admin Dashboard (GET) - without auth
    await testAPI(
        'Admin Dashboard Stats (No Auth)',
        `${BASE_URL}/api/admin/dashboard`
    );

    console.log('\n' + '='.repeat(60));
    console.log('TESTING COMPLETE');
    console.log('='.repeat(60));
}

runTests().catch(console.error);
