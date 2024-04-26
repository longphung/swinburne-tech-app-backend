//const { number} = require("joi");
import mongoose from "mongoose";
const priorityTypeSchema = new mongoose.Schema({
    priority:{
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                // Checking if the value is an integer between 1 and 5
                return Number.isInteger(value) && value >= 1 && value <= 5;
            },
        },
    dueInDays:{
        type: Number,
        required: true,
    },
    priceModifier:{
        type: Number,
        required:true,
    }
}
});

export default mongoose.model("Priority_Type", priorityTypeSchema);