const createTestCategory = async () => {
    try {
        console.log("Attempting to create category 'TestCategory_" + Date.now() + "'...");

        const response = await fetch('http://localhost:9000/admin/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Auth header might be needed if middleware is active, but it looked commented out.
                // If it fails with 401, we know middleware is active.
            },
            body: JSON.stringify({
                categoryName: "TestCategory_" + Date.now()
            })
        });

        console.log("Response Status:", response.status);

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            console.log("Response Data:", JSON.stringify(data, null, 2));
        } catch (e) {
            console.log("Response Text (Not JSON):", text);
        }

    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
};

createTestCategory();
