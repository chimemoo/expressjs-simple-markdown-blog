const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    registerAt: {
        type: Date,
        default: Date.now
    },
    name: String,
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);