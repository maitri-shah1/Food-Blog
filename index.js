require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); 
const path = require("path");
const ejsMate = require("ejs-mate");

const app = express();


const multer = require("multer");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "/public/images"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Handle form submission
app.post("/submit", upload.single("image"), async (req, res) => {
    try {
        const { email, recipeName, description, ingredients, category } = req.body;

        if (!req.file) {
            return res.status(400).send("File upload failed. Please ensure you select a valid file.");
        }

        const image = req.file.filename;

        // Split ingredients into an array
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


// Connect to MongoDB
async function main() {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    
}
main().then(() => {
    console.log("Connected to MongoDB");
}).catch(err => console.log("MongoDB Connection Error:", err));

// Middleware and Settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
// app.use(express.static('public'));

// Home Route
app.get("/", (req, res) => {
    res.render("home/index.ejs"); // Assuming home/index.ejs exists
});

app.get('/delicacies', (req, res) => {
    res.render("\delicacies/index.ejs");
});


app.get("/submit" , (req,res) => {
    res.render("\submit/index.ejs");
});

app.get("/hacks" , (req,res) => {
    res.render("\hacks/index.ejs");
});

// Route to Display All Dishes of a Category
app.get("/cuisine/:category", async (req, res) => {
    const { category } = req.params;
    try {
        const dishes = await Listing.find({ category: category }); // Fetch dishes by category
        if (dishes.length === 0) {
            res.status(404).send("No dishes found for this category.");
        } else {
            res.render("cuisine/index", { category, dishes }); // Renders cuisine/index.ejs
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// Route to Display a Single Dish
app.get("/cuisine/:category/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const dish = await Listing.findById(id); // Fetch dish by ID
        if (!dish) {
            return res.status(404).send("Dish not found");
        }
        res.render("cuisine/show", { dish }); // Renders cuisine/show.ejs
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


// Server Start
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
