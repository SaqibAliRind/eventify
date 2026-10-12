const submitConsultation = async () => {
    try {
        console.log("Submitting test consultation...");
        const response = await fetch('http://localhost:9000/user/consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test User " + Date.now(),
                email: "test@example.com",
                phone: "1234567890",
                eventDate: "2025-12-31",
                eventType: "wedding",
                message: "This is a test message from the verification script."
            })
        });

        const data = await response.json();
        console.log("Submission Status:", response.status);
        console.log("Submission Response:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Submission Error:", error.message);
    }
};

submitConsultation();
