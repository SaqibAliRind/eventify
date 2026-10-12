const testFetch = async () => {
    try {
        console.log("Attempting to fetch categories...");
        const response = await fetch('http://localhost:9000/admin/categories');
        console.log("Response Status:", response.status);

        if (response.ok) {
            const data = await response.json();
            console.log("Response Data:", JSON.stringify(data, null, 2));
        } else {
            console.log("Response Text:", await response.text());
        }
    } catch (error) {
        console.error("Fetch Error:", error.message);
        if (error.cause) {
            console.error("Error Cause:", error.cause);
        }
    }
};

testFetch();
