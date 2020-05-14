const mongoose = require('mongoose');

const tokenSchema = {
    _id: mongoose.SchemaTypes.ObjectId,
    userId: { type: String, require: true, unique: false},
    refreshToken: { type: String, require: true, unique: true}
}

module.exports = mongoose.model('Token', tokenSchema, "1")