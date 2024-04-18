const mongoose = require("mongoose");
const serviceSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    serviceId:{
        type: integer,
        required: true,
    },
    label:{
        type: String,
        required: true,
    },
    price:{
        type: float,
        required: true,
    },
    category:{
        type: integer,
        required: true,
        validate: {
            validator: function(value) {
                // Checking if the value is an integer between 1 and 6
                return Number.isInteger(value) && value >= 1 && value <= 6;
            },
            message: props => '${props.value} is not a valid category. Category must be an integer between 1 and 6.'
        }
    },
    serviceType:{
        type: String,
        required: true,
        enum: ['onsite','remote','both']
    },
    description:{
        type: String,
        required: true,
    },
    
});

module.exports = mongoose.model("Services",serviceSchema);