const fetchConsultations = async () => {
    try {
        console.log("Fetching consultations...");
        const response = await fetch('http://localhost:9000/admin/consultations');

        const data = await response.json();
        console.log("Fetch Status:", response.status);
        if (data.success) {
            console.log("Fetched " + data.data.length + " consultations.");
            console.log("First item:", JSON.stringify(data.data[0], null, 2));
        } else {
            console.log("Fetch Failed:", data.message);
        }

    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
};

fetchConsultations();
