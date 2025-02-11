require("dotenv").config(); // Load .env file (only needed for local development)

const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const multer = require("multer");

const app = express();

async function main() {
    const dbUrl = process.env.ATLASDB_URL; // Get from environment variables

    if (!dbUrl) {
        console.error(" MongoDB connection string is missing! Check environment variables.");
        process.exit(1);
    }

    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    console.log(" Connected to MongoDB Atlas!");
}

main().catch(err => console.log(" MongoDB Connection Error:", err));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "/public/images"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


app.get("/", (req, res) => {
    res.render("home/index");
});

app.get("/delicacies", (req, res) => {
    res.render("delicacies/index");
});

app.get("/submit", (req, res) => {
    res.render("submit/index");
});

app.get("/hacks", (req, res) => {
    res.render("hacks/index");
});

app.post("/submit", upload.single("image"), async (req, res) => {
    try {
        const { email, recipeName, description, ingredients, category } = req.body;

        if (!req.file) {
            return res.status(400).send(" File upload failed. Please select a valid file.");
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
        console.error(" Error submitting recipe:", err);
        res.status(500).send(" Error submitting recipe. Please try again.");
    }
});

app.get("/cuisine/:category", async (req, res) => {
    const { category } = req.params;
    try {
        const dishes = await Listing.find({ category });

        if (dishes.length === 0) {
            return res.status(404).send("⚠ No dishes found for this category.");
        }

        res.render("cuisine/index", { category, dishes });
    } catch (err) {
        console.error(" Server Error:", err);
        res.status(500).send(" Server Error.");
    }
});

app.get("/cuisine/:category/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const dish = await Listing.findById(id);

        if (!dish) {
            return res.status(404).send("⚠ Dish not found");
        }

        res.render("cuisine/show", { dish });
    } catch (err) {
        console.error(" Server Error:", err);
        res.status(500).send(" Server Error.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(` Server running on port ${PORT}`);
});
