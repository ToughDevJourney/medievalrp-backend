const mongoose = require('mongoose');

const tokenSchema = {
    _id: mongoose.SchemaTypes.ObjectId,
    userId: { type: mongoose.SchemaTypes.ObjectId, required: true, unique: false, ref: 'User'},
    refreshToken: { type: String, required: true, unique: true},
    email: { type: String, required: false, unique: false}

}

module.exports = mongoose.model('Token', tokenSchema, "token-2")