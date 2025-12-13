
const fetch = require('node-fetch');

async function testKundali() {
    const payload = {
        name: "Test User",
        gender: "male",
        year: 1990,
        month: 5,
        day: 15,
        hour: 10,
        minute: 30,
        second: 0,
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: "+05:30",
        city: "New Delhi"
    };

    try {
        console.log("Calling API...");
        // Direct call to astro-engine to verify backend logic first
        const response = await fetch('http://localhost:3001/kundali', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("Error:", await response.text());
            return;
        }

        const data = await response.json();
        console.log("API Response Recieved.");

        if (data.dashas && data.dashas.mahadashas) {
            console.log("Mahadashas found:", data.dashas.mahadashas.length);
            const firstMaha = data.dashas.mahadashas[0];
            console.log("First Mahadasha Planet:", firstMaha.planet);
            console.log("Has Antardashas?", !!firstMaha.antardashas);
            if (firstMaha.antardashas) {
                console.log("Antardasha count:", firstMaha.antardashas.length);
                console.log("First Antardasha:", firstMaha.antardashas[0]);
            } else {
                console.log("FAIL: No Antardashas found in response.");
            }
        } else {
            console.log("FAIL: No dashas found.");
        }

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testKundali();
