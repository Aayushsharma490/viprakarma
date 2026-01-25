
const http = require('http');

function postRequest(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 5005,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
            },
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => (responseBody += chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(responseBody));
                } catch (e) {
                    resolve(responseBody);
                }
            });
        });

        req.on('error', (error) => reject(error));
        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log("Running Verification Tests...");

    // Test Case 1: Early Morning Birth (Before Sunrise)
    // Date: 2023-10-24 (Tuesday). Sunrise approx 6:30 AM.
    // Birth Time: 04:00 AM.
    // Expected Day: Monday (since it's before sunrise)
    console.log("\nTest 1: Vedic Day Calculation (Before Sunrise)");
    try {
        const result1 = await postRequest('/kundali', {
            name: "TestUser",
            year: 2023,
            month: 10,
            day: 24,
            hour: 4,
            minute: 0,
            second: 0,
            latitude: 28.61, // Delhi
            longitude: 77.23,
            timezone: 5.5
        });

        console.log(`Input Date: 2023-10-24 (Tuesday) 04:00 AM`);
        console.log(`Sunrise: ${result1.enhancedDetails.sunrise}`);
        console.log(`Calculated Day: ${result1.enhancedDetails.dayOfWeek}`);

        if (result1.enhancedDetails.dayOfWeek === 'Monday') {
            console.log("✅ PASS: Day is Monday (Previous Day)");
        } else {
            console.log("❌ FAIL: Day should be Monday");
        }

        // Check Nakshatra Paya
        console.log(`Moon House: ${result1.planets.find(p => p.name === 'Moon').house}`);
        console.log(`Nakshatra Paya: ${result1.enhancedDetails.nakshatraPaya}`);

    } catch (e) {
        console.error("Test 1 Failed:", e.message);
    }

    // Test Case 2: Matching
    console.log("\nTest 2: Kundali Matching Consistency");
    try {
        const matchResult = await postRequest('/api/kundali-matching', {
            person1: {
                name: "Boy",
                dateOfBirth: "1995-12-10",
                timeOfBirth: "10:30:00",
                placeOfBirth: { latitude: 28.61, longitude: 77.23 }
            },
            person2: {
                name: "Girl",
                dateOfBirth: "1997-08-15",
                timeOfBirth: "14:20:00",
                placeOfBirth: { latitude: 28.61, longitude: 77.23 }
            }
        });

        console.log(`Total Score: ${matchResult.totalScore}`);
        console.log(`Bhakoot Score: ${matchResult.details.find(d => d.name.includes('Bhakoot')).score}`);
        console.log(`Yoni Score: ${matchResult.details.find(d => d.name.includes('Yoni')).score}`);
        console.log("✅ Matching executed without error");
    } catch (e) {
        console.error("Test 2 Failed:", e.message);
    }
}

runTests();
