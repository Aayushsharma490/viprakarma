
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
    console.log("Verifying Mangal Dosha...");

    try {
        const matchResult = await postRequest('/api/kundali-matching', {
            person1: {
                name: "aayush",
                dateOfBirth: "2000-01-10",
                timeOfBirth: "09:40:00",
                placeOfBirth: { latitude: 26.44, longitude: 74.62 } // Ajmer
            },
            person2: {
                name: "dipti",
                dateOfBirth: "2005-02-10",
                timeOfBirth: "10:30:00",
                placeOfBirth: { latitude: 27.71, longitude: 75.46 } // Udaipur
            }
        });

        console.log(`Boy Mangal Dosha: ${matchResult.mangalDosha.boy}`);
        console.log(`Girl Mangal Dosha: ${matchResult.mangalDosha.girl}`);
        console.log(`Total Score: ${matchResult.totalScore}`);

    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}

runTests();
