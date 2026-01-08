/**
 * Get current location using browser geolocation API
 * Returns latitude, longitude, and city name via reverse geocoding
 */
export async function getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    city: string;
    error?: string;
}> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({
                latitude: 0,
                longitude: 0,
                city: '',
                error: 'Geolocation not supported by your browser'
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Reverse geocode to get city name using OpenStreetMap Nominatim
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        {
                            headers: {
                                'User-Agent': 'VipraKarma Astrology Platform'
                            }
                        }
                    );
                    const data = await response.json();
                    const city = data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        data.address?.state_district ||
                        'Unknown Location';

                    resolve({ latitude, longitude, city });
                } catch (error) {
                    // If reverse geocoding fails, still return coordinates
                    resolve({ latitude, longitude, city: 'Unknown Location' });
                }
            },
            (error) => {
                let errorMessage = 'Could not get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                }
                resolve({
                    latitude: 0,
                    longitude: 0,
                    city: '',
                    error: errorMessage
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}
