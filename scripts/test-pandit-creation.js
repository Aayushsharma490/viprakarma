const BASE_URL = 'http://localhost:3000';

async function testPanditCreation() {
    console.log('='.repeat(60));
    console.log('TESTING PANDIT CREATION');
    console.log('='.repeat(60));

    const testPandit = {
        name: 'Test Pandit',
        email: 'test.pandit@example.com',
        password: 'password123',
        phone: '+919876543210',
        specializations: ['Vedic Astrology', 'Tarot'],
        experience: 10,
        hourlyRate: 1500,
        languages: 'Hindi, English',
        location: 'Mumbai',
        bio: 'Experienced astrologer with 10 years of practice',
        photo: ''
    };

    console.log('\n📝 Test Data:');
    console.log(JSON.stringify(testPandit, null, 2));

    try {
        const response = await fetch(`${BASE_URL}/api/astrologers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPandit)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('\n✅ SUCCESS - Pandit created!');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('\n❌ FAILED');
            console.log('Status:', response.status);
            console.log('Error:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
    }

    console.log('\n' + '='.repeat(60));
}

testPanditCreation().catch(console.error);
