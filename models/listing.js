const { builtinModules } = require("module");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    image: {
        type: String,
        required:true,
    },
    category:{
        type: String,
        required:true,
    },
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;