//const { number} = require("joi");
import mongoose from "mongoose";
const urgencySchema = new mongoose.Schema({
    urgencyId:{
        type: Number,
        required: true,
    },
    description:{
        type: String,
        required: true,
        enum: ['low','medium','high','critical','planned']
    },
});

export default mongoose.model("Urgency", urgencySchema);