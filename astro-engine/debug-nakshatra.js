
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
    console.log("Debugging Nakshatras...");

    try {
        const matchResult = await postRequest('/api/kundali-matching', {
            person1: {
                name: "aayush",
                dateOfBirth: "1998-11-06", // 6 Nov 1998
                timeOfBirth: "09:30:00",
                placeOfBirth: { latitude: 26.44, longitude: 74.62 }
            },
            person2: {
                name: "dipti",
                dateOfBirth: "2006-01-12", // 12 Jan 2006
                timeOfBirth: "05:30:00",
                placeOfBirth: { latitude: 27.71, longitude: 75.46 }
            },
            // Debug flag if server supports it, or just relying on logs/details
        });

        // We expect the details in the matchResult if we can infer them?
        // Actually /kundali-matching returns `girlDetails` and `boyDetails` with some info?
        // In the server code, `girlDetails` has `nakshatraPaya`. It might not have Nakshatra Name explicitly.
        // But we can infer from the /kundali endpoint.

        const boyKundali = await postRequest('/kundali', {
            name: "aayush", year: 1998, month: 11, day: 6, hour: 9, minute: 30, latitude: 26.44, longitude: 74.62, timezone: 5.5
        });

        const girlKundali = await postRequest('/kundali', {
            name: "dipti", year: 2006, month: 1, day: 12, hour: 5, minute: 30, latitude: 27.71, longitude: 75.46, timezone: 5.5
        });

        console.log("\n--- Boy (Aayush) ---");
        console.log(`Nakshatra: ${boyKundali.enhancedDetails.nakshatra}`);
        console.log(`From Planets: ${boyKundali.planets.find(p => p.name === 'Moon').nakshatra.name} (${boyKundali.planets.find(p => p.name === 'Moon').nakshatra.index})`);

        console.log("\n--- Girl (Dipti) ---");
        console.log(`Nakshatra: ${girlKundali.enhancedDetails.nakshatra}`);
        console.log(`From Planets: ${girlKundali.planets.find(p => p.name === 'Moon').nakshatra.name} (${girlKundali.planets.find(p => p.name === 'Moon').nakshatra.index})`);

    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}

runTests();
