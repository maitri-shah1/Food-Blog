require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const multer = require("multer");

const app = express();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "/public/images"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Connect to MongoDB
async function main() {
    const dbUrl = process.env.ATLASDB_URL;
    if (!dbUrl) {
        console.error("MongoDB connection string is missing in environment variables.");
        process.exit(1); // Exit process if DB URL is missing
    }
    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");
}

main().catch(err => console.log("MongoDB Connection Error:", err));

// Middleware and Settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Home Route
app.get("/", (req, res) => {
    res.render("home/index.ejs");
});

app.get("/delicacies", (req, res) => {
    res.render("delicacies/index.ejs");
});

app.get("/submit", (req, res) => {
    res.render("submit/index.ejs");
});

app.get("/hacks", (req, res) => {
    res.render("hacks/index.ejs");
});

// Handle form submission
app.post("/submit", upload.single("image"), async (req, res) => {
    try {
        const { email, recipeName, description, ingredients, category } = req.body;

        if (!req.file) {
            return res.status(400).send("File upload failed. Please ensure you select a valid file.");
        }

        const image = req.file.filename;
        const ingredientsArray = (ingredients || "").split(",").map(ing => ing.trim());

        const newListing = new Listing({
            email,
            title: recipeName,
            description,
            ingredients: ingredientsArray,
            category,
            image
        });

        await newListing.save();
        res.redirect(`/cuisine/${category}`);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Error submitting recipe. Please try again.");
    }
});

// Route to Display All Dishes of a Category
app.get("/cuisine/:category", async (req, res) => {
    const { category } = req.params;
    try {
        const dishes = await Listing.find({ category });
        if (dishes.length === 0) {
            return res.status(404).send("No dishes found for this category.");
        }
        res.render("cuisine/index", { category, dishes });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// Route to Display a Single Dish
app.get("/cuisine/:category/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const dish = await Listing.findById(id);
        if (!dish) {
            return res.status(404).send("Dish not found");
        }
        res.render("cuisine/show", { dish });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Start the server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
