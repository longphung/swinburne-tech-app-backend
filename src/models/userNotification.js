//const { number, boolean } = require("joi");
import mongoose from "mongoose";
const userNotificationSchema = new mongoose.Schema({
    userNotificationId:{
        type: Number,
        required: true,
    },
    userId:{
        type: Number,
        required: true,
    },
    notificationType:{
        type: Number,
        required: true,
    },
    phone:{
        type: Number,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },

    notificationTypeId:{
        type: Number,
        required: true,
       
    },
    
});

export default mongoose.model("User_Notification", userNotificationSchema);