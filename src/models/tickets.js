//const { number } = require("joi");
import mongoose from "mongoose";
const ticketSchema = new mongoose.Schema({
    
    serviceId:{
        type: Number,
        required: true,
    },
    ticketId:{
        type: Number,
        required: true,
    },
    cusotmerId:{
        type: Number,
        required: true,
    },
    dueDate:{
        type: Number,
        required: true,
        
    },
    purchaseDate:{
        type: Number,
        required: true,
        
    },
    priorityCompletionDate:{
        type: Number,
        required: true,
    },
    
    assignedTo:{
        type: String,
        required: true,
    },
    note:{
        type: String,
        required: true,
    },
    urgency:{
        type: String,
        required: true,
    },
    time:{
        type: Date,
        required: true,
    },
    refundFlag:{
        type: Number,
        required: true,
    },
    technicianId:{
        type: Number,
        required: true,
    },
    address:{
        type: String,
        required: true
    }

    
},{timestamps:true});

export default mongoose.model("Tickets", ticketSchema);