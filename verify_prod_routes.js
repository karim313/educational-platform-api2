const main = async () => {
    const baseUrl = 'https://educational-platform-api2-production.up.railway.app';
    const loginUrl = `${baseUrl}/api/auth/login`;

    console.log(`Checking ${loginUrl}...`);

    // 1. Test GET request (Expected 404)
    try {
        const res = await fetch(loginUrl, { method: 'GET' });
        const data = await res.json();
        console.log(`[GET] Status: ${res.status}`);
        console.log(`[GET] Body:`, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('[GET] Failed:', err);
    }

    // 2. Test POST request (Expected 400 or 401 if route exists)
    try {
        const res = await fetch(loginUrl, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'test' })
        });
        const data = await res.json();
        console.log(`[POST] Status: ${res.status}`);
        console.log(`[POST] Body:`, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('[POST] Failed:', err);
    }
};

main();
