
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
    console.log("Running Verification with User's AstroSage Data...");

    // Boy: aayush, 19/1/2006, 09:40:00, Ajmer (74.62, 26.44)
    // Girl: dipti, 20/2/2009, 10:30:00, Udaipur (75.46, 27.71 - AstroSage Coords)

    try {
        const matchResult = await postRequest('/api/kundali-matching', {
            person1: {
                name: "aayush",
                dateOfBirth: "2006-01-19",
                timeOfBirth: "09:40:00",
                placeOfBirth: { latitude: 26.44, longitude: 74.62 }
            },
            person2: {
                name: "dipti",
                dateOfBirth: "2009-02-20", // The CORRECT date from AstroSage input
                timeOfBirth: "10:30:00",
                placeOfBirth: { latitude: 27.71, longitude: 75.46 } // The CORRECT coords from AstroSage
            }
        });

        console.log("\n=== MATCHING RESULT ===");
        console.log(`Total Score: ${matchResult.totalScore} / 36`);

        console.log("\n--- Details ---");
        matchResult.details.forEach(d => {
            console.log(`${d.name}: ${d.score} / ${d.maxScore}`);
        });

        console.log("\n--- Girl Details ---");
        console.log("Moon Sign:", matchResult.girlDetails.moonSign);
        console.log("Nakshatra Paya:", matchResult.girlDetails.nakshatraPaya);
        console.log("Ishta Kaal:", matchResult.girlDetails.ishtaKaal);

        if (Math.round(matchResult.totalScore) === 25) {
            console.log("\n✅ SUCCESS: Matched AstroSage Score (25)!");
        } else {
            console.log(`\n❌ MISMATCH: Expected 25, got ${matchResult.totalScore}`);
        }

    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}

runTests();
