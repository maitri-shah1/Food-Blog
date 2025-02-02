const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const main = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(" Connected to MongoDB");
    } catch (error) {
        console.error(" MongoDB Connection Error:", error.message);
        process.exit(1); // Exit process if connection fails
    }
};

// Call main to connect to MongoDB
main();

// Initialize database data
const initDB = async () => {
    try {
        await Listing.deleteMany({});
        await Listing.insertMany(initData.data);
        console.log(" Data initialized");
    } catch (error) {
        console.error(" Data Initialization Error:", error.message);
    }
};

initDB();
