import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const fixIndexes = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.DATABASE);
        console.log("Connected.");

        const collection = mongoose.connection.collection('categories');

        console.log("Listing indexes...");
        const indexes = await collection.indexes();
        console.log("Current indexes:", indexes);

        const nameIndex = indexes.find(idx => idx.key.name === 1);

        if (nameIndex) {
            console.log(`Dropping index: ${nameIndex.name}...`);
            await collection.dropIndex(nameIndex.name);
            console.log("Index dropped successfully.");
        } else {
            console.log("Index 'name_1' not found. It might have already been dropped.");
        }

        console.log("Disconnecting...");
        await mongoose.disconnect();
        console.log("Done.");

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

fixIndexes();
