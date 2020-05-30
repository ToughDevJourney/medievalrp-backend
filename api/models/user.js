const mongoose = require('mongoose');

const userSchema = {
    _id: mongoose.SchemaTypes.ObjectId,
    email: { type: String, required: true, unique: true, minlength: 7, maxlength: 50, match: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/},
    password: {type: String, required: true},
    nickname: {type: String, required: true, unique: true, minlength: 4, maxlength: 30, match: /^[а-яА-Яa-zA-Z0-9-_]+$/},
    skin: {type: String, required: true, default: "poor-peasant"},
    role: {type: String, required: true, default: "peasant"},
    banned: {type: Boolean, required: true, default: false}
}

module.exports = mongoose.model('User', userSchema, "user-6")