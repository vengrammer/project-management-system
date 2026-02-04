import mongoose from "mongoose";

const testingSchema  = new mongoose.Schema({
    testing: {type: String},
    nametesting: {type: String}
})

const Testing = mongoose.model("Testing", testingSchema);
export default Testing;