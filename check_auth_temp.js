const main = async () => {
    const url = 'https://educational-platform-api2-production.up.railway.app/api/auth/register';
    const body = {
        name: "Karim",
        email: "karim2004@example.com",
        password: "password123",
        role: "student"
    };

    console.log("Attempting to register...");
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
};

main();
