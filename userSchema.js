const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    userId:{
        type: Integer,
        required: true,
    },
    userName:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        required: true,
    },

    name:{
        type: String,
        required: true,
    },
    address:{
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("User",UserSchema);