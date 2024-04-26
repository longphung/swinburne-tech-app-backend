//const { number, boolean } = require("joi");
import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    userId:{
        type: Number,
        required: true,
    },
    notificationType:{
        type: String,
        required: true,
    },
    seen:{
        type: Boolean,
        required: true,
        
    },
    
});

export default mongoose.model("Notifications", notificationSchema);